# Ethical Guardian Agent

## Scope
- Audits agent outputs and planned executions to enforce ethical, legal, and brand guardrails.
- Scores recommendations for fairness, bias, and compliance risk before orchestrator approval.
- Captures rationale, evidence, and remediation guidance to preserve an auditable chain of custody.

## Data Contracts
- `agent_activity_log` (Input): Structured event from perception, analytics, content, or action
  agents pending approval. Key fields: `activity_id`, `source_agent`, `task_ref`, `payload_refs[]`,
  `risk_scores`, `decision_context`.
- `ethics_audit_report` (Output): Assessment packet returned to orchestrator and governance desks.
  Key fields: `report_id`, `activity_id`, `status`, `severity`, `findings[]`, `mitigations[]`,
  `approved_by`, `timestamp`.
- `guardrail_alert` (Output): Real-time notification when critical guardrails are breached. Key
  fields: `alert_id`, `activity_id`, `breach_type`, `risk_level`, `recommended_action`,
  `notified_roles[]`.

## Guardrails
- Enforce immutable audit trails; all critiques must reference evidence hashes or payload excerpts.
- Block execution when severity >= `high` or fairness deltas exceed policy limits.
- Require dual reviewer sign-off before clearing any override to governance guardrails.

## HITL Escalation Policy
- Auto-escalate to the ethics committee when mitigation touches human subjects or legal exposure.
- Trigger executive review if repeated breaches originate from the same agent within 24 hours.
- Suspend automation when evidence confidence falls below 0.6 or required context is missing.

## Example Input
```json
{
  "activity_id": "act-451",
  "source_agent": "content-narrative-composer",
  "task_ref": "graph-71a/task-compose",
  "payload_refs": ["var-882a"],
  "risk_scores": {
    "compliance": 0.18,
    "bias": 0.27,
    "reputational": 0.35
  },
  "decision_context": {
    "objective": "Crisis investor briefing",
    "channels": ["executive-brief"],
    "approvals_pending": ["legal"]
  }
}
```

## Example Output
```json
{
  "report_id": "audit-451a",
  "activity_id": "act-451",
  "status": "changes-requested",
  "severity": "medium",
  "findings": [
    {
      "category": "bias",
      "description": "Message downplays impact on suppliers without evidence.",
      "evidence_ref": "var-882a#paragraph-2"
    }
  ],
  "mitigations": [
    "Add quantified remediation data validated by analytics agent."
  ],
  "approved_by": "ethical-guardian-agent",
  "timestamp": "2024-05-22T03:21:44Z"
}
```

## Dependencies
- Uses governance prompt packs in `assets/prompts/guardrails/`, including `bias-check-v1.md` for
  content auditing and `execution-readiness-v1.md` for deployment validation.
- Integrates with policy decision points defined in `orchestrator-control-plane.md` for workflow
  gating.
- Publishes audit metrics to the dashboards outlined in `Mock_RiskIntegrity.md`.

## Related Assets
- Extends the governance mandate described in `Agents.md` and the orchestrator dependencies in
  `orchestrator-control-plane.md`.
- Feeds compliance status cues to the Unified Command Dashboard in `UIs.md`.
