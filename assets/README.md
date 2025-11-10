# Assets Directory

Use this directory for shared assets referenced by agents, orchestrator workflows, and UI documents.
Organize resources by medium in dedicated subfolders to keep cross-functional teams aligned.

## Structure
- `prompts/`: Prompt libraries, policy packs, and guardrail templates consumed by agents. Maintain
  runtime fences (e.g., ```prompt```) inside source Markdown or JSON files. Current sets
  include governance checks (`prompts/guardrails/bias-check-v1.md`,
  `prompts/guardrails/execution-readiness-v1.md`) and compliance workflows
  (`prompts/compliance/regulatory-digest-v1.md`,
  `prompts/compliance/directive-generator-v1.md`).
- `figures/`: Diagrams, architecture illustrations, and dashboards exports. Add this folder when
  visual artifacts are ready to publish.
- `data-schemas/`: Canonical schema definitions for cross-agent contracts once formalized.

## Contribution Notes
- Reference assets by relative path in the corresponding agent or strategy files to preserve
  traceability.
- Include a short README in each subfolder describing ownership, refresh cadence, and validation
  requirements.
- Avoid committing sensitive or proprietary data; use placeholders and document retrieval paths when
  necessary.
