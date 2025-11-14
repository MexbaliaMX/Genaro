# Pending Tasks

1. **Pa11y static server fallback**  
   - Current frontend smoke suite tries to start a local HTTP server for Pa11y; in restricted environments (e.g., CI sandboxes without loopback permissions) it logs a warning and skips the check.  
   - TODO: introduce an alternate strategy (e.g., using `chromium --no-sandbox`, serving via a bundled CLI like `http-server`, or marking the accessibility step as `skipped` in CI artifacts) so the tests can run deterministically everywhere.

2. **Broader lint coverage**  
   - Today the CI workflow runs `npm run lint` (root) and an ESLint pass on `src/api/v1/**/*.ts`.  
   - TODO: extend lint to the frontend modules and integration layer (dedicated configs/scripts), then wire those commands into the GitHub Actions pipeline.
