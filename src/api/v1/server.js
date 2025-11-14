const express = require('express');
const { body, validationResult, param, query } = require('express-validator');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const AuthMiddleware = require('./middleware/authMiddleware');
const AuthorizationMiddleware = require('./middleware/authorizationMiddleware');
const userManagementService = require('./services/userManagementService');
const canonicalModelService = require('./services/canonicalModelService');
const dataPipelineService = require('./services/dataPipelineService');
const deepfakeDetectionService = require('./services/deepfakeDetectionService');
const contentAnalysisService = require('./services/contentAnalysisService');
const narrativeDetectionService = require('./services/narrativeDetectionService');
const forecastingService = require('./services/forecastingService');

const app = express();
const port = process.env.PORT || 3000;

// Initialize auth and authorization middleware
const authMiddleware = new AuthMiddleware();
const authorizationMiddleware = new AuthorizationMiddleware();

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
  [authMiddleware.authenticateToken, authorizationMiddleware.requirePermission('export:data')],
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

// Advanced ML Models Endpoints

// Deepfake detection endpoint: POST /ml/deepfake/detect
app.post('/ml/deepfake/detect',
  [authMiddleware.authenticateToken],
  [
    body('media_url').isString().notEmpty(),
    body('media_type').isIn(['image', 'video', 'audio']).optional()
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { media_url, media_type = 'video' } = req.body;

      // Use the deepfake detection service
      const detectionResult = await deepfakeDetectionService.detect(media_url, media_type);

      res.json(detectionResult);
    } catch (error) {
      console.error('Deepfake detection error:', error);
      res.status(500).json({
        error: 'Deepfake detection failed',
        message: error.message
      });
    }
  }
);

// Content analysis endpoint: POST /ml/content/analyze
app.post('/ml/content/analyze',
  [authMiddleware.authenticateToken],
  [
    body('content').isObject(),
    body('content.text').optional().isString(),
    body('content.media_urls').optional().isArray()
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { content } = req.body;

      // Use the content analysis service
      const analysisResult = await contentAnalysisService.analyze(content);

      res.json(analysisResult);
    } catch (error) {
      console.error('Content analysis error:', error);
      res.status(500).json({
        error: 'Content analysis failed',
        message: error.message
      });
    }
  }
);

// Narrative detection endpoint: POST /ml/narrative/detect
app.post('/ml/narrative/detect',
  [authMiddleware.authenticateToken],
  [
    body('content_batch').isArray({ min: 1 }),
    body('content_batch.*.id').isString(),
    body('content_batch.*.text').isString().optional(),
    body('content_batch.*.source').isString().optional()
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { content_batch } = req.body;

      // Use the narrative detection service
      const detectionResults = await narrativeDetectionService.detectNarratives(content_batch);

      res.json(detectionResults);
    } catch (error) {
      console.error('Narrative detection error:', error);
      res.status(500).json({
        error: 'Narrative detection failed',
        message: error.message
      });
    }
  }
);

// Forecasting endpoint: POST /ml/forecast/narrative
app.post('/ml/forecast/narrative/:narrativeId',
  [authMiddleware.authenticateToken],
  [
    param('narrativeId').isString().notEmpty(),
    body('horizon_days').isInt({ min: 1, max: 30 }).optional().toInt(),
    body('include_confidence').isBoolean().optional()
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { narrativeId } = req.params;
      const { horizon_days = 7, include_confidence = true } = req.body;

      // Use the forecasting service
      const forecast = await forecastingService.generateForecast(narrativeId, horizon_days, include_confidence);

      res.json(forecast);
    } catch (error) {
      console.error('Forecasting error:', error);
      res.status(500).json({
        error: 'Forecasting failed',
        message: error.message
      });
    }
  }
);

// Authentication endpoints

// Login endpoint: POST /auth/login
app.post('/auth/login',
  [
    body('username').isString().notEmpty(),
    body('password').isString().notEmpty()
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { username, password } = req.body;

      // Authenticate user
      const user = await userManagementService.authenticate(username, password);

      // Generate access and refresh tokens
      const accessToken = authMiddleware.generateAccessToken(user);
      const refreshToken = authMiddleware.generateRefreshToken(user);

      res.json({
        access_token: accessToken,
        refresh_token: refreshToken,
        user: user,
        message: 'Login successful'
      });
    } catch (error) {
      res.status(401).json({
        error: 'Authentication failed',
        message: error.message
      });
    }
  }
);

// Refresh token endpoint: POST /auth/refresh
app.post('/auth/refresh',
  [
    body('refresh_token').isString().notEmpty()
  ],
  handleValidationErrors,
  (req, res) => {
    const { refresh_token } = req.body;

    // Verify refresh token
    const verifiedToken = authMiddleware.verifyRefreshToken(refresh_token);

    if (!verifiedToken) {
      return res.status(403).json({
        error: 'Invalid refresh token',
        message: 'The refresh token is invalid or has expired'
      });
    }

    // Generate new access token
    // In a real implementation, we'd verify the refresh token against stored tokens
    // and possibly check if the user is still active
    userManagementService.getUserByUsername(verifiedToken.userId).then(user => {
      if (!user || !user.isActive) {
        return res.status(403).json({
          error: 'Account inactive',
          message: 'The user account is no longer active'
        });
      }

      const newAccessToken = authMiddleware.generateAccessToken(user);

      res.json({
        access_token: newAccessToken,
        user: user
      });
    }).catch(error => {
      res.status(500).json({
        error: 'Token refresh failed',
        message: error.message
      });
    });
  }
);

