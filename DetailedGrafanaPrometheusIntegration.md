# Detailed Complementary Integration: Grafana and Prometheus in Genaro DFT 2.0

## 1. Technical Implementation Details

### Prometheus Integration Architecture

The Prometheus integration in Genaro follows a microservices approach with each component exposing its own metrics endpoint:

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   API Gateway   │    │  ML Services     │    │  Event Bus      │
│                 │    │                  │    │                 │
│ /metrics        │    │ /metrics         │    │ /metrics        │
│ (API metrics)   │    │ (model perf,     │    │ (throughput,    │
│                 │    │ inference time)  │    │ processing lag) │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────────┐
                    │   Prometheus        │
                    │   Server            │
                    │                     │
                    │ ┌─────────────────┐ │
                    │ │ Genaro Rule     │ │
                    │ │ Engine          │ │
                    │ └─────────────────┘ │
                    └─────────────────────┘
                                 │
                    ┌─────────────────────┐
                    │     Grafana         │
                    │                     │
                    └─────────────────────┘
```

### Prometheus Client Implementation

Here's how to instrument the Genaro API with Prometheus metrics:

```typescript
// src/api/metrics.ts
import { Counter, Gauge, Histogram, register } from 'prom-client';

// API Request Metrics
export const httpRequestTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
});

export const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
});

export const activeConnections = new Gauge({
  name: 'active_connections',
  help: 'Number of active connections',
});

// Narrative Intelligence Metrics
export const narrativeVolume = new Counter({
  name: 'narrative_volume_total',
  help: 'Total number of narrative mentions',
  labelNames: ['narrative_id', 'source_platform'],
});

export const sentimentScore = new Gauge({
  name: 'narrative_sentiment_score',
  help: 'Current sentiment score for a narrative',
  labelNames: ['narrative_id'],
});

export const threatDetectionEvents = new Counter({
  name: 'threat_detection_events_total',
  help: 'Total number of threat detection events',
  labelNames: ['threat_type'], // deepfake, bot, coordination
});

// ML Model Metrics
export const modelInferenceDuration = new Histogram({
  name: 'model_inference_duration_seconds',
  help: 'Duration of ML model inference in seconds',
  labelNames: ['model_name'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5],
});

export const modelAccuracy = new Gauge({
  name: 'model_accuracy',
  help: 'Current accuracy of ML models',
  labelNames: ['model_name'],
});
```

### Middleware Integration

```typescript
// src/middleware/metrics.ts
import { Request, Response, NextFunction } from 'express';
import { 
  httpRequestTotal, 
  httpRequestDuration, 
  activeConnections 
} from '../api/metrics';

export const metricsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  // Increment active connections
  activeConnections.inc();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000; // Convert to seconds
    
    // Record metrics
    httpRequestTotal
      .labels(req.method, req.route?.path || req.path, res.statusCode.toString())
      .inc();
      
    httpRequestDuration
      .labels(req.method, req.route?.path || req.path)
      .observe(duration);
      
    // Decrement active connections
    activeConnections.dec();
  });
  
  next();
};

