# Regulatory Watchdog Agent

## Scope
- Monitors legislative, regulatory, and platform policy feeds across jurisdictions.
- Translates detected changes into actionable directives for content and action agents.
- Maintains compliance knowledge graphs that update orchestrator guardrails in real time.

## Data Contracts
- `regulatory_feed` (Input): Normalized bulletin from legal monitors, government APIs, or platform
  policy updates. Key fields: `bulletin_id`, `jurisdiction`, `source`, `change_type`, `summary`,
  `effective_date`, `confidence`.
- `compliance_directive` (Output): Instruction set applied to affected agents and workflows. Key
  fields: `directive_id`, `bulletin_id`, `impact_scope[]`, `policy_diff`, `required_actions[]`,
  `priority`, `ack_deadline`.
- `regulatory_audit_log` (Output): Persistent log of evaluations and acknowledgements. Key fields:
  `log_id`, `directive_id`, `agent_targets[]`, `acknowledged_by[]`, `timestamp`, `evidence_links[]`.

## Guardrails
- Validate every bulletin's provenance; reject updates without verified source URLs or attestations.
- Apply conservative defaults by blocking high-risk channels until directives are acknowledged.
- Archive superseded policies with versioning to enable rollback and legal discovery.

## HITL Escalation Policy
- Notify legal counsel when effective dates are inside 48 hours or require immediate action.
- Escalate to orchestrator overrides when directives conflict across regions.
- Require manual confirmation from compliance officers before reactivating paused playbooks.

## Example Input
```json
{
  "bulletin_id": "reg-2205",
  "jurisdiction": "EU",
  "source": "European Commission AI Office",
  "change_type": "policy-update",
  "summary": "New disclosure requirement for AI-generated political messaging.",
  "effective_date": "2024-06-01",
  "confidence": 0.92
}
```

## Example Output
```json
{
  "directive_id": "dir-2205a",
  "bulletin_id": "reg-2205",
  "impact_scope": [
    "content-narrative-composer:political-eu",
    "action-response-director:ads-eu"
  ],
  "policy_diff": "Add disclosure footer citing AI assistance and approved legal reference.",
  "required_actions": [
    "Update prompt policy set EU_POL_14",
    "Pause outbound campaigns lacking disclosure until revalidated"
  ],
  "priority": "critical",
  "ack_deadline": "2024-05-31T18:00:00Z"
}
```

## Dependencies
- Consumes legal intelligence feeds managed in `assets/prompts/compliance/`, leveraging
  `regulatory-digest-v1.md` for bulletin analysis and `directive-generator-v1.md` for
  orchestrator-ready directives.
- Synchronizes with orchestrator task graphs to inject compliance checkpoints before execution.
- Exposes directive status to dashboards outlined in `Mock_ExecutiveBriefing.md` and
  `Mock_RiskIntegrity.md`.

## Related Assets
- Complements the governance practices captured in `Agents.md` and `Genaro.md`.
- Maintains alignment with orchestrator workflows specified in `orchestrator-control-plane.md` and
  content guardrails in `content-narrative-composer.md`.
