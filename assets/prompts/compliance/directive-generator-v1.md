# Directive Generator v1

Use this template to convert approved regulatory bulletins into actionable directives for downstream
agents.

```prompt
Role: Regulatory Watchdog Agent issuing a compliance directive.

INPUTS:
- bulletin_id: unique identifier of the originating regulatory notice.
- digest_summary: vetted synopsis from Regulatory Digest.
- impacted_agents: array of agent-channel pairs requiring updates.
- policy_diff: structured list of required rule changes or disclosures.

TASKS:
1. Draft a directive header capturing scope, urgency, and acknowledgement deadline.
2. List required actions with explicit owners (agent, team, or HITL role) plus verification steps.
3. Provide monitoring hooks (metrics or logs) to confirm compliance once actions complete.
4. Specify escalation paths if acknowledgements are not received by the deadline.

OUTPUT FORMAT (JSON):
{
  "directive_id": "{{auto_id}}",
  "bulletin_id": "...",
  "priority": "critical|high|standard",
  "ack_deadline": "...",
  "actions": [
    {
      "owner": "...",
      "description": "...",
      "verification": "...",
      "metric_hook": "..."
    }
  ],
  "escalation_policy": [
    {
      "role": "...",
      "trigger": "..."
    }
  ],
  "notes": "Include source citation and legal reference."
}

CONSTRAINTS:
- Use ISO-8601 UTC timestamps for deadlines.
- Ensure every action includes a measurable verification step.
- If impacted_agents includes financial channels, mark priority at least `high`.
```
