# Genaro DFT 2.0 Frontend

Modern, modular JavaScript frontend implementation for the Genaro DFT 2.0 platform. This application features high-fidelity, dark-theme UI with interactive D3 analytics, a Three.js global narrative visual and accessibility affordances (skip links, aria labels, tooltips). Built with vanilla JavaScript using ES6 modules for enhanced maintainability and performance.

## Key Features

- Component-based architecture using ES6 modules
- State management with vanilla JavaScript
- Dynamic data binding to API services
- Improved accessibility features
- Enhanced performance optimizations
- Modern build system

## Structure

```
src/frontend/
├── index.html                # Unified Command Dashboard
├── narrative-tracker.html    # Narrative intelligence workspace
├── risk-integrity.html       # Threat detection and forensic console
├── sandbox-studio.html       # Strategy simulation and ethics studio
├── executive-briefing.html   # Board-level executive briefing
├── advertising-dashboard.html# Advertising FINOPS insights
├── style.css                 # Shared dark theme / component styling
├── js/
│   ├── main.js               # Main application entry point
│   ├── components/           # Reusable UI components
│   │   ├── narrativeGlobe.js # 3D visualization component
│   │   └── ...
│   ├── utils/                # Utility functions
│   │   ├── themeManager.js   # Theme management utilities
│   │   ├── layoutManager.js  # Layout management utilities
│   │   ├── animationManager.js # Animation utilities
│   │   ├── tooltipManager.js # Tooltip management utilities
│   │   └── tourManager.js    # Guided tour utilities
│   └── services/             # API and data services
│       └── apiService.js     # API service layer
├── README.md                 # (this file)
└── IssuesAndFixes.md         # Known issues and fixes
```

## Running Locally

### Static preview

1. From the repository root:
   ```bash
   cd src/frontend
   python -m http.server 8000
   ```
2. Open `http://localhost:8000/index.html` in your browser.
3. Navigate using the top-right menu to the other mockups.

> **Note:** The Three.js globe requires WebGL; a fallback message is shown if WebGL is unavailable.

### Smoke tests

- From the repository root run `npm run frontend-test` to execute the frontend smoke suite (`frontend-test-suite.js`). It verifies HTML assets exist, ES modules load, Pa11y accessibility checks (when a local HTTP server is permitted), performance optimizations, and the build pipeline.
- In CI the suite is wired into GitHub Actions; make sure it passes locally before opening a PR.

### Data Sources

Each HTML page declares the dataset it should display via `data-narrative-id` and
`data-brand-id` attributes on the `<body>` element. The application ships with the
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

## Development Approach

- Modular JavaScript using ES6 modules for better code organization
- Direct DOM manipulation for optimal performance
- D3.js and Three.js for rich visualizations
- Accessible HTML markup with proper ARIA attributes
- Responsive design with CSS Grid and Flexbox
- Modern CSS with custom properties and theming
- Asynchronous module loading for performance
