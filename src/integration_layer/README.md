# Genaro DFT 2.0 Integration Layer

This directory contains the implementation of the Genaro DFT 2.0 Integration Layer as defined in the [IntegrationLayer.md](../../IntegrationLayer.md) specification.

## Architecture Overview

The integration layer implements the following key components:

### 1. Ingest Gateways
- **API Gateway**: Provides REST/GraphQL endpoints for pull APIs
- **Webhooks Hub**: Handles push notifications from external sources
- **Streaming Ingest**: Supports WebSocket/SSE for real-time data streams
- **Authentication & Rate Limiting**: Implements security and throttling measures

### 2. Connectors/Adapters
- **Standardized SDK**: Provides a consistent interface for creating new connectors
- **DFT Canonical Model Mapping**: Ensures all data conforms to the canonical schema
- **Retry Logic & Idempotency**: Implements robust error handling and checkpointing

### 3. Event Bus (Kafka)
- **Standardized Topics**: Predefined topics for different content types and signals
- **Schema Registry**: Ensures data consistency with JSON Schema validation
- **Pub/Sub Architecture**: Decouples services for better resilience

### 4. Normalization & Enrichment
- **DFT Canonical Model**: Transforms raw data to the standardized schema
- **PII Detection & Masking**: Protects sensitive information
- **Media Processing**: STT, OCR, and metadata extraction
- **Language Detection**: Identifies content language

### 5. Processing & Feature Store
- **Feature Store**: Stores and manages ML features
- **Rules Engine**: Evaluates rules and triggers alerts
- **Batch/Stream Processing**: Handles both real-time and batch workloads

## Key Features Implemented

### DFT Canonical Model
The integration layer implements the DFT Canonical Model with these core entities:
- **Actor**: `{id, handle, platform, verified?, org?, geo?}`
- **Artifact**: `{id, type[text|image|video|audio], text?, media_urls[], lang, created_at, source_ref}`
- **Channel**: `{platform, topic/hashtag, community_id?}`
- **Narrative**: `{id, title, seed_queries[], entities[], stance?}`
- **Signal**: `{artifact_id, sentiment, toxicity, emotion[], stance, quality, confidence}`

### Event Topics
Standardized Kafka topics as per the AsyncAPI specification:
- `raw.content.ingested`
- `canon.content.normalized`
- `signal.sentiment.scored`
- `risk.narrative.detected`
- `alert.threshold.breached`

### Security & Governance
- PII detection and masking
- Data lineage tracking
- Rate limiting and circuit breakers
- Schema validation on all topics

## How to Run

1. **Install dependencies**:
```bash
npm install
```

2. **Make sure Kafka is running** (locally or via docker-compose)

3. **Start the integration layer**:
```bash
npm run build
node dist/integration_layer/index.js
```

## Usage Examples

### Creating a New Connector
```typescript
import { ConnectorFactory, BaseConnector, RawPayload, CanonicalPayload } from './sdk/connector-sdk';

class TwitterConnector extends BaseConnector {
  async poll(): Promise<RawPayload[]> {
    // Implementation to fetch data from Twitter API
  }
  
  async mapToCanonical(raw: RawPayload): Promise<CanonicalPayload> {
    // Map Twitter data to DFT Canonical Model
  }
}

// Register the connector
const twitterConfig = { /* config */ };
const twitterConnector = ConnectorFactory.create(TwitterConnector, twitterConfig);
```

### Publishing to Raw Content Topic
```typescript
import { eventBus } from './event_bus/event-bus';

await eventBus.publish('raw.content.ingested', {
  source: 'twitter',
  external_id: 'tweet_123',
  fetched_at: new Date().toISOString(),
  payload: {/* raw tweet data */}
});
```

## Integration with Other Systems

The integration layer connects with:
- **API Layer**: Provides the REST endpoints defined in the OpenAPI specification
- **Frontend**: Supplies data for the dashboard and visualization interfaces
- **Genaro Agent**: Feeds data to the agent for analysis and decision-making
- **External Systems**: Connects to various data sources via the connector SDK

## Configuration

The system can be configured via environment variables:
- `KAFKA_BROKERS`: Comma-separated list of Kafka broker addresses
- Connector-specific secrets and configuration values

## Data Sovereignty

The architecture supports data sovereignty requirements:
- Geo-partitioning of event bus topics
- Region-aware processing services
- Policy-based routing
- Deployment to sovereign cloud environments

## Responsive Design Integration

The integration layer supports responsive frontend interfaces:
- Canonical data model that works across all device sizes
- Device-agnostic API endpoints that serve data to responsive UIs
- Adaptable visualization data for different screen sizes
- Optimized payloads for mobile and desktop experiences