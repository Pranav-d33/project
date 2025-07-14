# 🔥 RexAI — Missing Components UI Design Specification
**Extension to Production-Grade  UI Spec**
*Dark-mode first, premium tech aesthetic matching crown logo*

---

## 8. Error/Loading States

### A. Loading Components
```css
/* Skeleton Loader */
.rex-skeleton {
  background: linear-gradient(90deg, 
    var(--rex-bg-800) 25%, 
    rgba(31,182,255,0.08) 50%, 
    var(--rex-bg-800) 75%
  );
  animation: skeleton-pulse 1.5s ease-in-out infinite;
  border-radius: var(--radius);
}

/* Spinner */
.rex-spinner {
  width: 24px; height: 24px;
  border: 2px solid var(--rex-bg-800);
  border-top: 2px solid var(--rex-blue);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
```

**Layout:**
- **Chart Loading:** Full chart area filled with animated skeleton bars
- **KPI Loading:** Shimmer effect over metric numbers (32px height)
- **Global Spinner:** Center-screen, 48px diameter with rex-blue accent
- **Button Loading:** Mini spinner (16px) replaces button text, maintains width

### B. Error States
```typescript
interface ErrorState {
  type: 'network' | 'validation' | 'api' | 'critical';
  title: string;
  message: string;
  action?: 'retry' | 'refresh' | 'contact';
}
```

**Visual Design:**
- **Error Cards:** Same --rex-bg-800 background, red accent border (2px var(--rex-error))
- **Icon:** Warning triangle (24px) in rex-error color
- **Typography:** Title 18px/600, message 14px/400 in --rex-grey
- **Action Button:** Ghost style with rex-error outline

### C. Empty States
```css
.rex-empty-state {
  text-align: center;
  padding: 64px 32px;
  color: var(--rex-grey);
}

.rex-empty-icon {
  width: 64px; height: 64px;
  opacity: 0.4;
  margin-bottom: 24px;
}
```

---

## 9. Data Upload/Ingestion Interface

### A. Upload Zone
```html
<div class="rex-upload-zone" [dragover]="isDragging">
  <div class="upload-visual">
    <svg class="upload-icon">📁</svg>
    <h3>Drop forecast data here</h3>
    <p>or <button>browse files</button></p>
  </div>
  <div class="upload-specs">
    CSV, Excel • Max 50MB
  </div>
</div>
```

**Styling:**
- **Zone:** 320px × 200px, dashed border (2px var(--rex-blue), opacity 0.3)
- **Hover/Drag:** Border solid, background rex-blue-soft
- **Upload Icon:** 48px, animated bounce on hover
- **Browse Button:** Inline link style in rex-blue

### B. Progress Indicators
```css
.rex-progress-bar {
  height: 8px;
  background: var(--rex-bg-800);
  border-radius: 4px;
  overflow: hidden;
}

.rex-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--rex-blue), var(--rex-gold));
  transition: width 0.3s ease;
}
```