// Metrics endpoint
export const metricsEndpoint = (req: Request, res: Response) => {
  res.set('Content-Type', register.contentType);
  res.end(register.metrics());
};
```

## 2. Dashboard Examples

### Narrative Intelligence Dashboard

```json
{
  "dashboard": {
    "id": null,
    "title": "Genaro Narrative Intelligence",
    "tags": ["narrative", "intelligence", "social"],
    "timezone": "browser",
    "panels": [
      {
        "id": 1,
        "title": "Narrative Volume Trend",
        "type": "timeseries",
        "targets": [
          {
            "expr": "sum(rate(narrative_volume_total[5m])) by (narrative_id)",
            "legendFormat": "{{ narrative_id }}",
            "refId": "A"
          }
        ],
        "options": {
          "tooltip": {
            "mode": "multi",
            "sort": "desc"
          },
          "legend": {
            "displayMode": "table",
            "placement": "bottom",
            "calcs": ["mean", "lastNotNull"]
          }
        }
      },
      {
        "id": 2,
        "title": "Sentiment Score Heatmap",
        "type": "heatmap",
        "targets": [
          {
            "expr": "narrative_sentiment_score",
            "format": "time_series_buckets",
            "refId": "A"
          }
        ]
      },
      {
        "id": 3,
        "title": "Threat Detection Events",
        "type": "stat",
        "targets": [
          {
            "expr": "rate(threat_detection_events_total[1m])",
            "refId": "A"
          }
        ],
        "reduceOptions": {
          "calcs": ["lastNotNull"]
        },
        "fieldConfig": {
          "defaults": {
            "color": {
              "mode": "thresholds"
            },
            "thresholds": {
              "steps": [
                {
                  "color": "green",
                  "value": null
                },
                {
                  "color": "red",
                  "value": 1
                }
              ]
            },
            "unit": "short"
          }
        }
      },
      {
        "id": 4,
        "title": "Top Narratives by Volume",
        "type": "table",
        "targets": [
          {
            "expr": "topk(10, sum(rate(narrative_volume_total[1h])) by (narrative_id))",
            "format": "table",
            "refId": "A"
          }
        ],
        "transformations": [
          {
            "id": "organize",
            "options": {
              "excludeByName": {
                "Time": true
              },
              "renameByName": {
                "Value": "Volume (per hour)",
                "narrative_id": "Narrative"
              }
            }
          }
        ]
      }
    ],
    "time": {
      "from": "now-6h",
      "to": "now"
    },
    "refresh": "30s"
  }
}
```

### Platform Operations Dashboard

```json
{
  "dashboard": {
    "title": "Genaro Platform Operations",
    "panels": [
      {
        "id": 1,
        "title": "API Request Rate",
        "type": "timeseries",
        "targets": [
          {
            "expr": "sum(rate(http_requests_total[1m]))",
            "refId": "A"
          }
        ]
      },
      {
        "id": 2,
        "title": "API Error Rate",
        "type": "timeseries",
        "targets": [
          {
            "expr": "sum(rate(http_requests_total{status_code=~\"5..|4..\"}[1m])) / sum(rate(http_requests_total[1m])) * 100",
            "refId": "A"
          }
        ],
        "fieldConfig": {
          "defaults": {
            "unit": "percent",
            "color": {
              "mode": "thresholds"
            },
            "thresholds": {
              "steps": [
                {
                  "color": "green",
                  "value": null
                },
                {
                  "color": "red",
                  "value": 5
                }
              ]
            }
          }
        }
      },
      {
        "id": 3,
        "title": "API Response Time (95th Percentile)",
        "type": "timeseries",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le))",
            "refId": "A"
          }
        ],
        "fieldConfig": {
          "defaults": {
            "unit": "s"
          }
        }
      },
      {
        "id": 4,
        "title": "Active Connections",
        "type": "gauge",
        "targets": [
          {
            "expr": "active_connections",
            "refId": "A"
          }
        ]
      },
      {
        "id": 5,
        "title": "ML Model Inference Time",
        "type": "timeseries",
        "targets": [
          {
            "expr": "histogram_quantile(0.99, sum(rate(model_inference_duration_seconds_bucket[5m])) by (le, model_name))",
            "legendFormat": "{{ model_name }}",
            "refId": "A"
          }
        ],
        "fieldConfig": {
          "defaults": {
            "unit": "s"
          }
        }
      }
    ]
  }
}
```

### Business Intelligence Dashboard

```json
{
  "dashboard": {
    "title": "Genaro Business Intelligence",
    "panels": [
      {
        "id": 1,
        "title": "Ad Spend vs Narrative Impact",
        "type": "timeseries",
        "targets": [
          {
            "expr": "genaro_ad_spend_usd",
            "legendFormat": "Ad Spend",
            "refId": "A"
          },
          {
            "expr": "genaro_narrative_impact_score",
            "legendFormat": "Narrative Impact",
            "refId": "B"
          }
        ]
      },
      {
        "id": 2,
        "title": "Cost Per Sentiment Shift",
        "type": "stat",
        "targets": [
          {
            "expr": "genaro_cost_per_sentiment_shift",
            "refId": "A"
          }
        ],
        "fieldConfig": {
          "defaults": {
            "unit": "currencyUSD"
          }
        }
      },
      {
        "id": 3,
        "title": "Narrative ROI by Channel",
        "type": "bargauge",
        "targets": [
          {
            "expr": "genaro_narrative_roi_by_channel",
            "format": "time_series",
            "refId": "A"
          }
        ]
      },
      {
        "id": 4,
        "title": "Conversion Funnel Analysis",
        "type": "timeseries",
        "targets": [
          {
            "expr": "genaro_conversion_funnel{step=\"awareness\"}",
            "legendFormat": "Awareness",
            "refId": "A"
          },
          {
            "expr": "genaro_conversion_funnel{step=\"engagement\"}",
            "legendFormat": "Engagement",
            "refId": "B"
          },
          {
            "expr": "genaro_conversion_funnel{step=\"trust\"}",
            "legendFormat": "Trust",
            "refId": "C"
          },
          {
            "expr": "genaro_conversion_funnel{step=\"action\"}",
            "legendFormat": "Action",
            "refId": "D"
          },
          {
            "expr": "genaro_conversion_funnel{step=\"advocacy\"}",
            "legendFormat": "Advocacy",
            "refId": "E"
          }
        ]
      }
    ]
  }
}
```

## 3. Integration Patterns between React and Grafana

### Pattern 1: Iframe Embedding

The simplest approach is to embed Grafana dashboards directly into the React application using iframes:

```jsx
// components/GrafanaDashboard.js
import React, { useState } from 'react';

