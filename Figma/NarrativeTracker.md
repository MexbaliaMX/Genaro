# Figma Make Prompt: Narrative Tracker - Genaro DFT 2.0

## 📋 **Prompt Principal**

```
Create an advanced narrative analysis interface for "Genaro DFT 2.0" - the Narrative Tracker module for deep narrative intelligence analysis. Design a comprehensive tracking dashboard with the following specifications:

**Overall Layout & Style:**
- Professional analytical interface with premium dark theme
- Primary colors: Genaro Blue (#667eea), Analysis Purple (#764ba2), accent colors for different narrative states
- Layout: Left sidebar (300px) + Main content area (1140px) = 1440px total width
- Height: 1024px with scrollable content areas
- Typography: Inter or Roboto for technical readability
- Subtle gradients, glass morphism effects, and data visualization focused

**Header Bar (60px height):**
- "NARRATIVE TRACKER" title with back arrow to dashboard
- Active narrative counter: "Tracking 47 narratives"
- Time range selector: "Last 7 days" dropdown
- Search/filter bar with advanced filters icon
- Export and settings icons on right

**Left Sidebar - Narrative List (300px width):**
- Search bar at top with filters dropdown
- Scrollable list of narrative items (8-10 visible)
- Each narrative card contains:
  - Narrative title (truncated with ...)
  - Threat level indicator (colored dot: green/yellow/red)
  - Key metrics row: Reach (2.3M), Velocity (+340%), Authenticity (23%)
  - Platform icons (Twitter, Facebook, TikTok, etc.)
  - Timestamp "2h ago"
  - Geographic origin flag
- Selected narrative highlighted with blue accent border
- "Load more" button at bottom

**Main Content Area - 3 Column Layout:**

**Column 1 - Narrative Overview (380px):**
1. **Narrative Header Card:**
   - Large title: "Financial Sector Disinformation Campaign"
   - Status badge: "CRITICAL" (red)
   - Confidence score: 94.7%
   - First detected: "Sep 18, 2025 14:23 UTC"
   - Key hashtags: #BankingCrisis #FedManipulation #MarketCrash

2. **Threat Assessment Panel:**
   - Circular progress indicators for:
     - Artificialness: 89% (red zone)
     - Coordination Index: 76% (orange)
     - Viral Probability: 67% (yellow)
     - Impact Potential: 92% (red)
   - Each with color-coded backgrounds and trend arrows

3. **Geographic Spread Map:**
   - Small interactive world map
   - Heat zones showing narrative concentration
   - Top 5 countries list with percentages
   - "Expand Map" button

**Column 2 - Analytics Deep Dive (380px):**
4. **Propagation Timeline:**
   - Horizontal timeline chart showing narrative spread over 7 days
   - Volume bars with color coding for organic vs artificial
   - Key events marked with icons (viral moments, bot surges)
   - Zoom controls for different time ranges

5. **Platform Breakdown:**
   - Donut chart showing distribution across platforms:
     - Twitter: 34%
     - Facebook: 28%
     - TikTok: 19%
     - Reddit: 12%
     - Others: 7%
   - Each segment clickable with hover details

6. **Sentiment Analysis Wave:**
   - Line graph showing sentiment evolution over time
   - Three lines: Overall, Authentic, Artificial sentiment
   - Color coded: green (positive), yellow (neutral), red (negative)
   - Y-axis: -100 to +100 sentiment score

**Column 3 - Evidence & Actions (380px):**
7. **Key Evidence Panel:**
   - Expandable sections:
     - "Bot Network Evidence" (127 accounts identified)
     - "Coordinated Timing" (89% synchronization)
     - "Inauthentic Amplification" (45x organic rate)
     - "Deepfake Content" (3 synthetic videos detected)
   - Each section with evidence count and "View Details" link

8. **Top Influencers/Spreaders:**
   - List of top 5 accounts spreading the narrative
   - Each item shows:
     - Avatar, username, follower count
     - Authenticity score (human/bot probability)
     - Contribution percentage to narrative spread
     - Influence network visualization (mini graph)

9. **Response Actions Panel:**
   - Action buttons:
     - "Generate Counter-Narrative" (blue button)
     - "Flag for Review" (yellow button)  
     - "Escalate to Crisis Team" (red button)
     - "Add to Watchlist" (grey button)
   - Recent actions log with timestamps

**Bottom Panel - Detailed Metrics Row:**
- 6 metric cards in a row:
  - Total Mentions: 847,392
  - Unique Users: 234,891
  - Bot Accounts: 76,442 (33%)
  - Avg. Engagement: 4.7%
  - Peak Velocity: 12.3k/hour
  - Countries Affected: 23

**Interactive Elements & States:**
- Hover effects on all clickable elements
- Expandable/collapsible sections
- Real-time data updates (pulsing indicators)
- Modal overlays for detailed views
- Drag-and-drop timeline scrubbing
- Tooltip overlays on metrics
- Loading states with skeleton screens

**Color Coding System:**
- Critical/High Risk: #EF4444 (Red)
- Medium Risk: #F59E0B (Amber) 
- Low Risk/Safe: #10B981 (Green)
- Bot Activity: #8B5CF6 (Purple)
- Human Activity: #06B6D4 (Cyan)
- Neutral: #6B7280 (Gray)
- Selected/Active: #667eea (Genaro Blue)

**Data Visualization Standards:**
- Clean, minimal charts with subtle grid lines
- Consistent color palette across all visualizations
- Clear axis labels and legends
- Hover states showing exact values
- Responsive chart sizing
- Professional financial/analytical styling

**Typography Hierarchy:**
- H1: 28px Bold (Main narrative title)
- H2: 20px Semibold (Section headers)
- H3: 16px Medium (Card titles)
- Body: 14px Regular (Main content)
- Small: 12px Regular (Metadata, timestamps)
- Micro: 11px Regular (Chart labels)

**Special Features:**
- Real-time streaming data indicators
- Forensic-grade evidence presentation
- Professional threat analysis layout
- Actionable intelligence focus
- Export capabilities for reporting
- Accessibility compliance (WCAG 2.1 AA)

Design this as a high-fidelity analytical interface that security professionals and threat analysts would use for deep narrative investigation, with emphasis on data density, clear information architecture, and actionable insights.
```

