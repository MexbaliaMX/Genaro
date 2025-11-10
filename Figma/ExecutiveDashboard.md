# Figma Make Prompt: Dashboard Unificado - Genaro DFT 2.0

## 📋 **Prompt Principal**

```
Create a modern executive dashboard interface for "Genaro DFT 2.0" - a digital narrative intelligence and reputation risk management system. Design a comprehensive unified dashboard with the following specifications:

**Overall Layout & Style:**
- Modern, professional corporate design with premium feel
- Dark theme with accent colors: primary blue (#667eea), secondary purple (#764ba2)
- Clean, minimalist aesthetic with subtle gradients and glass morphism effects
- Grid-based layout optimized for 1440px width, responsive design principles
- Use professional typography (Inter, Roboto, or Poppins)

**Header Section (Top 80px):**
- Company logo "GENARO" with "DFT 2.0" subtitle on left
- Live status indicator showing "ACTIVE MONITORING"
- Current date/time with timezone
- User avatar and notification bell icon
- Global search bar in center

**Main Dashboard Grid (4x3 layout):**

1. **Threat Level Indicator (Top Left - Large Card)**
   - Large circular gauge showing current threat level (0-100)
   - Color-coded: Green (0-30), Yellow (31-70), Red (71-100)
   - Current reading: 67 (Orange/Yellow zone)
   - Label: "Global Threat Index"

2. **Active Narratives Counter (Top Center)**
   - Large number: "23,847"
   - Label: "Narratives Monitored"
   - Small trend arrow (up/down)
   - Mini sparkline chart below

3. **Critical Alerts Panel (Top Right)**
   - Red notification badge with "3" 
   - List of 3 critical alerts with titles:
     - "Coordinated Bot Activity - Finance Sector"
     - "Deepfake Video Detected - CEO Target"
     - "Disinformation Campaign - Election Related"
   - Each with timestamp and severity indicator

4. **Narrative Heatmap (Center Large - 2x2 space)**
   - Interactive world map showing narrative activity density
   - Heat zones in different colors (blue to red intensity)
   - Hover states showing country-specific data
   - Time selector (24h, 7d, 30d)
   - Legend showing activity levels

5. **Risk Categories Breakdown (Bottom Left)**
   - Donut chart showing risk distribution:
     - Deepfakes (23%)
     - Bot Networks (31%) 
     - Coordinated Campaigns (19%)
     - Organic Threats (27%)
   - Each segment color-coded

6. **Real-time Activity Feed (Right Side Panel)**
   - Scrollable list of recent detections
   - Each item with: timestamp, threat type icon, brief description, severity badge
   - Auto-refresh indicator
   - "View All" button at bottom

7. **Performance Metrics Row (Bottom)**
   - 4 small metric cards:
     - Detection Accuracy: 94.7%
     - Response Time: 847ms
     - Active Operations: 18
     - System Uptime: 99.97%

**Interactive Elements:**
- Hover effects on all cards
- Clickable elements with subtle animations
- Real-time updating indicators (pulsing dots)
- Dropdown filters and date pickers
- Modal preview capabilities

**Color Palette:**
- Primary: #667eea (Genaro Blue)
- Secondary: #764ba2 (Deep Purple)
- Success: #10B981 (Green)
- Warning: #F59E0B (Amber)  
- Danger: #EF4444 (Red)
- Background: #0F172A (Dark Slate)
- Cards: #1E293B (Slate 800)
- Text: #F8FAFC (Slate 50)
- Muted: #64748B (Slate 500)

**Typography Hierarchy:**
- H1: 32px, Bold (Main metrics)
- H2: 24px, Semibold (Card titles)
- H3: 18px, Medium (Section labels)
- Body: 14px, Regular (Descriptions)
- Caption: 12px, Regular (Timestamps, metadata)

**Special Requirements:**
- Include subtle data visualization elements (micro-charts, progress bars)
- Professional executive-level aesthetic
- Clear information hierarchy
- Actionable elements clearly distinguished
- Mobile-responsive considerations
- Accessibility compliant (contrast ratios, focus states)

Design this as a high-fidelity mockup ready for development handoff, with proper spacing, shadows, and modern UI patterns that convey trust, sophistication, and real-time intelligence capabilities.
```

---

## 🎨 **Prompts Complementarios**

### **Para Componentes Específicos:**

```
**Heatmap Component:**
Create an interactive world map component showing narrative threat density. Use a dark theme with glowing heat zones in gradient from blue (low activity) to red (high threat). Include country labels on hover, zoom controls, and a legend showing threat levels 1-5.

**Alert Card Component:**
Design critical alert cards with red accent borders, threat type icons (bot, deepfake, campaign), truncated titles with "..." overflow, timestamp in corner, and severity badges (Critical, High, Medium, Low). Dark theme with subtle hover animations.

**Metrics Dashboard Cards:**
Create 4 metric cards showing: Detection Accuracy (with progress ring), Response Time (with trend arrow), Active Operations (with pulse animation), System Uptime (with status indicator). Each card has large number, descriptive label, and mini-chart or icon.
```

---

## 🔧 **Especificaciones Técnicas**

### **Dimensiones y Espaciado:**
```
- Canvas: 1440x1024px
- Card padding: 24px
- Grid gap: 20px
- Border radius: 12px (cards), 6px (small elements)
- Header height: 80px
- Sidebar width: 320px (if applicable)
```

### **Estados Interactivos:**
```
- Hover: elevation increase, subtle glow
- Active: pressed state, color shift
- Loading: skeleton screens, pulse animations
- Error: red borders, warning icons
- Success: green accents, check marks
```

---

## 📱 **Consideraciones de UX**

### **Jerarquía Visual:**
```
1. Threat level indicator (largest, most prominent)
2. Critical alerts (bright red, immediate attention)
3. Main heatmap (central focus, interactive)
4. Supporting metrics (organized, scannable)
5. Activity feed (peripheral, continuous updates)
```

### **Flujos de Interacción:**
```
- Click threat indicator → Detailed threat analysis
- Click alert → Alert detail modal
- Hover map regions → Country-specific popup
- Click metrics → Drill-down dashboards
- Activity feed items → Narrative details
```

---

## ⚡ **Elementos de Tiempo Real**

```
**Live Indicators:**
- Pulsing dots for active monitoring
- Real-time counters with smooth transitions  
- Auto-refresh timestamps
- Connection status indicators
- Data streaming visualizations

**Animation Guidelines:**
- Subtle, professional animations (300ms duration)
- Ease-in-out timing functions
- Stagger animations for lists
- Loading states with skeleton UI
- Smooth transitions between states
```

Este prompt está optimizado para Figma Make y proporciona especificaciones detalladas para crear un dashboard ejecutivo profesional que refleje las capacidades avanzadas de Genaro DFT 2.0.