### C. Validation Errors
- **Error List:** Scrollable panel, max-height 240px
- **Error Item:** Row with line number, column, and description
- **Severity:** Critical (rex-error), Warning (orange #F59E0B), Info (rex-blue)

---

## 10. Analytics Dashboard Components

### A. Performance Metrics Panel
```css
.rex-analytics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.rex-metric-card {
  background: var(--rex-bg-800);
  border-radius: var(--radius);
  padding: 24px;
  box-shadow: var(--shadow-card);
}
```

**Cards Include:**
- **Forecast Accuracy:** Large percentage + trend arrow
- **Data Freshness:** Time since last update + health indicator
- **API Response Time:** Milliseconds + performance rating
- **Coverage Rate:** Percentage of SKUs with explanations

### B. Historical Trend Comparisons
```typescript
interface TrendComparison {
  period: '7d' | '30d' | '90d' | '1y';
  current: number;
  previous: number;
  change: number;
  changeType: 'improvement' | 'decline' | 'stable';
}
```

**Visual:**
- **Mini Charts:** 120px × 60px sparklines in each metric card
- **Trend Lines:** rex-blue for current period, rex-grey (dashed) for comparison
- **Change Indicators:** Up/down chevrons with color coding

---

## 11. Confidence Ring Component

### A. Ring Design
```css
.rex-confidence-ring {
  width: 80px; height: 80px;
  position: relative;
}

.rex-ring-bg {
  stroke: var(--rex-bg-800);
  stroke-width: 8;
}

.rex-ring-progress {
  stroke: var(--rex-blue);
  stroke-width: 8;
  stroke-linecap: round;
  transition: stroke-dasharray 0.8s ease;
}
```

**Placement & States:**
- **Location:** Top-right corner of each forecast card
- **Size:** 80px diameter (desktop), 60px (mobile)
- **Color Coding:**
  - High (>0.8): rex-gold
  - Medium (0.5-0.8): rex-blue  
  - Low (<0.5): rex-error
- **Animation:** Smooth arc draw-in on card load

### B. Tooltip Integration
```html
<div class="rex-confidence-tooltip">
  <div class="tooltip-header">Confidence Score</div>
  <div class="tooltip-value">{{confidence}}%</div>
  <div class="tooltip-factors">
    <span>Data Quality: High</span>
    <span>Model Accuracy: 94%</span>
  </div>
</div>
```

---

## 12. Footer/Status Bar

### A. Status Bar Layout
```css
.rex-status-bar {
  height: 32px;
  background: var(--rex-bg-900);
  border-top: 1px solid var(--rex-bg-800);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  font-size: 12px;
  color: var(--rex-grey);
}
```

**Left Section:**
- **Last Updated:** "Data refreshed 2 min ago"
- **Status Dot:** Green (connected), yellow (warning), red (error)

**Right Section:**
- **API Health:** "All systems operational" with checkmark
- **Version:** "v2.1.0"

### B. Connection Indicators
```typescript
interface ServiceStatus {
  googleTrends: 'connected' | 'degraded' | 'offline';
  newsAPI: 'connected' | 'degraded' | 'offline';
  geminiAI: 'connected' | 'degraded' | 'offline';
}
```

**Visual:** Small colored dots (8px) with service labels

---

## 13. Modal/Overlay Components

### A. Modal Container
```css
.rex-modal-overlay {
  background: rgba(10, 16, 24, 0.8);
  backdrop-filter: blur(8px);
  z-index: 1000;
}

.rex-modal {
  background: var(--rex-bg-800);
  border-radius: var(--radius);
  box-shadow: 0 20px 40px rgba(0,0,0,0.6);
  max-width: 600px;
  width: 90vw;
}
```

### B. Modal Types
**Settings Modal:**
- **Header:** "Dashboard Settings" with close X
- **Tabs:** General, Data Sources, Notifications
- **Form Sections:** Grouped with subtle dividers

**Confirmation Dialog:**
- **Size:** 400px × 200px
- **Actions:** Primary (rex-blue fill) + Secondary (ghost outline)
- **Icon:** Warning/question mark in rex-gold

**Export Dialog:**
- **Format Options:** Radio buttons with file type icons
- **Date Range:** Inline picker
- **Progress:** Upload-style progress bar

---

## 14. Form Components

### A. Input Fields
```css
.rex-input {
  background: var(--rex-bg-900);
  border: 1px solid var(--rex-bg-800);
  border-radius: 8px;
  padding: 12px 16px;
  color: var(--rex-white);
  font-size: 14px;
}

.rex-input:focus {
  border-color: var(--rex-blue);
  box-shadow: 0 0 0 3px var(--rex-blue-soft);
}
```

### B. Dropdown/Select
```css
.rex-select {
  position: relative;
  background: var(--rex-bg-800);
  border-radius: 8px;
}

.rex-select-dropdown {
  background: var(--rex-bg-800);
  border: 1px solid var(--rex-blue);
  border-radius: 8px;
  box-shadow: var(--shadow-card);
  max-height: 240px;
  overflow-y: auto;
}
```

### C. Validation States
- **Success:** Green border + checkmark icon
- **Error:** Red border + error message below
- **Warning:** Orange border + warning icon

---

## 15. Notification System

### A. Toast Notifications
```css
.rex-toast {
  background: var(--rex-bg-800);
  border-left: 4px solid var(--rex-blue);
  border-radius: var(--radius);
  padding: 16px 20px;
  box-shadow: var(--shadow-card);
  min-width: 320px;
  max-width: 480px;
}

.rex-toast.success { border-left-color: var(--rex-gold); }
.rex-toast.error { border-left-color: var(--rex-error); }
.rex-toast.warning { border-left-color: #F59E0B; }
```

**Positioning:**
- **Desktop:** Top-right, 24px from edge
- **Mobile:** Full-width at top, slide down
- **Stack:** Up to 3 visible, auto-dismiss after 5s

### B. Alert Banners
```css
.rex-alert-banner {
  background: var(--rex-error);
  color: white;
  padding: 12px 24px;
  text-align: center;
  font-weight: 500;
}
```

**Use Cases:**
- **System Maintenance:** Yellow banner across top
- **Data Issues:** Red banner with "Some forecasts may be delayed"
- **New Features:** Blue banner with announcement

---

## 16. Data Table/Grid Components

### A. Table Structure
```css
.rex-table {
  background: var(--rex-bg-800);
  border-radius: var(--radius);
  overflow: hidden;
}

.rex-table th {
  background: var(--rex-bg-900);
  color: var(--rex-grey);
  font-weight: 600;
  padding: 16px;
  border-bottom: 1px solid var(--rex-bg-800);
}

.rex-table td {
  padding: 12px 16px;
  border-bottom: 1px solid rgba(156, 163, 175, 0.1);
}
```

### B. Interactive Features
- **Row Hover:** Background lightens to rgba(31,182,255,0.05)
- **Sort Arrows:** Up/down chevrons in rex-blue when active
- **Selection:** Checkbox column with rex-blue accent
- **Pagination:** Number buttons + prev/next arrows

### C. Column Types
- **Numeric:** Right-aligned, tabular numbers
- **Status:** Colored badges (rex-gold/rex-error/rex-blue)
- **Actions:** Icon buttons (edit, delete, view)

---

## 17. Context Panel/Details View

### A. Expandable Detail Sections
```css
.rex-detail-panel {
  background: var(--rex-bg-800);
  border-radius: var(--radius);
  margin-top: 16px;
}

.rex-detail-header {
  padding: 16px 20px;
  border-bottom: 1px solid var(--rex-bg-900);
  cursor: pointer;
}

.rex-detail-content {
  padding: 20px;
  animation: slideDown 0.2s ease;
}
```

### B. Story Cards Layout
```typescript
interface StoryCard {
  type: 'insight' | 'recommendation' | 'alert';
  title: string;
  content: string;
  confidence: number;
  timestamp: Date;
}
```

**Card Design:**
- **Size:** 280px × 160px
- **Layout:** Horizontal scroll container
- **Accent:** Left border color by type
- **Content:** Title (16px/600), snippet (14px/400), metadata footer

### C. Related Insights Panel
```css
.rex-insights-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
}

.rex-insight-card {
  background: var(--rex-bg-800);
  padding: 16px;
  border-radius: 8px;
  border-left: 3px solid var(--rex-blue);
}
```

---

## 18. Responsive Breakpoints for Missing Components

### Mobile Adaptations (≤767px)
- **Upload Zone:** Full-width, 120px height
- **Confidence Rings:** 48px diameter
- **Modals:** Slide up from bottom, full-width
- **Tables:** Horizontal scroll with sticky first column
- **Toast:** Full-width at top, no rounded corners

### Tablet Adaptations (768px-1023px)
- **Analytics Grid:** 2-column layout
- **Detail Panels:** Accordion-style stacking
- **Story Cards:** 2-up grid instead of horizontal scroll

---

## 19. Animation/Transition Specifications

```css
/* Global transition timing */
:root {
  --rex-transition-fast: 0.15s ease-out;
  --rex-transition-normal: 0.3s ease-out;
  --rex-transition-slow: 0.5s ease-out;
}

/* Component-specific animations */
.rex-modal-enter { 
  transform: scale(0.95) translateY(-20px);
  opacity: 0;
  transition: all var(--rex-transition-normal);
}

.rex-toast-enter {
  transform: translateX(100%);
  transition: transform var(--rex-transition-normal);
}

.rex-table-row-hover {
  transition: background-color var(--rex-transition-fast);
}
```

---

This completes the UI specification for all missing components, maintaining consistency with the original RexAI design language while ensuring comprehensive coverage of the application's functionality.