const GrafanaDashboard = ({ dashboardId, timeRange = 'now-6h', theme = 'dark' }) => {
  const [iframeKey, setIframeKey] = useState(0);
  
  // Refresh the iframe when dashboardId changes
  React.useEffect(() => {
    setIframeKey(prev => prev + 1);
  }, [dashboardId]);
  
  // Generate Grafana dashboard URL
  const grafanaUrl = `${process.env.REACT_APP_GRAFANA_URL}/d/${dashboardId}?orgId=1&from=${timeRange}&theme=${theme}&kiosk`;
  
  return (
    <div className="grafana-dashboard-container">
      <iframe
        key={iframeKey} // Force remount when dashboardId changes
        src={grafanaUrl}
        width="100%"
        height="800px"
        frameBorder="0"
        title={`Grafana Dashboard - ${dashboardId}`}
        onLoad={() => console.log('Grafana dashboard loaded')}
      />
    </div>
  );
};

export default GrafanaDashboard;
```

### Pattern 2: Grafana Panel Plugin

For deeper integration, create a custom Grafana panel plugin that can be embedded in the React app:

```typescript
// plugins/genaro-narrative-panel/module.ts
import { PanelPlugin, FieldConfigProperty } from '@grafana/data';
import { SimpleOptions } from './types';
import { SimplePanel } from './SimplePanel';

export const plugin = new PanelPlugin<SimpleOptions>(SimplePanel)
  .setNoPadding()
  .setPanelOptions(builder => {
    return builder
      .addSelect({
        path: 'narrativeId',
        name: 'Narrative',
        description: 'Select the narrative to visualize',
        settings: {
          options: [
            { label: 'Global Operations', value: 'nar-global-ops' },
            { label: 'Product Launch', value: 'nar-product-launch' },
            { label: 'Crisis Response', value: 'nar-crisis-response' },
          ],
        },
        defaultValue: 'nar-global-ops',
      })
      .addBooleanSwitch({
        path: 'showForecast',
        name: 'Show Forecast',
        description: 'Whether to show forecast projections',
        defaultValue: true,
      });
  })
  .setPanelChangeHandler((options, prevPluginId, prevOptions) => {
    // Handle panel type changes
    return options;
  });
