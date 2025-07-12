# Walmart Forecast Dashboard

A production-ready forecast dashboard with AI-powered explanations and confidence analytics.

## Features

- **Interactive Dashboard**: Real-time KPIs, charts, and analytics
- **AI Explanations**: Context-aware forecast explanations with confidence scoring
- **Story Mode**: Animated bullet points showing key insights
- **Confidence Ring**: Visual confidence indicator with color coding
- **What-If Scenarios**: Interactive sliders for weather and promotion impacts
- **Responsive Design**: Professional grid-based layout

## Development Setup

### Prerequisites
- Node.js (for Tailwind CSS build process)
- Python 3.8+ (for backend API)

### Tailwind CSS Setup

The project uses Tailwind CSS with a full build process for production optimization.

1. **Install Dependencies**:
```bash
npm install
```

2. **Build CSS** (for production):
```bash
npm run build-css
```

3. **Watch CSS** (for development):
```bash
npm run watch-css
```

4. **Development with polling** (if file watching doesn't work):
```bash
npm run dev-css
```

### File Structure

```
static/
├── src/
│   └── input.css          # Tailwind input file with custom styles
├── dist/
│   └── output.css         # Generated CSS (minified for production)
├── css/                   # Legacy CSS files
└── js/                    # JavaScript files

templates/
└── dashboard.html         # Main dashboard template
```

### Tailwind Configuration

- **Input**: `static/src/input.css` - Contains Tailwind directives and custom styles
- **Output**: `static/dist/output.css` - Generated CSS used by the dashboard
- **Config**: `tailwind.config.js` - Tailwind configuration with content paths
- **PostCSS**: `postcss.config.js` - PostCSS configuration with autoprefixer

### Custom Styles

The dashboard includes custom CSS for:
- Grid-based layout system
- Confidence ring animations
- Story mode typewriter effects
- Interactive hover states
- Toast notifications
- Chart container sizing

### Available Scripts

- `npm run build-css` - Build minified CSS for production
- `npm run watch-css` - Watch for changes and rebuild CSS
- `npm run dev-css` - Development mode with polling (for file system compatibility)

## Usage

1. Build the CSS:
```bash
npm run build-css
```

2. Start your Python backend server

3. Open the dashboard at your local server URL

The dashboard will load with the optimized Tailwind CSS build instead of the CDN version.

## Production Deployment

1. Run `npm run build-css` to generate the minified CSS
2. Ensure `static/dist/output.css` is included in your deployment
3. The dashboard HTML references the local CSS file for optimal performance