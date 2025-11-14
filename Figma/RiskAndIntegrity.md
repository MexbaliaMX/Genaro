# Figma Make Prompt: Risk & Integrity - Genaro DFT 2.0

## 📋 **Prompt Principal**

```
Create an advanced threat detection and forensic analysis interface for "Genaro DFT 2.0" - the Risk & Integrity module for detecting manipulation, deepfakes, bots, and coordinated inauthentic behavior. Design a comprehensive security-grade analysis dashboard with the following specifications:

**Overall Layout & Style:**
- High-security forensic interface with premium dark theme
- Color palette: Security Blue (#1E40AF), Threat Red (#DC2626), Warning Amber (#D97706), Safe Green (#059669)
- Layout: Top command bar (80px) + 3-panel layout with resizable dividers
- Left panel (400px): Detection Queue, Center (640px): Analysis Workspace, Right (400px): Evidence Panel  
- Total width: 1440px, height: 1024px
- Typography: Roboto Mono for technical data, Inter for UI elements
- Military/security-grade aesthetic with sharp edges, high contrast

**Top Command Bar (80px):**
- "RISK & INTEGRITY" title with security shield icon
- Live threat counter: "Active Threats: 23" with pulsing red indicator
- Detection status: "SCANNING" with animated radar icon
- Time range selector: "Real-time | Last 24h | Last 7d"
- Alert level indicator with color-coded threat level (DEFCON-style)
- Emergency escalation button (red) "ESCALATE TO SOC"
- User badge with clearance level indicator

**Left Panel - Detection Queue (400px):**

1. **Active Scans Header:**
   - "Detection Pipeline" title
   - Scan rate: "2,347 items/min" with live counter
   - Queue depth: "14,823 pending"
   - Processing power indicator (CPU/GPU usage bars)

2. **Threat Categories Tabs:**
   - "Deepfakes" (8 active) - tab with red badge
   - "Bot Networks" (15 active) - tab with orange badge  
   - "Coordination" (12 active) - tab with yellow badge
   - "Synthetic Media" (6 active) - tab with purple badge

3. **Priority Threat Queue:**
   - Scrollable list of detected threats (15-20 items visible)
   - Each item contains:
     - Threat type icon with severity indicator
     - Brief description: "Coordinated bot cluster targeting election"
     - Confidence score: 94.7% with progress bar
     - Detection time: "2m ago"
     - Source indicators (platform icons)
     - Geographic origin flag
     - "INVESTIGATE" button
   - Selected item highlighted with blue accent
   - Auto-refresh indicator

**Center Panel - Analysis Workspace (640px):**

4. **Investigation Header:**
   - Current investigation: "Financial Sector Deepfake Campaign"
   - Case ID: "GDF-2025-091501"
   - Investigator: "Agent Martinez"
   - Classification level: "CONFIDENTIAL"
   - Evidence integrity hash: "SHA-256: a4f5..."

5. **Main Analysis Tabs:**
   - "Overview" | "Technical Analysis" | "Evidence Chain" | "Attribution"
   - Current tab: "Technical Analysis"

6. **Technical Analysis Content:**
   
   **Deepfake Detection Panel:**
   - Large preview window showing analyzed media (video/image/audio)
   - Frame-by-frame analysis timeline scrubber
   - Detection confidence heatmap overlaying media
   - Technical metrics grid:
     - Facial reenactment probability: 97.3%
     - Audio synthesis indicators: 89.1%
     - Temporal consistency score: 12.4% (suspicious)
     - Compression artifacts: "Non-standard patterns detected"
   - Comparison panel showing "Original vs Synthetic" analysis

   **Bot Network Analysis:**
   - Network graph visualization showing bot cluster relationships
   - Central command nodes highlighted in red
   - Account creation timeline showing coordinated patterns
   - Behavioral analysis metrics:
     - Activity synchronization: 89.7%
     - Content similarity index: 94.2%
     - Human behavioral deviation: 87.3%
   - Account details panel with profile analysis

   **Coordination Detection:**
   - Timeline view showing coordinated actions
   - Message timing correlation heatmap
   - Platform cross-reference analysis
   - Amplification pattern visualization
   - Geographic coordination map

7. **AI Analysis Assistant:**
   - "GENARO AI" chat interface for analysis queries
   - Recent analysis suggestions
   - Automated pattern recognition alerts
   - Confidence scoring explanations

**Right Panel - Evidence Collection (400px):**

8. **Evidence Vault:**
   - "Digital Evidence Chain" header with lock icon
   - Evidence integrity status: "SECURE" with green indicator
   - Blockchain hash verification status
   - Total evidence items: "247 artifacts"

9. **Evidence Categories:**
   - **Media Files** (47 items)
     - Screenshots, videos, audio files
     - Each with forensic hash, timestamp, source
     - Thumbnail grid with authenticity indicators
   
   - **Network Data** (89 items)  
     - IP logs, user agent strings, metadata
     - Connection patterns, timing data
     - Geographic correlation data
   
   - **Behavioral Patterns** (156 items)
     - Activity timelines, engagement patterns
     - Language analysis, sentiment correlation
     - Cross-platform behavior matching

10. **Forensic Tools Panel:**
    - "Extract Metadata" button
    - "Generate Hash" button
    - "Cross-Reference Database" button
    - "Export Evidence Package" button
    - "Chain of Custody Log" button

11. **Attribution Analysis:**
    - Threat actor profiling section
    - Known TTP (Tactics, Techniques, Procedures) matching
    - Geographic attribution with confidence levels
    - Historical pattern correlation
    - IOC (Indicators of Compromise) generation

**Bottom Status Bar (40px):**
- Real-time detection stats: "Scanned: 2.3M | Flagged: 1,847 | Confirmed: 234"
- Processing speed indicator
- Database connection status
- System security level indicator
- Last update timestamp with auto-refresh countdown

**Interactive Features:**
- Draggable panel dividers for custom layout
- Multi-select capabilities for bulk evidence operations  
- Real-time collaboration indicators (other analysts online)
- Contextual right-click menus with forensic actions
- Keyboard shortcuts overlay (Ctrl+? to display)
- Screen recording capabilities for investigation documentation

**Color Coding for Threat Levels:**
- CRITICAL: #DC2626 (Bright Red) - Immediate action required
- HIGH: #EA580C (Orange Red) - Priority investigation  
- MEDIUM: #D97706 (Amber) - Standard monitoring
- LOW: #65A30D (Yellow Green) - Routine analysis
- SAFE: #059669 (Green) - Verified authentic
- UNKNOWN: #6B7280 (Gray) - Pending analysis

**Specialized Visual Elements:**
- Authenticity confidence meters with gradient fills
- Network topology graphs with force-directed layouts
- Forensic timeline visualizations with event markers
- Heatmaps for correlation analysis
- Spectrograms for audio analysis
- Pixel-level analysis grids for image forensics

**Security & Compliance Indicators:**
- Classification level banners (CONFIDENTIAL, SECRET, etc.)
- Audit trail timestamps on all actions
- User clearance level indicators
- Data handling compliance notices
- Export restrictions warnings
- Chain of custody validation checkmarks

**Advanced Technical Displays:**
- Hexadecimal data viewers for raw analysis
- JSON/XML formatted data with syntax highlighting
- SQL query builders for database correlation
- Regex pattern matching interfaces
- Statistical analysis charts with confidence intervals
- Machine learning model confidence visualizations

**Emergency Response Elements:**
- "ESCALATE TO SOC" prominent red button
- Threat level escalation indicators
- Real-time alert notifications
- Emergency contact quick-dial
- Incident response workflow status
- Crisis communication channels

Design this as a professional-grade cybersecurity and digital forensics interface that could be used by intelligence analysts, security operations centers, and law enforcement digital forensics units. Emphasize data integrity, evidence preservation, and actionable threat intelligence with military/security-grade visual standards.
```