```

### Pattern 3: React Visualization Components with Prometheus Data

Create React components that fetch data directly from Prometheus and visualize it:

```jsx
// components/NarrativeVolumeChart.js
import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const NarrativeVolumeChart = ({ narrativeId, timeRange = '1h' }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Query Prometheus API
        const query = `sum(rate(narrative_volume_total{` +
                     `narrative_id="${narrativeId}"` +
                     `}[${timeRange}]))`;
        
        const response = await fetch(
          `${process.env.REACT_APP_PROMETHEUS_URL}/api/v1/query_range?` +
          `query=${encodeURIComponent(query)}` +
          `&start=${Date.now() / 1000 - 3600}&end=${Date.now() / 1000}&step=60`
        );
        
        const result = await response.json();
        
        if (result.status === 'success') {
          const series = result.data.result[0];
          if (series) {
            const timestamps = series.values.map(val => new Date(val[0] * 1000).toLocaleTimeString());
            const values = series.values.map(val => parseFloat(val[1]));
            
            setData({
              labels: timestamps,
              datasets: [
                {
                  label: `Narrative Volume - ${narrativeId}`,
                  data: values,
                  borderColor: 'rgb(75, 192, 192)',
                  backgroundColor: 'rgba(75, 192, 192, 0.5)',
                },
              ],
            });
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching narrative volume data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, [narrativeId, timeRange]);

  if (loading) return <div>Loading...</div>;
  if (!data) return <div>No data available</div>;

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Narrative Volume Over Time',
      },
    },
  };

  return (
    <div>
      <Line options={options} data={data} />
    </div>
  );
};

export default NarrativeVolumeChart;
```

### Pattern 4: Context-Based Metrics Dashboard

Integrate Grafana dashboards with React application state:

```jsx
// context/GrafanaContext.js
import React, { createContext, useContext } from 'react';
import GrafanaDashboard from '../components/GrafanaDashboard';

const GrafanaContext = createContext();

export const GrafanaProvider = ({ children }) => {
  const getDashboardForNarrative = (narrativeId) => {
    // Return appropriate dashboard ID based on narrative and user role
    return `${narrativeId}-analytics`;
  };

  const getDashboardTheme = () => {
    // Get theme from app context
    return localStorage.getItem('theme') || 'dark';
  };

  return (
    <GrafanaContext.Provider value={{
      getDashboardForNarrative,
      getDashboardTheme,
      GrafanaDashboard
    }}>
      {children}
    </GrafanaContext.Provider>
  );
};

export const useGrafana = () => {
  const context = useContext(GrafanaContext);
  if (!context) {
    throw new Error('useGrafana must be used within a GrafanaProvider');
  }
  return context;
};
```

## 4. Metrics Collection Strategies

### Strategy 1: Application-Level Instrumentation

Instrument the application code with Prometheus metrics at key points:

```typescript
// src/services/narrativeService.ts
import { narrativeVolume, sentimentScore, threatDetectionEvents } from '../api/metrics';

export class NarrativeService {
  async processNarrative(narrativeId: string, content: any) {
    try {
      // Process the narrative content
      const result = await this.analyzeNarrative(content);
      
      // Update metrics
      narrativeVolume
        .labels(narrativeId, content.platform)
        .inc();
      
      sentimentScore
        .labels(narrativeId)
        .set(result.sentiment);
      
      // Check for threats and update metrics
      if (result.threats) {
        for (const threat of result.threats) {
          threatDetectionEvents
            .labels(threat.type)
            .inc();
        }
      }
      
      return result;
    } catch (error) {
      console.error(`Error processing narrative ${narrativeId}:`, error);
      throw error;
    }
  }
  
  private async analyzeNarrative(content: any) {
    // Analysis implementation
    return {
      sentiment: 0.5, // example value
      threats: [], // example array
    };
  }
}
```

### Strategy 2: Middleware Collection

Use middleware to collect metrics for all requests:

```typescript
// src/middleware/observability.ts
import { Request, Response, NextFunction } from 'express';
import { 
  httpRequestTotal, 
  httpRequestDuration, 
  activeConnections 
} from '../api/metrics';

