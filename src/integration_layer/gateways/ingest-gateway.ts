/**
 * Genaro DFT 2.0 Ingest Gateways
 * 
 * Implements the API Gateway and Webhooks Hub as per the integration layer architecture.
 */

import express, { Request, Response, NextFunction } from 'express';
import { Kafka, Producer } from 'kafkajs';
import crypto from 'crypto';

declare module 'express-serve-static-core' {
  interface Request {
    rawBody?: string;
  }
}

// Initialize Express app for the gateway
const app = express();
const port = process.env.PORT || 3001;

// Middleware
const captureRawBody = (req: Request, _res: Response, buf: Buffer) => {
  if (buf && buf.length) {
    req.rawBody = buf.toString('utf8');
  }
};

app.use(express.json({ limit: '10mb', verify: captureRawBody }));
app.use(express.raw({ type: 'application/octet-stream', limit: '10mb', verify: captureRawBody }));

// Kafka producer setup
const kafka = new Kafka({
  clientId: 'genaro-ingest-gateway',
  brokers: [process.env.KAFKA_BROKERS || 'localhost:9092']
});

const producer: Producer = kafka.producer();
let producerConnected = false;

// Connect to Kafka on startup
async function initializeProducer() {
  try {
    await producer.connect();
    producerConnected = true;
    console.log('Connected to Kafka successfully');
  } catch (error) {
    console.error('Failed to connect to Kafka:', error);
  }
}

// Initialize producer
initializeProducer();

// Rate limiting and circuit breaker utilities
class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private readonly windowMs: number;
  private readonly maxRequests: number;

  constructor(windowMs: number = 60000, maxRequests: number = 100) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
  }

  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const requests = this.requests.get(identifier) || [];
    
    // Remove requests outside the current window
    const validRequests = requests.filter(timestamp => now - timestamp < this.windowMs);
    
    if (validRequests.length >= this.maxRequests) {
      return false;
    }
    
    validRequests.push(now);
    this.requests.set(identifier, validRequests);
    return true;
  }
}

const rateLimiter = new RateLimiter(60000, 100); // 100 requests per minute

// Authentication middleware
const authenticate = (req: Request, res: Response, next: NextFunction) => {
  // In a real implementation, this would verify OAuth2/OIDC tokens or API keys
  const apiKey = req.headers['x-api-key'] as string;
  const authHeader = req.headers['authorization'] as string;
  
  // For demo purposes, accept any non-empty key
  if (apiKey || (authHeader && authHeader.startsWith('Bearer '))) {
    next();
  } else {
    res.status(401).json({ error: 'Authentication required' });
  }
};

// Webhook signature verification using HMAC
const verifyWebhookSignature = (req: Request, secret: string): boolean => {
  const signature = req.headers['x-signature'] as string;
  if (!signature) return false;

  const expectedSignature = 'sha256=' + 
    crypto.createHmac('sha256', secret)
      .update(req.rawBody || JSON.stringify(req.body))
      .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
};

// API Gateway endpoint for pull APIs
app.post('/ingest/poll/:source', authenticate, async (req: Request, res: Response) => {
  const { source } = req.params;
  const payload = req.body;
  
  // Validate rate limit
  const clientId = req.headers['x-client-id'] as string || req.ip;
  if (!rateLimiter.isAllowed(clientId)) {
    res.status(429).json({ error: 'Rate limit exceeded' });
    return;
  }
  
  try {
    // Validate payload structure
    if (!payload || !payload.external_id || !payload.fetched_at) {
      res.status(400).json({ error: 'Invalid payload structure' });
      return;
    }
    
    // Publish to raw.content.ingested topic
    if (producerConnected) {
      await producer.send({
        topic: 'raw.content.ingested',
        messages: [
          {
            value: JSON.stringify({
              source,
              external_id: payload.external_id,
              fetched_at: payload.fetched_at,
              payload: payload.data
            })
          }
        ]
      });
    }
    
    res.status(202).json({ message: 'Payload accepted for processing' });
  } catch (error) {
    console.error('Error processing poll request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Webhook Hub for push APIs
app.post('/ingest/webhook/:source', async (req: Request, res: Response) => {
  const { source } = req.params;
  const payload = req.body;
  
  // Validate rate limit
  const clientId = req.headers['x-client-id'] as string || req.ip;
  if (!rateLimiter.isAllowed(clientId)) {
    res.status(429).json({ error: 'Rate limit exceeded' });
    return;
  }
  
  // For demo purposes, we'll assume each source has a secret key
  // In reality, this would come from a secure configuration
  const secrets: Record<string, string> = {
    'tiktok': process.env.TIKTOK_WEBHOOK_SECRET || 'default-tiktok-secret',
    'x': process.env.X_WEBHOOK_SECRET || 'default-x-secret',
    'instagram': process.env.INSTAGRAM_WEBHOOK_SECRET || 'default-instagram-secret',
    'youtube': process.env.YOUTUBE_WEBHOOK_SECRET || 'default-youtube-secret'
  };
  
  const secret = secrets[source];
  if (secret) {
    // Verify webhook signature if secret exists
    const isValid = verifyWebhookSignature(req as any, secret);
    if (!isValid) {
      res.status(401).json({ error: 'Invalid webhook signature' });
      return;
    }
  }
  
  try {
    // Validate payload structure
    if (!payload || !source) {
      res.status(400).json({ error: 'Invalid payload structure' });
      return;
    }
    
    // Publish to raw.content.ingested topic
    if (producerConnected) {
      await producer.send({
        topic: 'raw.content.ingested',
        messages: [
          {
            value: JSON.stringify({
              source,
              external_id: payload.id || `ext_${Date.now()}`,
              fetched_at: new Date().toISOString(),
              payload
            })
          }
        ]
      });
    }
    
    res.status(202).json({ message: 'Webhook payload accepted for processing' });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Streaming Ingest endpoint (SSE)
app.get('/ingest/stream/:source', authenticate, (req: Request, res: Response) => {
  const { source } = req.params;
  
  // Set SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Connection': 'keep-alive',
    'Cache-Control': 'no-cache',
    'Access-Control-Allow-Origin': '*'
  });
  
  // Send initial event
  res.write(`data: {"status": "connected", "source": "${source}"}\n\n`);
  
  // Keep connection alive
  const interval = setInterval(() => {
    res.write(`data: {"ping": "${new Date().toISOString()}"}\n\n`);
  }, 30000);
  
  // Handle client disconnect
  req.on('close', () => {
    clearInterval(interval);
  });
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    services: {
      kafka: producerConnected ? 'connected' : 'disconnected'
    }
  });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Gateway error:', err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

const server = app.listen(port, () => {
  console.log(`Genaro DFT Ingest Gateway running at http://localhost:${port}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('Shutting down gracefully...');
  await producer.disconnect();
  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
});

export default app;
