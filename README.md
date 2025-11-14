<<<<<<< HEAD
# Genaro
Digital Footprint Tracking ver. 2.0
=======
# Genaro DFT 2.0 Knowledge Base

Genaro DFT 2.0 documents the predictive and agentic reputation platform described in `Genaro.md`.
Use this repository as the single source of truth for strategy, agent specifications, and interface
blueprints while the technical implementation matures.

## How To Navigate
- Read `Genaro.md` for the platform narrative, paradigm shifts, and vertical playbooks.
- Consult `Agents.md` to understand and maintain the orchestrator story and agent family roles.
- Review `RepositoryGuidelines.md` before introducing new files, agents, or automation artifacts.
- Review the mock interface files (`Mock_*.md`) and `UIs.md` when shaping user-facing experiences.
- Check `IntegrationLayer.md` for the contract-first integration architecture specifications.
- Keep strategic primers at the root; move future agent specs into `agents/` and research workbooks
  into `research/` in line with the repository guidelines.

## Current Assets
- `Genaro.md` captures the executive vision, architectural pillars, and vertical applications.
- `Agents.md` details the perception, analytics, content, action, and orchestrator agents plus HITL
  governance.
- `UIs.md` inventories the command dashboard, sandbox, financial extensions, and other UI surfaces.
- `Mock_ActiveMonitor.md`, `Mock_ExecutiveBriefing.md`, `Mock_NarrativeTracker.md`,
  `Mock_RiskIntegrity.md`, and `Mock_SandboxStudio.md` define simulation-ready interface blueprints.
- `dark_mockups/` hosts the high-fidelity dark UI suite with D3/Three.js visualizations. See
  `dark_mockups/README.md` for instructions and feature summary.
- `mockups/` retains the legacy light-theme HTML pages for archival comparison.
- `api/openapi.yaml` and `api/asyncapi.yaml` document the REST and event contracts generated during
  the integration-layer design.
- `src/frontend/` contains the complete React-based dynamic frontend implementation with TypeScript.
- `src/api/v1/` contains the API server implementation matching the OpenAPI specification.
- `src/integration_layer/` contains the complete integration layer implementation with SDK and connectors.
- `ACCESSIBILITY_TESTS.md`, `CI_CD_SETUP.md`, `BROWSER_COMPATIBILITY.md`, and `PERFORMANCE_OPTIMIZATION.md`
  document the development, testing, and deployment processes.

## Responsive Design
The application now features fully responsive design that automatically adapts to all screen sizes:
- No more manual layout toggles: automatic sizing based on screen dimensions
- Mobile-first approach with progressive enhancement
- Touch-friendly interfaces for all interactive elements
- Optimized layouts for tablet and mobile viewing
- Consistent user experience across devices

## Working Agreements
- Documentation comes first: land strategic updates here before introducing automation or code.
- When defining or revising an agent, record scope, data contracts, guardrails, HITL escalation, and
  sample inputs/outputs; cross-reference `Agents.md`.
- If you add executable components, mirror the agent taxonomy in directory layout and pair the code
  with deterministic tests (`pytest` for Python, `npm test` for TypeScript).
- Store shared assets under `assets/` with media-specific subfolders (`assets/prompts`, `assets/figures`)
  and cite prompt text inside ```prompt``` fences.

## Previewing the Mockups
- Serve the dark mockups locally with `python -m http.server 8000` inside `dark_mockups/`, then open
  `http://localhost:8000/index.html`.
- The light-theme `mockups/` folder can be launched similarly if you need to review the prior design.
- Charts currently rely on synthetic data; see `dark_mockups/README.md` for data-integration plans.

## Command Surface
- No automation scripts are published yet. Document any new workflow in `README.md` and the script
  header, and ensure it runs on a fresh clone using only declared dependencies.

## Testing
- Run `npm test` to execute the accessibility regression suite (`accessibility-check.js`) at the repo root.
- Run `npm run frontend-test` for the frontend smoke suite (`frontend-test-suite.js`), which validates HTML assets, ES modules, accessibility via Pa11y, and the build pipeline.
- Run the secure API smoke tests from `src/api/v1` with `npm run test:api`; this exercises every REST contract (including validation failures) via `node:test` + `supertest`.
- The GitHub Actions workflow runs all three suites on every push/PR (across Node 18.x and 20.x); fix any failing step locally before opening a pull request.

## Contribution Checklist
- Keep headings in Title Case, use English prose unless a stakeholder needs Spanish context, and
  target ~100 characters per line.
- Follow conventional commits (`feat:`, `docs:`, `chore:`) and describe scenarios, agent touchpoints,
  and validation evidence in every pull request.
- Link related issues with `Refs #ID` and note follow-up tasks with a checklist before merging.
- Verify that any agent or orchestrator change leaves `Agents.md` accurate and updated with new assets.
>>>>>>> fff5496 (docs: sync dark mockups and guidelines)
