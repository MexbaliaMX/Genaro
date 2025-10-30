# Action Response Director

## Scope
- Executes approved playbooks across paid media, owned channels, and service desks.
- Monitors deployment telemetry to confirm alignment with predicted outcomes and ROI targets.
- Provides rollback paths and contingency actions when live responses diverge from forecasts.

## Data Contracts
| Artifact | Direction | Description | Key Fields |
| --- | --- | --- | --- |
| `deployment_order` | Input | Orchestrator instruction containing approved content and channel mix. | `order_id`, `variant_refs[]`, `channels[]`, `timing`, `budget`, `success_metrics` |
| `execution_receipt` | Output | Confirmation log sent back to orchestrator and governance systems. | `order_id`, `status`, `timestamp`, `channel_ids[]`, `errors[]`, `approver` |
| `telemetry_stream` | Output | Near-real-time performance metrics rolled up for analytics feedback. | `order_id`, `channel`, `impressions`, `clicks`, `sentiment_shift`, `cost`, `alerts[]` |

## Guardrails
- Respect channel-specific rate limits and brand safety controls defined in playbook metadata.
- Require dual-control authentication for financial commitments exceeding thresholds (> USD 100K).
- Block deployments when compliance flags remain unresolved or when sandbox simulations signal high risk.

## HITL Escalation Policy
- Escalate to operations lead if live metrics deviate from forecasts by > 20% for two consecutive intervals.
- Trigger manual override when negative sentiment spikes beyond tolerance bands or when platform policies update mid-flight.
- Notify orchestrator instantly for any failed execution receipt to prevent duplicate actions.

## Example Input
```json
{
  "order_id": "ord-512",
  "variant_refs": ["var-882a", "var-882b"],
  "channels": ["linkedin-sponsored", "crm-email"],
  "timing": {
    "start": "2024-05-22T14:00:00Z",
    "end": "2024-05-23T02:00:00Z"
  },
  "budget": 85000,
  "success_metrics": {
    "target_sentiment_shift": 0.15,
    "ctr_goal": 0.032
  }
}
```

## Example Output
```json
{
  "order_id": "ord-512",
  "status": "executed",
  "timestamp": "2024-05-22T14:05:12Z",
  "channel_ids": [
    {"channel": "linkedin-sponsored", "external_id": "ln-238930"},
    {"channel": "crm-email", "external_id": "crm-99342"}
  ],
  "errors": [],
  "approver": "operations-lead-02"
}
```

## Dependencies
- Integrations with ad platforms (Meta, LinkedIn), marketing automation suites, and customer service hubs.
- Observability pipeline shared with analytics agents for closed-loop learning.
- Scheduler hooks for playbook phasing, pause/resume controls, and platform-specific windows.

## Related Assets
- Mirrors action agent governance described in `Agents.md` and the Alert Command Center flow in `Mock_ActiveMonitor.md`.
- Connects to campaign execution experiences documented in `UIs.md` (Campaign Control Center).
