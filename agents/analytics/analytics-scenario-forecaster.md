# Analytics Scenario Forecaster

## Scope
- Transforms perception packets and financial telemetry into probabilistic scenario forecasts.
- Generates ranked risk and opportunity matrices for prescriptive engines and executive dashboards.
- Maintains continuous learning loops to recalibrate crisis propagation and ROI models.

## Data Contracts
| Artifact | Direction | Description | Key Fields |
| --- | --- | --- | --- |
| `analytics_bundle` | Input | Aggregated perception packets plus financial/narrative features. | `trace_id`, `time_window`, `feature_vector`, `baseline_metrics`, `segment_tags[]` |
| `scenario_forecast` | Output | Probabilistic projection for each monitored narrative. | `narrative_id`, `forecast_horizon`, `likelihood`, `impact_score`, `confidence_band`, `recommended_actions[]` |
| `model_drift_report` | Output | Weekly health summary for orchestrator governance. | `model_id`, `drift_metric`, `last_retrain_at`, `data_gaps`, `action_required` |

## Guardrails
- Disallow training on unverified sources or artifacts tagged as quarantined by perception agents.
- Enforce explainability thresholds; forecasts must include top drivers for any impact score > 0.7.
- Block auto-publishing of forecasts if financial correlations breach compliance constraints defined by CFO policy.

## HITL Escalation Policy
- Escalate when forecast variance exceeds historical bands by > 30% or when new risk factors lack lineage.
- Trigger manual review before publishing models that recommend capital-intensive actions (> USD 1M spend).
- Notify orchestrator if required data feeds drop below minimum coverage (less than 60% of expected volume).

## Example Input
```json
{
  "trace_id": "trace-4170",
  "time_window": "2024-05-22T03:00:00Z/2024-05-22T03:15:00Z",
  "feature_vector": {
    "sentiment_avg": -0.31,
    "engagement_velocity": 1.8,
    "volatility_index": 0.62,
    "spend_delta": 0.12
  },
  "baseline_metrics": {
    "brand_equity": 0.74,
    "previous_crisis_likelihood": 0.21
  },
  "segment_tags": ["global", "investor-relations"]
}
```

## Example Output
```json
{
  "narrative_id": "nar-239",
  "forecast_horizon": "PT72H",
  "likelihood": 0.83,
  "impact_score": 0.76,
  "confidence_band": [0.69, 0.88],
  "recommended_actions": [
    "Activate executive briefing update",
    "Prioritize investor-targeted messaging playbook A"
  ],
  "top_drivers": [
    {"feature": "engagement_velocity", "weight": 0.41},
    {"feature": "volatility_index", "weight": 0.33}
  ]
}
```

## Dependencies
- Feature store shared with financial extensions and sandbox simulators (`assets/figures/feature-map.png` pending).
- Access to prescriptive engine APIs for action ranking alignment.
- Batch and streaming jobs orchestrated by central scheduler every 15 minutes plus on-demand crisis triggers.

## Related Assets
- Coordinate with `Agents.md` analytics family description to maintain orchestrator handshake consistency.
- Surface forecast outputs in the dashboards described in `UIs.md` (Unified Command Dashboard, Financial Extensions Panel).
