# Content Narrative Composer

## Scope
- Crafts strategy-aligned narratives, briefs, and micro-content across owned and paid channels.
- Tailors tone, regulatory stance, and linguistic style per target persona and regional policy.
- Supports rapid iteration inside the Digital Sandbox Studio with A/B narrative variants.

## Data Contracts
| Artifact | Direction | Description | Key Fields |
| --- | --- | --- | --- |
| `messaging_request` | Input | Orchestrator brief combining scenario context and target audience data. | `request_id`, `narrative_id`, `audience_profile`, `objective`, `channels[]`, `policies[]` |
| `content_variant` | Output | Narrative asset ready for review or deployment. | `variant_id`, `format`, `message`, `tone`, `compliance_checks`, `sandbox_metrics` |
| `review_feedback` | Input | HITL annotations or brand/legal revisions. | `variant_id`, `reviewer_role`, `decision`, `comments`, `timestamp` |

## Guardrails
- Enforce policy prompts from `assets/prompts/content/` covering disclosure, ESG posture, and crisis language.
- Auto-check outputs against banned phrase lists and jurisdictional compliance (e.g., SEC, GDPR).
- Preserve traceability by embedding `variant_id` and prompt configuration in asset metadata.

## HITL Escalation Policy
- Mandatory human approval for all high-impact channels (press releases, investor briefs, crisis statements).
- Escalate ambiguous compliance feedback to legal within 1 hour; freeze automated iteration until resolved.
- Defer to orchestrator when sandbox A/B deltas exceed predefined risk thresholds (> 25% sentiment divergence).

## Example Input
```json
{
  "request_id": "req-882",
  "narrative_id": "nar-239",
  "audience_profile": {
    "segment": "institutional-investors",
    "region": "North America",
    "language": "en-US"
  },
  "objective": "Stabilize confidence after supply chain incident",
  "channels": ["executive-brief", "linkedin"],
  "policies": ["investor-relations", "esg-disclosure"]
}
```

## Example Output
```json
{
  "variant_id": "var-882a",
  "format": "executive-brief",
  "tone": "assurance",
  "message": "Our remediation teams have already restored 92% of outbound logistics capacity...",
  "compliance_checks": ["legal-review:pending", "brand-guidelines:pass"],
  "sandbox_metrics": {
    "expected_sentiment_shift": 0.18,
    "confidence_interval": [0.11, 0.24]
  }
}
```

## Dependencies
- Uses prompt libraries curated in `assets/prompts/content/` and policy matrices from compliance partners.
- Integrates with sandbox scoring APIs for instant feedback on drafted variants.
- Requires scheduler hooks for campaign cadences and orchestrator-triggered refresh cycles.

## Related Assets
- Aligns with content agent responsibilities in `Agents.md` and sandbox flows in `Mock_SandboxStudio.md`.
- Feed finalized assets into UI workflows captured in `UIs.md` (Digital Sandbox Studio, Campaign Control Center).