export const observabilityMiddleware = (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  const start = Date.now();
  const route = req.route ? req.route.path : req.path;
  
  // Track active connections
  activeConnections.inc();
  
  // Track request start
  httpRequestTotal
    .labels(req.method, route, 'pending')
    .inc();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    
    // Update metrics
    httpRequestTotal
      .labels(req.method, route, res.statusCode.toString())
      .inc(0); // Decrease pending counter, add actual status counter
    
    httpRequestDuration
      .labels(req.method, route)
      .observe(duration);
    
    // Decrement active connections
    activeConnections.dec();
  });
  
  next();
};
```

### Strategy 3: Business Logic Instrumentation

Collect metrics specifically related to business outcomes:

```typescript
// src/services/businessMetricsService.ts
import { Gauge, Histogram, Counter } from 'prom-client';

// Business metrics
const narrativeImpact = new Gauge({
  name: 'narrative_impact_score',
  help: 'Impact score of a narrative on business metrics',
  labelNames: ['narrative_id', 'metric_type'], // revenue, sentiment, engagement
});

const campaignEffectiveness = new Histogram({
  name: 'campaign_effectiveness_duration_seconds',
  help: 'Time to measure campaign effectiveness',
  labelNames: ['campaign_id'],
  buckets: [30, 60, 120, 300, 600, 1800, 3600],
});

const narrativeRoi = new Gauge({
  name: 'narrative_roi',
  help: 'Return on investment for narrative campaigns',
  labelNames: ['narrative_id', 'campaign_type'],
});

export class BusinessMetricsService {
  async measureNarrativeImpact(
    narrativeId: string, 
    metrics: { revenue?: number; sentiment?: number; engagement?: number }
  ) {
    if (metrics.revenue) {
      narrativeImpact
        .labels(narrativeId, 'revenue')
        .set(metrics.revenue);
    }
    
    if (metrics.sentiment) {
      narrativeImpact
        .labels(narrativeId, 'sentiment')
        .set(metrics.sentiment);
    }
    
    if (metrics.engagement) {
      narrativeImpact
        .labels(narrativeId, 'engagement')
        .set(metrics.engagement);
    }
  }
  
  async measureCampaignEffectiveness(campaignId: string, duration: number) {
    campaignEffectiveness
      .labels(campaignId)
      .observe(duration);
  }
  
  async updateNarrativeRoi(narrativeId: string, roi: number, campaignType: string) {
    narrativeRoi
      .labels(narrativeId, campaignType)
      .set(roi);
  }
}
```

### Strategy 4: Automated ML Model Monitoring

Monitor ML model performance automatically:

```typescript
// src/services/modelMonitoringService.ts
import { modelInferenceDuration, modelAccuracy, Gauge } from 'prom-client';

const modelDrift = new Gauge({
  name: 'model_drift_score',
  help: 'Drift score for ML models',
  labelNames: ['model_name'],
});

export class ModelMonitoringService {
  async recordInferenceTime(modelName: string, duration: number) {
    modelInferenceDuration
      .labels(modelName)
      .observe(duration);
  }
  
  async updateModelAccuracy(modelName: string, accuracy: number) {
    modelAccuracy
      .labels(modelName)
      .set(accuracy);
  }
  
  async updateModelDrift(modelName: string, driftScore: number) {
    modelDrift
      .labels(modelName)
      .set(driftScore);
  }
  
  async validateModelOutput(
    modelName: string,
    input: any,
    output: any,
    expected?: any
  ) {
    const startTime = Date.now();
    
    try {
      // Process the model
      const result = await this.runModel(modelName, input);
      
      const duration = Date.now() - startTime;
      this.recordInferenceTime(modelName, duration / 1000);
      
      // If expected output provided, calculate accuracy
      if (expected) {
        const accuracy = this.calculateAccuracy(result, expected);
        this.updateModelAccuracy(modelName, accuracy);
      }
      
      return result;
    } catch (error) {
      console.error(`Model ${modelName} error:`, error);
      throw error;
    }
  }
  
