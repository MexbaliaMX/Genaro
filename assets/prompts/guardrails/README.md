# Guardrails Prompt Pack

This folder stores governance prompt templates and policy snippets consumed by the Ethical Guardian Agent and other reviewers that enforce fairness, compliance, and reputational safeguards.

## Usage
- Format prompts as Markdown or JSON with fenced ```prompt``` blocks so downstream tooling can ingest them deterministically.
- Version prompts with semantic identifiers (e.g., `bias-check-v1`) and reference them in agent metadata (`ethical-guardian-agent.md`) to maintain lineage.
- Document any external frameworks or regulatory sources that inform the guardrail logic.

## Maintenance
- Review prompts alongside HITL policy updates or when new risk categories emerge.
- Coordinate changes with the orchestrator team to ensure workflow gating rules remain synchronized.
- Archive superseded prompts in a dated subfolder if approvals require historical reference.