---

## 🔒 **Prompts Complementarios Especializados**

### **Para Detección de Deepfakes:**
```
**Deepfake Analysis Interface:**
Create a media analysis panel with large video/image preview window, frame-by-frame scrubber, confidence heatmap overlay showing manipulation zones (red=high probability), technical metrics sidebar showing facial reenactment (97.3%), audio synthesis (89.1%), temporal consistency (12.4%), and side-by-side comparison view. Include waveform analysis for audio deepfakes and pixel-level inspection tools.

**Bot Network Visualization:**
Design an interactive network graph showing bot cluster relationships with central command nodes (red circles), follower bots (smaller orange dots), legitimate accounts (blue), and connection lines showing interaction strength. Include timeline showing account creation patterns, behavioral synchronization metrics, and account detail popup with profile analysis and authenticity scores.

**Coordination Heatmap:**
Create a correlation matrix showing coordinated activity patterns across time and platforms. Use color intensity from blue (low coordination) to red (high coordination), with interactive cells showing specific metrics, timeline scrubber for temporal analysis, and geographic overlay showing coordination by region.
```

### **Para Panel de Evidencias:**
```
**Digital Evidence Vault:**
Design a forensic evidence management panel with categorized tabs (Media, Network, Behavioral), thumbnail grid with authenticity badges, chain of custody timeline, integrity hash verification status, and bulk operations toolbar. Each evidence item shows: thumbnail, file hash, timestamp, source platform, and forensic analysis status.

**Technical Analysis Dashboard:**
Create technical metrics display with confidence meters for different detection algorithms, spectrograms for audio analysis, pixel-level grids for image forensics, metadata extraction panels, and correlation analysis charts. Include AI explanation panel showing how detection confidence is calculated.
```

