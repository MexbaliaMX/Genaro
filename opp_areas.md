# Genaro DFT 2.0 — Updated Opportunities & Follow‑Ups

This note reflects the **current** state of the dark mockups (Nov 2023). Recent fixes already cover the previously reported gaps (`loadExternalScript`, Shepherd loader, globe fallback, error handling, etc.). The items below focus on what is **still outstanding** and reference the exact files/lines that need attention.

---

## ✅ Already Resolved

| Area | Notes |
| --- | --- |
| Dynamic script loading | Three.js is now lazy-loaded inside `dark_mockups/charts.js:1-80`. |
| Shepherd tour | `dark_mockups/app.js:1-280` includes `ensureShepherdAssets()` and only loads Shepherd on the Dashboard. |
| Chart accessibility | `setChartSummary()` in `dark_mockups/charts.js:1661-1693` injects screen-reader descriptions and wires `aria-describedby`. |
| Error handling | `hydrateCharts()` now emits per-chart errors and leaves the rest of the dashboards functional. |

---

## 🎯 Current Opportunities

### 1. CDN Security & Bundling
- **Where**: All HTML files under `dark_mockups/*.html`.
- **Issue**: external scripts (Anime.js, Day.js, D3, Tippy, Popper) are loaded without `integrity`/`crossorigin` attributes and are duplicated across pages.
- **Fix**: add SRI hashes for each CDN include and deduplicate loads by moving shared scripts into a single layout (or bundling with Vite/ESBuild).

### 2. Theme Toggle Persistence & Docs
- **Where**: `dark_mockups/app.js` and `style.css`.
- **Status**: Theme toggle works and persists to `localStorage`; ensure documentation (README) stays in sync whenever new layouts or pages are added so the toggle markup is consistent and tested.

### 3. Testing Coverage
- **Where**: project root (no automated tests for mock interactions).
- **Suggestion**: add lightweight visual regression snapshots or Cypress smoke tests to catch breaking changes when styles/scripts shift.

---

## 🚀 Suggested Next Steps

1. **Add SRI/crossorigin** for all CDN assets or ship a bundled build artifact.
2. **Document & monitor the theme toggle** whenever new pages or nav patterns are introduced.
3. **Introduce smoke testing** (manual checklist or automated) to prevent regressions in the mock environment.

These updates keep the mock environment deterministic, accessible, and closer to production constraints without undoing the recent fixes. Let me know if you’d like patches for any specific item. 
