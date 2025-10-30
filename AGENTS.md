# Repository Guidelines

## Project Structure & Module Organization
Keep strategic documents at the repository root (`Genaro.md`, `Agents.md`). Place future agent specifications under `agents/` and analytical notebooks under `research/`. When introducing executable code, mirror the agent taxonomy (perception, analytics, content, action, orchestrator) so each directory aligns with its operational role. Store shared assets—prompt libraries, data schemas, diagrams—in `assets/` with subfolders per medium (`/assets/prompts`, `/assets/figures`).

## Build, Test, and Development Commands
This repository is documentation-first. If you add automation or simulation artifacts, expose workflows through lightweight scripts (e.g., `scripts/simulate.sh`). Document any new command in the script header and in `README.md`. Before publishing a command, verify it runs cleanly on a fresh clone using only the dependencies declared in accompanying docs.

## Coding Style & Naming Conventions
Write Markdown in English unless a section targets a Spanish-speaking stakeholder; keep headings in Title Case and limit line length to ~100 characters. For code samples or utilities, prefer TypeScript or Python; use 2-space indentation for TypeScript and 4-space for Python. Name files using kebab-case for docs (`agent-orchestrator.md`) and snake_case for scripts (`run_sandbox.py`). Cite large language model prompts inside fenced code blocks labeled with the intended runtime (e.g., ```prompt```).

## Testing Guidelines
When adding executable components, pair them with deterministic tests. Python utilities should include `pytest` suites under `tests/`, while TypeScript services should rely on `npm test`. Clearly mark stochastic simulations with seed parameters and record expected outcomes in the associated Markdown file.

## Commit & Pull Request Guidelines
Follow conventional commit prefixes (`feat:`, `docs:`, `chore:`) observed in the history of related projects. Each pull request must describe the scenario addressed, the agent touchpoints, and validation evidence (logs, screenshots, or test summaries). Link tracking issues with `Refs #ID` and note any follow-up tasks in a checklist.

## Agent-Specific Instructions
Whenever you define or update an agent capability, include: scope, data contracts, guardrails, and HITL escalation policy. Provide example inputs/outputs and note dependencies on external APIs or schedulers. Before merging, ensure the orchestrator story in `Agents.md` remains accurate and cross-reference any new assets.
