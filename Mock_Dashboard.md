# Dashboard Mockup Blueprint - REFERENCE DOCUMENT

This blueprint describes the Unified Command Dashboard for the Genaro DFT 2.0 platform as implemented in the dark_mockups/index.html file. The dashboard serves as the main entry point for the platform, providing executives with a comprehensive overview of the system's monitoring and analysis capabilities.

## Implemented Features in index.html

### 1. Header Section (top-bar)
- **Branding Area**: Genaro DFT 2.0 logo and "Active Monitoring" status indicator
- **Search Bar**: Global command search with placeholder "Ask Genaro to simulate, brief, or execute…"
- **Navigation Menu**: Links to all main sections (Dashboard, Narrative Tracker, Risk & Integrity, etc.)
- **Theme Toggle**: Switch between dark/light mode with persistent storage (🌙 icon)
- **Layout Toggle**: Expand/collapse wide layout option (⇱ icon)
- **Status Indicator**: Visual threat level indicator showing "Threat Level: Elevated"

### 2. Main Content Grid (three-column layout)
- **Global Threat Index Card**: Visual gauge showing current threat level (67 - Elevated) with sparkline and industry benchmark
- **Narratives Monitored Card**: Total count of active narratives (23,847) with platform distribution legend and trending tags
- **Critical Alerts Card**: Active alerts count (3) with hourly changes and scrollable alert feed

### 3. Central Visualization Area (two-column layout)
- **Global Narrative Globe**: Three.js-based visualization of global narrative activity with fallback
- **Narrative Activity Heatmap**: Heatmap visualization of narrative activity across regions/categories
- **Real-time Activity Feed**: Scrollable list of system activities with status indicators

### 4. KPI Metrics Grid (four-column layout)
- **Detection Accuracy**: 94.7% with +1.4% trend (24h average confidence)
- **Response Time**: 847ms with ▼ 63ms improvement (Genaro orchestration)
- **Active Operations**: 18 with ▲ 2 trend (Global orchestrator)
- **System Uptime**: 99.97% with "Healthy" status (Across 156 monitored countries)

### 5. Footer Section
- **Sync Timestamp**: Shows last synchronization time with automatic updates

## Implementation Technologies

The dashboard is implemented as a static HTML page using:
- Semantic HTML with proper ARIA roles and labels
- CSS Grid and Flexbox for responsive layouts
- CSS variables for theming support
- JavaScript for interactivity (app.js) and chart rendering (charts.js)
- SVG icons for better accessibility
- Responsive design using grid templates and media queries
- Accessibility features (skip links, ARIA attributes, proper contrast)

## Data Visualization Components

- **Gauges**: Visual representation of threat levels and metrics
- **Sparklines**: Mini trend charts for historical data
- **Charts**: D3.js-based visualizations
- **Globe**: Three.js 3D visualization of global narrative activity
- **Heatmap**: Visual representation of narrative activity across dimensions

## User Experience Patterns

- **Responsive Grid Layouts**: Adapts to different screen sizes
- **Card-based Design**: Easy scanning and information grouping
- **Visual Hierarchy**: Clear emphasis on critical metrics
- **Accessibility Support**: Keyboard navigation, screen reader compatibility
- **Theme Consistency**: Dark theme with options for light theme
- **Status Indicators**: Clear visual indicators for system state

## Implemented Features

### 1. Header Section
- **Branding Area**: Genaro DFT 2.0 logo and platform title with active monitoring indicator
- **Search Bar**: Global command search with placeholder "Ask Genaro to simulate, brief, or execute…"
- **Navigation Menu**: Links to all main sections (Dashboard, Narrative Tracker, Risk & Integrity, etc.)
- **Theme Toggle**: Switch between dark/light mode with persistent storage
- **Layout Toggle**: Expand/collapse wide layout option
- **Status Indicator**: Visual threat level indicator

### 2. Alert Summary Panel
- **Global Threat Index**: Visual gauge showing current threat level with color-coded status
- **Narratives Monitored**: Total count of active narratives with growth indicators
- **Platform Distribution**: Visual breakdown of activity across different platforms
- **Tag Cloud**: Top trending narrative tags (#SupplyChain, #EnergyCrisis, etc.)
- **Quick Actions**: Direct links to Narrative Tracker and Executive Briefing

### 3. Critical Alerts Section
- **Active Alerts Count**: Total critical alerts with hourly changes
- **Historical Trend**: Sparkline visualization of alert levels
- **Real-time Feed**: Scrollable list of recent alerts with status badges
- **Severity Classification**: Critical, High, Warning, Info levels with appropriate styling

### 4. Central Visualization Area
- **3D Narrative Globe**: Three.js-based visualization of global narrative activity
- **Heatmap Chart**: Narrative activity across regions and categories
- **Fallback Message**: Shows when WebGL is unavailable with curated insight summary

### 5. Activity Feed Section
- **Real-time Updates**: Live feed of system activities
- **Status Indicators**: Clear visual status markers (Under Review, Ready, Pending HITL, etc.)
- **Actionable Items**: Clear indication of required human interventions

### 6. KPI Metrics Grid
- **Four Key Metrics**: Displayed in responsive grid layout
- **Trend Indicators**: Up/down arrows with percentage changes
- **Time Windows**: Clear indication of reporting periods (24h, 7d, 30d)

## Implementation Details

The dashboard page implements all the requirements from the MockupsDesc.md:

- Real-time data visualization using D3.js and Three.js
- Responsive grid layouts that adapt to screen size
- Accessibility features including ARIA labels and keyboard navigation
- Performance optimizations with proper resource management
- Theme support with both dark and light modes
- Interactive elements with proper feedback states
- Loading states and skeleton UI for better perceived performance

## Technical Implementation

- Built with React and TypeScript following component-based architecture
- Uses Context API for theme and layout state management
- Implements proper cleanup to prevent memory leaks
- Includes accessibility patterns and ARIA attributes
- Follows the DFT Canonical Model for data structures
- Integrates with the event bus for real-time updates

## User Experience

The dashboard provides executives with the unified command center they need for:
- Rapid assessment of overall threat landscape
- Identification of critical issues requiring attention
- Access to detailed narrative analysis
- Oversight of active campaigns and interventions
- Quick access to specialized tools and modules