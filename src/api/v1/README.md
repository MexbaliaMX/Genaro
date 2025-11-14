# Genaro DFT 2.0 API Implementation

This directory contains the implementation of the Genaro DFT 2.0 API contracts as defined in the OpenAPI and AsyncAPI specifications.

## Architecture

- **REST API**: Implemented using Express.js and TypeScript based on the OpenAPI specification
- **Event Stream**: Based on the AsyncAPI specification with Kafka as the message broker

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Build the TypeScript code:
   ```bash
   npm run build
   ```

3. Start the server:
   ```bash
   npm start
   ```

### Development

For development, you can run the server without building first:
```bash
npm run dev
```

## Implemented Endpoints

Based on the OpenAPI specification, the following endpoints are implemented:

- `POST /ingest/webhook/{source}` - Receive signed webhook payload and push to ingestion bus
- `GET /narratives/{id}/metrics` - Retrieve KPI metrics for a narrative
- `GET /search` - Search artifacts and narratives with canonical query language
- `GET /metrics/kpis` - Aggregated KPIs across narratives or brands
- `POST /alerts/test` - Test an alert rule with a hypothetical payload
- `POST /exports/sac` - Trigger export job to SAP Analytics Cloud

## Event Streams (AsyncAPI)

The AsyncAPI specification defines the following event streams:
- `raw.content.ingested` - Raw content ingested from external connectors
- `canon.content.normalized` - Artifacts normalised into the DFT Canonical Model
- `signal.sentiment.scored` - Signals produced by ML models (sentiment, toxicity, stance)
- `risk.narrative.detected` - Narrative risk detection events

These event streams would be implemented using a Kafka producer/consumer, which is outside the scope of this basic implementation but would be integrated in a production system.

## API Documentation

The API follows the contract-first OpenAPI specification provided in the `api/openapi.yaml` file. All endpoints are validated using express-validator to ensure they conform to the defined schema.

## Testing

Run the accessibility + API smoke tests:
```bash
# from src/api/v1
npm run test:api
```

> `npm test` in this package already chains the repo-root accessibility check followed by `npm run test:api`. Use `npm run test:api` directly for fast feedback on the secure server.