  private async runModel(modelName: string, input: any) {
    // Implementation would call actual ML model
    return { result: 'dummy', confidence: 0.95 };
  }
  
  private calculateAccuracy(actual: any, expected: any) {
    // Calculate accuracy based on model output
    return 0.92; // dummy value
  }
}
```

## 5. User Experience Considerations

### Consistent Visual Experience

To maintain a consistent user experience between React components and embedded Grafana dashboards:

```css
/* styles/grafana-integration.css */

/* Ensure Grafana dashboards match Genaro's dark theme */
.grafana-dashboard-container {
  background-color: #0d1117;
  border-radius: 8px;
  padding: 16px;
  margin: 16px 0;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

/* Style iframe to match application theme */
.grafana-dashboard-container iframe {
  border: 1px solid #30363d;
  border-radius: 4px;
}

/* Custom theme for Grafana (requires custom Grafana theme configuration) */
.grafana-dashboard-container {
  --grafana-panel-background: #0d1117;
  --grafana-panel-border: #30363d;
  --grafana-text-color-primary: #e6edf3;
  --grafana-text-color-secondary: #848d97;
}

/* Responsive design for embedded dashboards */
@media (max-width: 768px) {
  .grafana-dashboard-container iframe {
    height: 600px !important;
  }
}

@media (max-width: 480px) {
  .grafana-dashboard-container iframe {
    height: 400px !important;
  }
}
```

### Loading and Error States

Implement proper loading and error states for embedded dashboards:

```jsx
// components/EnhancedGrafanaDashboard.js
import React, { useState, useEffect } from 'react';
import { Spinner, Alert } from 'react-bootstrap';
import { useTheme } from '../context/ThemeContext';

const EnhancedGrafanaDashboard = ({ 
  dashboardId, 
  timeRange = 'now-6h', 
  title,
  onDashboardLoad,
  onError 
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isDarkTheme } = useTheme();
  
  useEffect(() => {
    setLoading(true);
    setError(null);
  }, [dashboardId]);
  
  const handleLoad = () => {
    setLoading(false);
    if (onDashboardLoad) onDashboardLoad();
  };
  
  const handleError = (err) => {
    setLoading(false);
    setError('Failed to load dashboard');
    console.error('Grafana dashboard error:', err);
    if (onError) onError(err);
  };
  
  const grafanaUrl = `${process.env.REACT_APP_GRAFANA_URL}/d/${dashboardId}?orgId=1&from=${timeRange}&theme=${isDarkTheme ? 'dark' : 'light'}&kiosk&render=1`;
  
  return (
    <div className="enhanced-grafana-dashboard">
      <div className="dashboard-header">
        <h3>{title || `Dashboard: ${dashboardId}`}</h3>
      </div>
      
      {loading && (
        <div className="dashboard-loading">
          <Spinner animation="border" />
          <p>Loading dashboard...</p>
        </div>
      )}
      
      {error && (
        <Alert variant="danger">
          <Alert.Heading>Error Loading Dashboard</Alert.Heading>
          <p>{error}</p>
          <p>Please try again or contact support if the issue persists.</p>
        </Alert>
      )}
      
      {!loading && !error && (
        <iframe
          src={grafanaUrl}
          width="100%"
          height="600px"
          frameBorder="0"
          title={title || `Grafana Dashboard - ${dashboardId}`}
          onLoad={handleLoad}
          onError={handleError}
        />
      )}
    </div>
  );
};

export default EnhancedGrafanaDashboard;
```

### Navigation and Context Preservation

Maintain user context when switching between React views and Grafana dashboards:

```jsx
// components/GenaroDashboardLayout.js
import React, { useState } from 'react';
import { Nav, Navbar, Container } from 'react-bootstrap';
import GrafanaDashboard from './EnhancedGrafanaDashboard';

const GenaroDashboardLayout = () => {
  const [activeView, setActiveView] = useState('dashboard');
  const [selectedNarrative, setSelectedNarrative] = useState(null);
  
  const dashboardViews = [
    { id: 'overview', title: 'Executive Overview', grafanaId: 'genaro-overview' },
    { id: 'narratives', title: 'Narrative Intelligence', grafanaId: 'genaro-narratives' },
    { id: 'threats', title: 'Threat Detection', grafanaId: 'genaro-threats' },
    { id: 'business', title: 'Business Intelligence', grafanaId: 'genaro-business' },
  ];
  
  const renderActiveView = () => {
    if (activeView === 'dashboard' || activeView === 'narratives') {
      return (
        <GrafanaDashboard 
          dashboardId={dashboardViews.find(v => v.id === activeView)?.grafanaId}
          title={dashboardViews.find(v => v.id === activeView)?.title}
          timeRange="now-24h"
          onDashboardLoad={() => console.log('Dashboard loaded')}
          onError={(err) => console.error('Dashboard error:', err)}
        />
      );
    }
    
    // Render custom React components for other views
    return (
      <div className="custom-view">
        <h2>{dashboardViews.find(v => v.id === activeView)?.title}</h2>
        {/* Custom view implementation */}
      </div>
    );
  };
  
  return (
    <div className="genaro-dashboard-layout">
      <Navbar bg="dark" variant="dark" expand="lg">
        <Container>
          <Navbar.Brand href="#home">Genaro DFT 2.0</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              {dashboardViews.map(view => (
                <Nav.Link 
                  key={view.id}
                  active={activeView === view.id}
                  onClick={() => setActiveView(view.id)}
                >
                  {view.title}
                </Nav.Link>
              ))}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      
      <Container fluid className="main-content">
        {renderActiveView()}
      </Container>
    </div>
  );
};

export default GenaroDashboardLayout;
```

### Performance Optimization

Optimize performance for embedded dashboards:

```jsx
// components/OptimizedGrafanaDashboard.js
import React, { useState, useRef, useCallback } from 'react';
import { useInView } from 'react-intersection-observer';

const OptimizedGrafanaDashboard = ({ 
  dashboardId, 
  timeRange = 'now-6h', 
  lazyLoad = true,
  refreshInterval = 30000 // 30 seconds
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: false
  });
  
  // Only load when dashboard is visible
  const shouldLoad = !lazyLoad || inView;
  
  // Auto-refresh mechanism
  const refreshTimer = useRef(null);
  const [refreshKey, setRefreshKey] = useState(0);
  
  const handleLoad = useCallback(() => {
    // Set up auto-refresh if enabled
    if (refreshInterval > 0) {
      refreshTimer.current = setInterval(() => {
        setRefreshKey(prev => prev + 1);
      }, refreshInterval);
    }
  }, [refreshInterval]);
  
  const handleUnload = useCallback(() => {
    if (refreshTimer.current) {
      clearInterval(refreshTimer.current);
      refreshTimer.current = null;
    }
  }, []);
  
  // Clean up on unmount
  React.useEffect(() => {
    return () => {
      handleUnload();
    };
  }, [handleUnload]);
  
  const grafanaUrl = `${process.env.REACT_APP_GRAFANA_URL}/d/${dashboardId}?orgId=1&from=${timeRange}&theme=dark&kiosk&var-narrative=${dashboardId}&__cachebuster=${refreshKey}`;
  
  return (
    <div ref={ref} className="optimized-grafana-dashboard">
      {shouldLoad ? (
        <iframe
          src={grafanaUrl}
          width="100%"
          height="600px"
          frameBorder="0"
          title={`Grafana Dashboard - ${dashboardId}`}
          onLoad={handleLoad}
          style={{ display: inView ? 'block' : 'none' }}
        />
      ) : (
        <div className="dashboard-placeholder">
          <p>Dashboard will load when visible</p>
        </div>
      )}
    </div>
  );
};

export default OptimizedGrafanaDashboard;
```

This detailed document provides comprehensive coverage of the complementary integration approach for Grafana and Prometheus in the Genaro platform, addressing all the technical, dashboard design, integration, metrics collection, and user experience aspects you requested.