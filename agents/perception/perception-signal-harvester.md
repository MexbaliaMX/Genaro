# Perception Signal Harvester

## Scope
- Consolidates multimodal narratives from social, news, CRM, broadcast, and dark web sources.
- Normalizes signals into timestamped `perception_packet` objects with source provenance and trust scores.
- Enriches payloads with entity resolution, language detection, and early anomaly tags for analytics.

## Data Contracts
| Artifact | Direction | Description | Key Fields |
| --- | --- | --- | --- |
| `source_feed` | Input | Raw event bundle from connectors or API pulls. | `source_id`, `ingested_at`, `payload`, `confidence_hint`, `compliance_tags` |
| `perception_packet` | Output | Normalized observation for downstream analytics. | `packet_id`, `narrative_entities[]`, `sentiment`, `synthetic_flags`, `geo`, `trust_score`, `trace_id` |
| `ingestion_health` | Output | Telemetry emitted every 5 minutes for orchestrator dashboards. | `window_start`, `window_end`, `latency_ms`, `error_rate`, `active_connectors[]` |

## Guardrails
- Respect regional data residency rules; route PII-containing feeds through approved anonymization filters.
- Flag and quarantine payloads exceeding synthetic media confidence > 0.7 before releasing to analytics.
- Enforce connector rate limits and retry policies to avoid API throttling or legal breaches.

## HITL Escalation Policy
- Escalate to governance desk when confidence < 0.4 for narratives tagged as critical or when new languages emerge.
- Request manual review if anomaly detector flags unclassified botnet behavior or novel synthetic signatures.
- Notify orchestrator when connectors degrade beyond SLA (latency > 120s or error rate > 5%) for manual override.

## Example Input
```json
{
  "source_id": "tw_public_firehose",
  "ingested_at": "2024-05-22T03:15:27Z",
  "payload": {
    "text": "Rumors about the product recall are spreading fast.",
    "lang": "en",
    "engagement": 4821,
    "attachments": []
  },
  "confidence_hint": 0.78,
  "compliance_tags": ["public", "no_pii"]
}
```

## Example Output
```json
{
  "packet_id": "pkt-94d8c1",
  "trace_id": "trace-4170",
  "narrative_entities": [
    {"type": "brand", "label": "Genaro Client A"},
    {"type": "topic", "label": "product recall"}
  ],
  "sentiment": -0.42,
  "synthetic_flags": {"deepfake": 0.03, "botnet": 0.18},
  "geo": "global",
  "trust_score": 0.72,
  "source_id": "tw_public_firehose",
  "ingested_at": "2024-05-22T03:15:27Z"
}
```

## Dependencies
- Connectors to social APIs (X, Meta), RSS aggregators, CRM exports, and third-party dark web monitors.
- Scheduler via orchestrator cron window every 5 minutes; supports ad-hoc pulls triggered by `Agents.md` workflows.
- Shared prompt assets in `assets/prompts/perception/` for sarcasm and synthetic detection tuning.

## Related Assets
- Cross-reference `Agents.md` (Perception Agents) for fleet responsibilities and orchestrator integration notes.
- Align UI telemetry with `Mock_ActiveMonitor.md` sections on Live Narrative Radar and Global Activity Map.
