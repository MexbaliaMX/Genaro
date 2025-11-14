# Dark Mockups — Genaro DFT 2.0 Legacy Static Implementation

Legacy high-fidelity, dark-theme HTML prototypes that served as the foundation for the Genaro DFT 2.0 UI experience. These static HTML files have been superseded by the new React-based dynamic frontend application in `/src/frontend/`. Each page includes interactive D3 analytics, a Three.js global narrative visual and accessibility affordances (skip links, aria labels, tooltips).

## Relationship to Current Implementation

The dynamic React frontend application in `/src/frontend/` builds upon these mockups with:
- Component-based architecture using React and TypeScript
- State management with Context API
- Dynamic data binding to API services
- Improved accessibility features
- Enhanced performance optimizations
- Automated testing and CI/CD pipeline

## Structure

```
dark_mockups/
├── index.html                # Unified Command Dashboard
├── narrative-tracker.html    # Narrative intelligence workspace
├── risk-integrity.html       # Threat detection and forensic console
├── sandbox-studio.html       # Strategy simulation and ethics studio
├── executive-briefing.html   # Board-level executive briefing
├── advertising-dashboard.html# Advertising FINOPS insights
├── style.css                 # Shared dark theme / component styling
├── charts.js                 # D3 + Three.js visualizations
├── app.js                    # Navigation highlighting, timestamp injection
└── README.md                 # (this file)
```

## Running Locally

1. From the repository root:
   ```bash
   cd dark_mockups
   python -m http.server 8000
   ```
2. Open `http://localhost:8000/index.html` in your browser.
3. Navigate using the top-right menu to the other mockups.

> **Note:** The Three.js globe requires WebGL; a fallback message is shown if WebGL is unavailable.

### Configuring Mock Data Sources

Each HTML shell declares the dataset it should display via `data-narrative-id` and
`data-brand-id` attributes on the `<body>` element. Dark mockups ship with the
`nar-global-ops` / `brand-genaro` pair pre-seeded in `mock-api.js`; update that file to
introduce additional narratives or brands before changing the attributes. When the attributes
are omitted they fall back to the default pair automatically.

## Features

- **Unified Command Dashboard:** KPI tiles, global threat gauge, D3 heatmap and Three.js narrative
  globe, activity feed.
- **Narrative Tracker:** Three-column analytical workspace with timeline, platform breakdown, and
  sentiment wave.
- **Risk & Integrity:** Multi-panel forensic analysis with bot network graph and coordination
  timeline.
- **Sandbox Studio:** Scenario builder, simulation canvas, predictive metrics and ethics advisor.
- **Executive Briefing:** Executive KPIs, threat landscape, benchmarking and recommendations.
- **Advertising Dashboard:** Spend vs. performance analytics, channel distribution, narrative
  correlation, campaign table.

## Data & Next Steps

- All charts currently render synthetic demo data. The `charts.js` module is designed to accept real
  data via a future `dataService`. See `IntegrationLayer.md` and `api/openapi.yaml` for contract
  guidance.
- Mock values are deterministic and seeded via Mulberry32 in `mock-api.js`, so page refreshes produce
  stable KPI series and make visual snapshots comparable.
- Animations respect `prefers-reduced-motion`; the globe stops rotating and force-directed networks
  settle instantly when the OS setting is enabled.
- Users can toggle between dark/light modes via the “Theme” button; the selection persists in
  `localStorage` (default is dark) and falls back to the stored value on reload.
- A companion “Expand layout” button lets you remove the max-width container on large displays. The
  preference is also stored (default is the centered layout).
- Key UX controls (filters, AI actions, “Generate Counter-Narrative”, etc.) are presently static.
  Hook them to backend endpoints or mock handlers when APIs are available.
- Accessibility audits (Lighthouse/axe) are recommended before production rollout.

## Legacy Mockups

The original light-theme HTML pages remain under `mockups/` for historical reference. New work
should use the dark mockups as the canonical UX baseline.
