# 🖋️ FontMaker 3000 (FontForge Studio)

A modern, intuitive, and feature-rich typography and custom font creator web application. Easily design, style, and compile custom vector fonts (.TTF, .OTF, .WOFF, .WOFF2) directly in your browser with real-time live preview and zero-hosting web embeds.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/VicRoger27/FontMaker3000)

---

## ✨ Features

- **🎨 Dual-Mode Glyph Studio**:
  - **Visual Vector Canvas**: Precision bezier pen, freehand smoothing brush, node & curve handle editor, draggable metric guides (Baseline, Cap-Height, X-Height, Descender, Advance Width), grid snapping, and zoom controls.
  - **Shape Assistants**: One-click geometric assistants for Round 'U', Concentric 'O' / Circle, Crescent 'C', Vertical Stems, and Crossbars.
  - **Bidirectional SVG Code Studio**: Real-time SVG `<path d="..." />` and full `<svg>` tag editor with live syntax validation and bidirectional canvas synchronization.

- **🔤 Complete Character Map**:
  - Filter by Uppercase (A-Z), Lowercase (a-z), Numbers (0-9), and Symbols.
  - Add custom Unicode glyphs or symbols (`©`, `€`, `★`, `λ`, `ñ`, etc.).
  - Built-in geometric blueprints for rapid starter typography.

- **🪄 Multi-Style Master Generator**:
  - Parametric transformations to generate Italic/Oblique slant angles (-25° to +25°), Condensed/Expanded widths (50% to 180%), and weight variants with live preview.

- **💬 Live Type Sandbox & Specimen Showcase**:
  - Dynamic in-browser font compilation via `opentype.js` with instant `@font-face` injection.
  - Interactive typing sandbox with pangrams, size/line-height/letter-spacing sliders, and waterfall scale view (14px–72px).
  - Editorial Specimen Poster with 1-click Print/PDF export.

- **🚀 Font Compilation, Export & Web Hosting**:
  - Download `.TTF` (TrueType), `.OTF` (OpenType), and `.WOFF` (Web Font).
  - Complete `.ZIP` Web Font Package with fonts, individual SVG glyphs, CSS, and interactive demo tester HTML.
  - **Zero-Hosting Web Embed**: Copy instant CSS `@font-face` code snippet and Base64 Data URI strings for immediate embedding in any web project.
  - LocalStorage autosaving & `.JSON` project save/load.

---

## 🛠️ Tech Stack

- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS v4
- **Typography & Vector Engine**: `opentype.js`, `svg-path-parser`
- **Packaging & Export**: `jszip`, `file-saver`
- **Testing**: `vitest`

---

## 🚀 Quick Start

### Local Development

```bash
# Clone the repository
git clone https://github.com/VicRoger27/FontMaker3000.git
cd FontMaker3000

# Install dependencies
npm install

# Start local dev server
npm run dev
```

Visit `http://localhost:5173` in your browser.

### Run Tests

```bash
npx vitest run
```

### Production Build

```bash
npm run build
```

---

## ☁️ Deploying to Vercel

This repository is pre-configured with `vercel.json` for one-click deployment:

1. Import the repository in [Vercel Dashboard](https://vercel.com).
2. **Framework Preset**: `Vite`
3. **Build Command**: `npm run build`
4. **Output Directory**: `dist`
5. Click **Deploy**!
