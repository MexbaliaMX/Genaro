const path = require('path');
const express = require('express');
const cors = require('cors');
const { body, param, query, validationResult } = require('express-validator');

function resolveSrcRoot() {
  let dir = __dirname;
  while (path.basename(dir) !== 'src' && path.dirname(dir) !== dir) {
    dir = path.dirname(dir);
  }
  return path.basename(dir) === 'src' ? dir : path.resolve(__dirname);
}

const srcRoot = resolveSrcRoot();

const {
  securityMiddlewares,
  apiLimiter,
  securityMiddleware,
  addSecurityHeaders,
  sanitizeInput,
  validateContentSecurity
} = require(path.join(srcRoot, 'middleware', 'security'));

const {
  ApiError,
  ValidationError,
  httpErrorHandler
} = require(path.join(srcRoot, 'utils', 'error-handling'));

const { SecurityLogger } = require(path.join(srcRoot, 'security', 'audit'));

// Middleware
const app = express();
const port = process.env.PORT || 3000;

// Apply security middleware first
app.use(securityMiddleware); // Helmet security headers
app.use(addSecurityHeaders); // Custom security headers
app.use(cors(securityMiddlewares.corsOptions));

// Rate limiting
app.use('/api/', apiLimiter);

// Body parsing with size limits to prevent large payload attacks
app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf, encoding) => {
    // Security check: log large payloads which might indicate attacks
    if (buf.length > 5 * 1024 * 1024) { // 5MB threshold
      SecurityLogger.log('warn', 'Large payload detected', {
        size: buf.length,
        ip: req.ip,
        url: req.url,
        userAgent: req.get('User-Agent')
      });
    }
  }
}));

app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Apply input sanitization and content validation
app.use(sanitizeInput);
app.use(validateContentSecurity);

// Simple in-memory data store for demonstration (would be a database in production)
const narrativesDb = {
  'nar-global-ops': {
    id: 'nar-global-ops',
    title: 'Global Operations Narrative',
    risk_level: 'elevated',
  }
};

const metricsDb = {
  'nar-global-ops': [
    {
      kpi: 'sentiment_index',
      value: 67.5,
      window: '7d',
      breakdown: {
        'twitter': 0.65,
        'facebook': 0.72,
        'instagram': 0.60
      }
    }
  ]
};

// Error handling middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new ValidationError('Validation failed');
    error.details = errors.array();
    return next(error);
  }
  next();
};

// Health check endpoint (public)
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Security health check endpoint
app.get('/security/health', securityMiddlewares.securityHealthCheck);

// Ingestion endpoint: POST /ingest/webhook/{source}
app.post('/ingest/webhook/:source',
  [
    param('source').isString().trim().notEmpty(),
    body('payload').isObject(),
    body('external_id').isString().notEmpty().trim(),
    body('fetched_at').isISO8601(),
    body('source').optional().isString().trim()
  ],
  handleValidationErrors,
  (req, res) => {
    const { source } = req.params;
    const payload = req.body;

    console.log(`Received webhook from source: ${source}`, payload);

    // Publish to ingestion bus (simulated)
    // In real implementation, this would send to Kafka
    res.status(202).json({ message: 'Accepted for processing' });
  }
);

// Narratives endpoint: GET /narratives/{id}/metrics
app.get('/narratives/:id/metrics',
  [
    param('id').matches(/^[a-z0-9_-]+$/i).withMessage('Invalid narrative id format'),
    query('window').optional().isIn(['1h', '24h', '7d', '30d'])
  ],
  handleValidationErrors,
  (req, res, next) => {
    try {
      const { id } = req.params;

      if (!narrativesDb[id]) {
        return next(new ApiError('Narrative not found', 404));
      }

      const metrics = metricsDb[id] || [];

      res.json({
        narrative_id: id,
        window: req.query.window || '7d',
        metrics: metrics
      });
    } catch (error) {
      next(error);
    }
  }
);

// Apply global error handler
app.use(httpErrorHandler);

// 404 handler
app.use('*', (req, res, next) => {
  next(new ApiError(`Route ${req.originalUrl} not found`, 404));
});

// Start the server
app.listen(port, () => {
  console.log(`Genaro DFT API server with security enhancements is running at http://localhost:${port}`);
  SecurityLogger.log('info', `Genaro DFT API server started on port ${port}`);
});

module.exports = app;