---

## 🎯 **Prompts Complementarios Específicos**

### **Para Timeline de Propagación:**
```
**Propagation Timeline Component:**
Create a horizontal timeline chart showing narrative spread over 7 days. Include volume bars (organic in blue, artificial in red), key event markers (viral spike, bot surge, media coverage), time scrubber controls, and zoom options (24h, 7d, 30d). Dark theme with subtle grid lines and hover tooltips showing exact metrics.

**Geographic Heat Map:**
Design an interactive world map component showing narrative concentration with heat zones from blue (low) to red (high intensity). Include country labels, percentage indicators, zoom controls, and a side panel listing top 5 affected countries with exact metrics and trend arrows.

**Bot Network Visualization:**
Create a network graph showing bot account relationships. Central nodes for key bot accounts, connection lines showing interaction patterns, color coding for account types (bot/human/uncertain), and a legend. Include zoom/pan controls and node selection for detailed info panels.
```

### **Para Panel de Evidencias:**
```
**Evidence Accordion Panel:**
Design expandable evidence sections with:
- "Bot Network Evidence" - 127 accounts icon + expand arrow
- "Coordinated Timing" - Synchronization graph thumbnail
- "Amplification Pattern" - Growth chart preview  
- "Synthetic Content" - Deepfake detection badge
Each section with evidence count, confidence percentage, and "View Full Report" link.

**Influencer Analysis Cards:**
Create cards for top narrative spreaders showing: circular avatar with authenticity ring (green=human, red=bot), username, follower count with growth indicator, contribution percentage to narrative, mini influence network graph, and "View Profile" button.
```

---

## 📊 **Especificaciones de Visualización**

### **Charts & Graphs:**
```
**Sentiment Wave Chart:**
- Triple line graph (Overall, Authentic, Artificial sentiment)
- Y-axis: -100 to +100 scale
- Color coding: #10B981 (positive), #F59E0B (neutral), #EF4444 (negative)
- Smooth curves with data point markers
- Crosshair cursor with value display

**Platform Distribution Donut:**
- Center showing total volume: "2.3M mentions"
- Segments: Twitter (34%), Facebook (28%), TikTok (19%), Reddit (12%), Others (7%)
- Platform logos in each segment
- Hover state showing exact numbers
- Legend with platform colors
```

### **Metric Indicators:**
```
**Threat Level Gauges:**
- Circular progress rings with percentage in center
- Color zones: 0-30% (green), 31-70% (yellow), 71-100% (red)
- Trend arrows showing direction of change
- Small sparkline showing 24h history
- Labels: "Artificialness", "Coordination", "Viral Risk", "Impact"
```

---

## 🔄 **Estados Interactivos**

### **Hover States:**
```
- Narrative cards: subtle elevation + blue accent border
- Chart elements: highlight + tooltip with exact values  
- Action buttons: color darkening + subtle scale increase
- Map regions: highlight + country data popup
- Timeline: scrubber handle + timestamp display
```

### **Loading & Empty States:**
```
- Skeleton screens for loading narrative data
- Empty state illustrations for no results
- Loading spinners for real-time updates
- Error states with retry actions
- Offline indicators with sync status
```

---

## 🎨 **Componentes Avanzados**

### **Real-time Indicators:**
```
- Pulsing dots for live data streams
- Live counters with smooth number transitions
- "Updated 3s ago" timestamps with auto-refresh
- Connection status indicators (online/offline/syncing)
- Stream velocity indicators (messages/minute)
```

### **Export & Actions:**
```
- Export dropdown: PDF Report, CSV Data, JSON API, Email Summary
- Action buttons with confirmation modals
- Bulk selection capabilities for multiple narratives
- Keyboard shortcuts for power users
- Undo/redo functionality for analysis actions
```

Este prompt está diseñado específicamente para crear una interfaz de **análisis profundo de narrativas** que permita a analistas y profesionales de seguridad investigar amenazas narrativas con el nivel de detalle forense necesario para tomar decisiones estratégicas informadas.
