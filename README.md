# Genaro DFT 2.0 Knowledge Base

Genaro DFT 2.0 documents the predictive and agentic reputation platform described in `Genaro.md`.
Use this repository as the single source of truth for strategy, agent specifications, and interface
blueprints while the technical implementation matures.

## How To Navigate
- Read `Genaro.md` for the platform narrative, paradigm shifts, and vertical playbooks.
- Consult `Agents.md` to understand and maintain the orchestrator story and agent family roles.
- Review the mock interface files (`Mock_*.md`) and `UIs.md` when shaping user-facing experiences.
- Keep strategic primers at the root; move future agent specs into `agents/` and research workbooks
  into `research/` in line with the repository guidelines.

## Current Assets
- `Genaro.md` captures the executive vision, architectural pillars, and vertical applications.
- `Agents.md` details the perception, analytics, content, action, and orchestrator agents plus HITL
  governance.
- `UIs.md` inventories the command dashboard, sandbox, financial extensions, and other UI surfaces.
- `Mock_ActiveMonitor.md`, `Mock_ExecutiveBriefing.md`, `Mock_NarrativeTracker.md`,
  `Mock_RiskIntegrity.md`, and `Mock_SandboxStudio.md` define simulation-ready interface blueprints.

## Working Agreements
- Documentation comes first: land strategic updates here before introducing automation or code.
- When defining or revising an agent, record scope, data contracts, guardrails, HITL escalation, and
  sample inputs/outputs; cross-reference `Agents.md`.
- If you add executable components, mirror the agent taxonomy in directory layout and pair the code
  with deterministic tests (`pytest` for Python, `npm test` for TypeScript).
- Store shared assets under `assets/` with media-specific subfolders (`assets/prompts`, `assets/figures`)
  and cite prompt text inside ```prompt``` fences.

## Command Surface
- No automation scripts are published yet. Document any new workflow in `README.md` and the script
  header, and ensure it runs on a fresh clone using only declared dependencies.

## Contribution Checklist
- Keep headings in Title Case, use English prose unless a stakeholder needs Spanish context, and
  target ~100 characters per line.
- Follow conventional commits (`feat:`, `docs:`, `chore:`) and describe scenarios, agent touchpoints,
  and validation evidence in every pull request.
- Link related issues with `Refs #ID` and note follow-up tasks with a checklist before merging.
- Verify that any agent or orchestrator change leaves `Agents.md` accurate and updated with new assets.