---

## 🛡️ **Especificaciones de Seguridad**

### **Niveles de Clasificación:**
```
**Classification Banners:**
- Top: "CONFIDENTIAL - GENARO DFT INTELLIGENCE" 
- Colors: UNCLASSIFIED (green), CONFIDENTIAL (blue), SECRET (red)
- User clearance badges with security level indicators
- Data handling warnings and export restrictions
- Audit trail indicators on all interactions
```

### **Chain of Custody:**
```
**Evidence Integrity Panel:**
- Blockchain hash verification status with green checkmarks
- Digital signature validation for evidence tampering
- Timestamp authentication with atomic clock sync
- Forensic examiner signatures and badge numbers
- Evidence handling log with all access attempts
- Export audit trail with recipient verification
```

---

## 🔍 **Herramientas Forenses Avanzadas**

### **Análisis Técnico:**
```
**Multi-Modal Detection:**
- Video analysis: Frame interpolation artifacts, compression anomalies
- Audio analysis: Spectrograms, voice synthesis indicators  
- Image analysis: Pixel forensics, EXIF metadata validation
- Text analysis: Stylometry, linguistic patterns, bot signatures
- Network analysis: Traffic correlation, timing patterns
```

### **Visualizaciones Especializadas:**
```
**Forensic Timelines:**
- Multi-layered timeline showing: content creation, distribution, engagement
- Event markers for key manipulation events
- Cross-platform correlation indicators
- Temporal clustering analysis for coordinated campaigns
- Interactive zoom from seconds to months resolution
```

---

## ⚡ **Estados Dinámicos**

### **Detección en Tiempo Real:**
```
**Live Detection Indicators:**
- Pulsing radar animation for active scanning
- Real-time threat counter with smooth increments
- Live queue depth with color-coded urgency
- Processing speed meters with CPU/GPU utilization
- Connection status to threat intelligence feeds
```

### **Estados de Investigación:**
```
**Investigation Workflow:**
- Status badges: "SCANNING", "ANALYZING", "UNDER REVIEW", "CONFIRMED", "ESCALATED"
- Progress bars for long-running analysis tasks
- Collaboration indicators showing other analysts working
- Version control for investigation updates
- Auto-save indicators with timestamp
```

---

## 🚨 **Elementos de Crisis**

### **Escalación de Amenazas:**
```
**Emergency Response UI:**
- DEFCON-style threat level indicator (1-5 scale)
- "ESCALATE TO SOC" button with confirmation modal
- Emergency contact quick-dial with security clearance verification
- Automated alert distribution to stakeholders
- Crisis communication channel activation
- Incident response playbook integration
```

Este prompt está diseñado para crear una interfaz de **grado militar/intelligence** que proporcione capacidades forenses avanzadas para detectar y analizar amenazas de manipulación digital con el más alto nivel de rigor técnico y cadena de custodia requerido para evidencia legal.