// Validate token endpoint: POST /auth/validate
app.post('/auth/validate',
  [authMiddleware.authenticateToken], // This middleware checks the token
  (req, res) => {
    res.json({
      valid: true,
      user: req.user,
      message: 'Token is valid'
    });
  }
);

// Logout endpoint: POST /auth/logout
app.post('/auth/logout',
  [authMiddleware.authenticateToken], // This middleware checks the token
  (req, res) => {
    // In a real implementation, we would add the token to a blacklist
    // so it can't be used again until it expires
    res.json({
      message: 'Successfully logged out'
    });
  }
);

// User profile endpoint: GET /auth/profile
app.get('/auth/profile',
  [authMiddleware.authenticateToken],
  async (req, res) => {
    try {
      // Get user from the token
      const user = await userManagementService.getUserByUsername(req.user.username);

      if (!user) {
        return res.status(404).json({
          error: 'User not found',
          message: 'The user account could not be found'
        });
      }

      res.json({
        user: user,
        permissions: authorizationMiddleware.getUserPermissions(req.user)
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to retrieve user profile',
        message: error.message
      });
    }
  }
);

// Data Pipeline endpoints

// Connect to a data source: POST /pipeline/connect
app.post('/pipeline/connect',
  [authMiddleware.authenticateToken, authorizationMiddleware.requirePermission('manage:data-sources')],
  [
    body('id').isString().optional(),
    body('name').isString().notEmpty(),
    body('type').isIn(['social_media', 'news_feed', 'ad_platform', 'enterprise', 'file', 'api']),
    body('config').isObject()
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const connectionResult = await dataPipelineService.connectToSource(req.body);

      res.json(connectionResult);
    } catch (error) {
      console.error('Data pipeline connection error:', error);
      res.status(500).json({
        error: 'Connection to data source failed',
        message: error.message
      });
    }
  }
);

// Fetch data from a source: POST /pipeline/fetch/:sourceId
app.post('/pipeline/fetch/:sourceId',
  [authMiddleware.authenticateToken, authorizationMiddleware.requirePermission('read:data')],
  [
    param('sourceId').isString().notEmpty(),
    body('options').isObject().optional()
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { sourceId } = req.params;
      const { options = {} } = req.body;

      const result = await dataPipelineService.fetchData(sourceId, options);

      res.json(result);
    } catch (error) {
      console.error('Data pipeline fetch error:', error);
      res.status(500).json({
        error: 'Data fetch failed',
        message: error.message
      });
    }
  }
);

// Validate canonical model: POST /pipeline/validate
app.post('/pipeline/validate',
  [authMiddleware.authenticateToken, authorizationMiddleware.requirePermission('validate:data')],
  [
    body('data').isArray({ min: 1 })
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { data } = req.body;

      const validationResult = dataPipelineService.validateData(data);

      res.json({
        valid: true,
        errorCount: 0,
        message: 'Data validation passed',
        ...validationResult
      });
    } catch (error) {
      res.status(400).json({
        valid: false,
        error: 'Data validation failed',
        message: error.message
      });
    }
  }
);

// Transform to canonical model: POST /pipeline/transform
app.post('/pipeline/transform',
  [authMiddleware.authenticateToken, authorizationMiddleware.requirePermission('transform:data')],
  [
    body('rawData').isArray({ min: 1 }),
    body('sourceType').isIn(['social_media', 'news_feed', 'ad_platform', 'enterprise', 'generic'])
  ],
  handleValidationErrors,
  (req, res) => {
    try {
      const { rawData, sourceType } = req.body;

      const canonicalData = rawData.map(item =>
        canonicalModelService.transformToCanonical(item, sourceType)
      );

      // Validate the transformed data
      canonicalData.forEach(item => canonicalModelService.validateCanonicalModel(item));

      res.json({
        transformedCount: canonicalData.length,
        canonicalData: canonicalData,
        message: 'Data successfully transformed to canonical model'
      });
    } catch (error) {
      console.error('Data transformation error:', error);
      res.status(500).json({
        error: 'Data transformation failed',
        message: error.message
      });
    }
  }
);

// Protected endpoint example using role-based access: GET /admin/users
app.get('/admin/users',
  [authMiddleware.authenticateToken, authorizationMiddleware.requireRole(['admin'])],
  (req, res) => {
    const users = Array.from(userManagementService.users.values()).map(user =>
      userManagementService.sanitizeUser(user)
    );

    res.json({
      users: users,
      total: users.length,
      message: 'User list retrieved successfully'
    });
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
