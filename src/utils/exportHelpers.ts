import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import type { FontProject } from '../types/font';
import { exportToTtfBuffer, generateCssSnippet } from './fontCompiler';

/**
 * Downloads a binary file or text file in the browser
 */
export function downloadBlob(blob: Blob, filename: string) {
  saveAs(blob, filename);
}

/**
 * Downloads TTF font file
 */
export function downloadTtfFont(project: FontProject) {
  const buffer = exportToTtfBuffer(project);
  const blob = new Blob([buffer], { type: 'font/ttf' });
  const filename = `${project.family.replace(/\s+/g, '_')}-${project.styleName}.ttf`;
  downloadBlob(blob, filename);
}

/**
 * Downloads OTF font file
 */
export function downloadOtfFont(project: FontProject) {
  const buffer = exportToTtfBuffer(project);
  const blob = new Blob([buffer], { type: 'font/otf' });
  const filename = `${project.family.replace(/\s+/g, '_')}-${project.styleName}.otf`;
  downloadBlob(blob, filename);
}

/**
 * Downloads WOFF font file
 */
export function downloadWoffFont(project: FontProject) {
  const buffer = exportToTtfBuffer(project);
  const blob = new Blob([buffer], { type: 'font/woff' });
  const filename = `${project.family.replace(/\s+/g, '_')}-${project.styleName}.woff`;
  downloadBlob(blob, filename);
}

/**
 * Exports complete Web Font & SVG ZIP Package
 */
export async function downloadCompleteFontZip(project: FontProject) {
  const zip = new JSZip();
  const family = project.family.replace(/\s+/g, '_');
  const style = project.styleName;
  const ttfBuffer = exportToTtfBuffer(project);

  // Add Font Files
  zip.file(`${family}-${style}.ttf`, ttfBuffer);
  zip.file(`${family}-${style}.otf`, ttfBuffer);
  zip.file(`${family}-${style}.woff`, ttfBuffer);

  // Add Project JSON
  zip.file(`${family}_project.json`, JSON.stringify(project, null, 2));

  // Add Individual SVGs
  const svgFolder = zip.folder('svg_glyphs');
  for (const [char, glyph] of Object.entries(project.glyphs)) {
    if (glyph.svgPath) {
      const safeName = char === '/' ? 'slash' : char === ':' ? 'colon' : char === '?' ? 'question' : char;
      const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${glyph.advanceWidth || 600} 1000">
  <path d="${glyph.svgPath}" fill="currentColor" />
</svg>`;
      svgFolder?.file(`${safeName}.svg`, svgContent);
    }
  }

  // Add CSS Snippet
  const cssContent = generateCssSnippet(project);
  zip.file('font.css', cssContent);

  // Add HTML Demo Page
  const htmlDemo = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${project.family} - Font Specimen & Test</title>
  <style>
    @font-face {
      font-family: '${project.family}';
      src: url('${family}-${style}.woff') format('woff'),
           url('${family}-${style}.ttf') format('truetype');
      font-weight: normal;
      font-style: normal;
    }
    body {
      font-family: system-ui, sans-serif;
      background: #0f172a;
      color: #f8fafc;
      padding: 40px 20px;
      max-width: 900px;
      margin: 0 auto;
    }
    .custom-font {
      font-family: '${project.family}', sans-serif;
    }
    .specimen-card {
      background: #1e293b;
      border-radius: 12px;
      padding: 30px;
      margin-bottom: 24px;
      border: 1px solid #334155;
    }
    .editable-area {
      outline: none;
      border-bottom: 2px dashed #475569;
      padding-bottom: 8px;
    }
  </style>
</head>
<body>
  <h1>${project.family} (${project.styleName})</h1>
  <p style="color: #94a3b8;">Created with Font Maker 3000 by ${project.author || 'Anonymous'}</p>

  <div class="specimen-card">
    <h3 style="color: #38bdf8; margin-top: 0;">Interactive Live Tester (Click & Type)</h3>
    <div class="custom-font editable-area" contenteditable="true" style="font-size: 48px; line-height: 1.2;">
      The quick brown fox jumps over the lazy dog! 0123456789
    </div>
  </div>

  <div class="specimen-card">
    <h3 style="color: #38bdf8; margin-top: 0;">Alphabet Showcase</h3>
    <div class="custom-font" style="font-size: 32px; letter-spacing: 2px; margin-bottom: 12px;">
      ABCDEFGHIJKLMNOPQRSTUVWXYZ
    </div>
    <div class="custom-font" style="font-size: 28px; letter-spacing: 2px; margin-bottom: 12px; color: #cbd5e1;">
      abcdefghijklmnopqrstuvwxyz
    </div>
    <div class="custom-font" style="font-size: 28px; color: #a5f3fc;">
      0123456789 !?@#$%&()+-=
    </div>
  </div>
</body>
</html>`;
  zip.file('index.html', htmlDemo);

  const content = await zip.generateAsync({ type: 'blob' });
  saveAs(content, `${family}_WebFont_Package.zip`);
}

/**
 * Project Save & Load JSON
 */
export function downloadProjectJson(project: FontProject) {
  const jsonStr = JSON.stringify(project, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const filename = `${project.family.replace(/\s+/g, '_')}_project.json`;
  downloadBlob(blob, filename);
}

/**
 * LocalStorage Autosave
 */
const STORAGE_KEY = 'font_maker_current_project';

export function saveProjectToLocalStorage(project: FontProject) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(project));
  } catch (e) {
    console.warn('LocalStorage save failed:', e);
  }
}

export function loadProjectFromLocalStorage(): FontProject | null {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.warn('LocalStorage load failed:', e);
  }
  return null;
}
