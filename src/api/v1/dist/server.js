const express = require('express');
const { body, validationResult, param, query } = require('express-validator');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Simple in-memory data store for demonstration
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
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Ingestion endpoint: POST /ingest/webhook/{source}
app.post('/ingest/webhook/:source', 
  [
    param('source').isString().notEmpty(),
    body('source').isString().notEmpty(),
    body('external_id').isString().notEmpty(),
    body('fetched_at').isISO8601(),
    body('payload').isObject()
  ],
  handleValidationErrors,
  (req, res) => {
    const { source } = req.params;
    const payload = req.body;

    // In a real implementation, you would validate the webhook signature here
    console.log(`Received webhook from source: ${source}`, payload);

    // Publish to ingestion bus (simulated)
    // In real implementation, this would send to Kafka
    
    res.status(202).json({ message: 'Accepted for processing' });
  }
);

// Narratives endpoint: GET /narratives/{id}/metrics
app.get('/narratives/:id/metrics',
  [
    param('id').isString().notEmpty(),
    query('window').optional().isIn(['1h', '24h', '7d', '30d']),
    query('breakdown').optional().isIn(['platform', 'geography', 'actor_type'])
  ],
  handleValidationErrors,
  (req, res) => {
    const { id } = req.params;
    const { window = '7d', breakdown } = req.query;

    if (!narrativesDb[id]) {
      return res.status(404).json({ error: 'Narrative not found' });
    }

    const metrics = metricsDb[id] || [];
    const filteredMetrics = metrics.filter(m => m.window === window);

    res.json({
      narrative_id: id,
      window,
      metrics: filteredMetrics
    });
  }
);

// Search endpoint: GET /search
app.get('/search',
  [
    query('query').isString().notEmpty(),
    query('since').optional().isISO8601(),
    query('until').optional().isISO8601(),
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('page_size').optional().isInt({ min: 10, max: 200 }).toInt()
  ],
  handleValidationErrors,
  (req, res) => {
    const { query: searchQuery, since, until, page = 1, page_size = 25 } = req.query;

    // Simulate search results
    const results = [
      {
        artifact: {
          id: 'art-1',
          type: 'text',
          text: `Sample content related to ${searchQuery}`,
          lang: 'en',
          created_at: new Date().toISOString()
        },
        narrative: {
          id: 'nar-global-ops',
          title: 'Global Operations Narrative',
          risk_level: 'elevated'
        },
        score: 0.85
      }
    ];

    res.json({
      query: searchQuery,
      total: 1,
      results
    });
  }
);

// Metrics endpoint: GET /metrics/kpis
app.get('/metrics/kpis',
  [
    query('entity_id').optional().isString(),
    query('entity_type').optional().isIn(['narrative', 'brand']),
    query('window').optional().isIn(['1h', '24h', '7d', '30d'])
  ],
  handleValidationErrors,
  (req, res) => {
    const { entity_id, entity_type = 'narrative', window = '24h' } = req.query;

    // Simulate KPI metrics
    const metrics = [
      {
        kpi: 'sentiment_index',
        value: 67.5,
        window,
        breakdown: {
          'twitter': 0.65,
          'facebook': 0.72,
          'instagram': 0.60
        }
      }
    ];

    res.json(metrics);
  }
);

// Alerts test endpoint: POST /alerts/test
app.post('/alerts/test',
  [
    body('rule_id').isString().notEmpty(),
    body('payload').isObject()
  ],
  handleValidationErrors,
  (req, res) => {
    const { rule_id, payload } = req.body;

    // Simulate alert testing
    const triggered = Math.random() > 0.5; // Randomly trigger for demo
    const outputs = triggered ? [{
      message: `Alert ${rule_id} was triggered with the provided payload`,
      context: payload
    }] : [];

    res.json({
      triggered,
      outputs
    });
  }
);

// Exports endpoint: POST /exports/sac
app.post('/exports/sac',
  [
    body('destination').isString().notEmpty(),
    body('filters').isObject()
  ],
  handleValidationErrors,
  (req, res) => {
    const { destination, filters } = req.body;

    // Simulate export job creation
    const jobId = `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const response = {
      job_id: jobId,
      status: 'queued',
      download_url: null
    };

    // Simulate processing the job in the background
    setTimeout(() => {
      console.log(`Export job ${jobId} completed`);
      // In a real implementation, this would update the job status in a database
    }, 5000);

    res.status(202).json(response);
  }
);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(port, () => {
  console.log(`Genaro DFT API server is running at http://localhost:${port}`);
});

module.exports = app;
