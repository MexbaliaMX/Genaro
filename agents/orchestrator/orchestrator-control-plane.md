# Orchestrator Control Plane

## Scope
- Prioritizes objectives, orchestrates task dependencies, and enforces HITL checkpoints across the fleet.
- Manages policy distribution, connector scheduling, and escalation routing for critical narratives.
- Provides unified observability and compliance audit logs for executive stakeholders.

## Data Contracts
| Artifact | Direction | Description | Key Fields |
| --- | --- | --- | --- |
| `orchestrator_brief` | Input | Strategic directive from C-suite or governance desks. | `brief_id`, `objectives`, `risk_tolerance`, `time_horizon`, `stakeholders[]`, `success_criteria` |
| `task_graph` | Output | Ordered set of agent tasks with dependencies and SLAs. | `graph_id`, `nodes[]`, `edges[]`, `sla_minutes`, `approvals_required[]` |
| `governance_log` | Output | Immutable event stream for audits and compliance reviews. | `event_id`, `timestamp`, `agent`, `action`, `approver`, `artefact_refs[]`, `notes` |

## Guardrails
- Enforce policy inheritance: downstream agents cannot relax guardrails defined in the orchestrator brief.
- Validate that all tasks referencing sensitive data have assigned reviewers and retention policies.
- Block execution if orchestrator detects conflicting objectives or missing compliance attestations.

## HITL Escalation Policy
- Route critical decision points to designated executives with SLA-based reminders (default 60 minutes).
- Trigger board-level notification when risk tolerance thresholds are exceeded or legal counsel requests escalation.
- Suspend automation pipelines when multiple agents raise conflicting alerts or model drift reports.

## Example Input
```json
{
  "brief_id": "brief-71",
  "objectives": [
    "Contain supply chain crisis narrative within 72 hours",
    "Protect investor confidence score above 0.7"
  ],
  "risk_tolerance": "moderate",
  "time_horizon": "PT72H",
  "stakeholders": ["CEO", "CFO", "Head of Communications"],
  "success_criteria": {
    "sentiment_floor": -0.1,
    "volatility_cap": 0.25
  }
}
```

## Example Output
```json
{
  "graph_id": "graph-71a",
  "nodes": [
    {"id": "task-ingest", "agent": "perception-signal-harvester", "status": "queued"},
    {"id": "task-forecast", "agent": "analytics-scenario-forecaster", "status": "blocked", "depends_on": ["task-ingest"]},
    {"id": "task-compose", "agent": "content-narrative-composer", "status": "queued", "approvals": ["legal"]},
    {"id": "task-deploy", "agent": "action-response-director", "status": "pending", "depends_on": ["task-compose"], "approvals": ["operations-lead-02"]}
  ],
  "edges": [
    {"from": "task-ingest", "to": "task-forecast"},
    {"from": "task-forecast", "to": "task-compose"},
    {"from": "task-compose", "to": "task-deploy"}
  ],
  "sla_minutes": 45,
  "approvals_required": ["legal", "operations-lead-02"]
}
```

## Dependencies
- Relies on workflow engine and message bus shared across agents; integrates with calendar/SLA services.
- Authenticates via enterprise IAM to enforce role-based access controls noted in governance briefs.
- Uses shared knowledge graph for traceability links to `Genaro.md` strategic objectives.

## Related Assets
- Keeper of orchestrator story described in `Agents.md`; ensure any updates remain synchronized.
- Powers UI experiences from `UIs.md` (Agent Orchestrator Console, Unified Command Dashboard).
