import opentype from 'opentype.js';
import { parseSVG, makeAbsolute, type CommandMadeAbsolute } from 'svg-path-parser';
import type { FontProject, Glyph } from '../types/font';
import { extractAndCleanSvgPath } from './svgParser';

/**
 * Converts an SVG path string into an opentype.Path in font coordinate space (Cartesian, baseline y=0)
 */
export function svgPathToOpentypePath(
  svgPathStr: string,
  baselineY: number = 800
): opentype.Path {
  const path = new opentype.Path();
  const cleaned = extractAndCleanSvgPath(svgPathStr);
  if (!cleaned) return path;

  let commands: CommandMadeAbsolute[];
  try {
    commands = makeAbsolute(parseSVG(cleaned));
  } catch (e) {
    console.warn('Failed to parse SVG for font compilation:', e);
    return path;
  }

  // Convert SVG coordinate (top-down) to font coordinate (y=0 at baseline, positive up)
  const toFontY = (y: number) => baselineY - y;

  let currentX = 0;
  let currentY = 0;
  let startX = 0;
  let startY = 0;

  for (const cmd of commands) {
    switch (cmd.code) {
      case 'M': {
        const x = cmd.x;
        const y = toFontY(cmd.y);
        currentX = x;
        currentY = y;
        startX = x;
        startY = y;
        path.moveTo(x, y);
        break;
      }
      case 'L':
      case 'H':
      case 'V': {
        const x = cmd.x;
        const y = toFontY(cmd.y);
        currentX = x;
        currentY = y;
        path.lineTo(x, y);
        break;
      }
      case 'C': {
        const x1 = cmd.x1;
        const y1 = toFontY(cmd.y1);
        const x2 = cmd.x2;
        const y2 = toFontY(cmd.y2);
        const x = cmd.x;
        const y = toFontY(cmd.y);
        currentX = x;
        currentY = y;
        path.bezierCurveTo(x1, y1, x2, y2, x, y);
        break;
      }
      case 'S': {
        const prevCmd = commands[commands.indexOf(cmd) - 1];
        let x1 = currentX;
        let y1 = currentY;
        if (prevCmd && prevCmd.code === 'C') {
          x1 = 2 * currentX - prevCmd.x2;
          y1 = 2 * currentY - toFontY(prevCmd.y2);
        }
        const x2 = cmd.x2;
        const y2 = toFontY(cmd.y2);
        const x = cmd.x;
        const y = toFontY(cmd.y);
        currentX = x;
        currentY = y;
        path.bezierCurveTo(x1, y1, x2, y2, x, y);
        break;
      }
      case 'Q': {
        const x1 = cmd.x1;
        const y1 = toFontY(cmd.y1);
        const x = cmd.x;
        const y = toFontY(cmd.y);
        currentX = x;
        currentY = y;
        path.quadraticCurveTo(x1, y1, x, y);
        break;
      }
      case 'Z': {
        currentX = startX;
        currentY = startY;
        path.close();
        break;
      }
    }
  }

  return path;
}

/**
 * Builds an opentype.Font instance from a FontProject
 */
export function compileFontProject(project: FontProject): opentype.Font {
  const glyphsList: opentype.Glyph[] = [];

  // 1. .notdef glyph (required glyph index 0)
  const notdefPath = new opentype.Path();
  const boxW = project.metrics.defaultAdvanceWidth * 0.6;
  const boxH = project.metrics.capHeight;
  const margin = (project.metrics.defaultAdvanceWidth - boxW) / 2;
  notdefPath.moveTo(margin, 0);
  notdefPath.lineTo(margin + boxW, 0);
  notdefPath.lineTo(margin + boxW, boxH);
  notdefPath.lineTo(margin, boxH);
  notdefPath.close();

  // Inner cutout
  const stroke = 40;
  notdefPath.moveTo(margin + stroke, stroke);
  notdefPath.lineTo(margin + stroke, boxH - stroke);
  notdefPath.lineTo(margin + boxW - stroke, boxH - stroke);
  notdefPath.lineTo(margin + boxW - stroke, stroke);
  notdefPath.close();

  glyphsList.push(
    new opentype.Glyph({
      name: '.notdef',
      unicode: 0,
      advanceWidth: project.metrics.defaultAdvanceWidth,
      path: notdefPath,
    })
  );

  // 2. Space glyph (U+0020)
  const spaceGlyph = project.glyphs[' '] || {
    char: ' ',
    unicode: 32,
    name: 'space',
    advanceWidth: project.metrics.defaultAdvanceWidth * 0.35,
    svgPath: '',
  };
  glyphsList.push(
    new opentype.Glyph({
      name: 'space',
      unicode: 32,
      advanceWidth: spaceGlyph.advanceWidth || project.metrics.defaultAdvanceWidth * 0.35,
      path: new opentype.Path(),
    })
  );

  // 3. User Glyphs
  const baselineY = project.metrics.ascender;

  for (const key of Object.keys(project.glyphs)) {
    const g: Glyph = project.glyphs[key];
    if (g.char === ' ' || g.unicode === 32) continue;

    let otPath: opentype.Path;
    if (g.svgPath && g.svgPath.trim()) {
      otPath = svgPathToOpentypePath(g.svgPath, baselineY);
    } else {
      otPath = new opentype.Path();
    }

    const glyphName = g.name || (g.char ? `uni${g.unicode.toString(16).padStart(4, '0')}` : `glyph_${g.id}`);

    glyphsList.push(
      new opentype.Glyph({
        name: glyphName,
        unicode: g.unicode,
        advanceWidth: g.advanceWidth || project.metrics.defaultAdvanceWidth,
        path: otPath,
      })
    );
  }

  // Create the opentype.Font instance
  const font = new opentype.Font({
    familyName: project.family || project.name || 'CustomFont',
    styleName: project.styleName || 'Regular',
    unitsPerEm: project.metrics.unitsPerEm || 1000,
    ascender: project.metrics.ascender || 800,
    descender: project.metrics.descender || -200,
    glyphs: glyphsList,
  });

  return font;
}

/**
 * Exports font as TTF ArrayBuffer
 */
export function exportToTtfBuffer(project: FontProject): ArrayBuffer {
  const font = compileFontProject(project);
  return font.toArrayBuffer();
}

/**
 * Creates Base64 Data URI for live browser @font-face embedding
 */
export function fontToDataUri(project: FontProject): string {
  const buffer = exportToTtfBuffer(project);
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 = btoa(binary);
  return `data:font/truetype;charset=utf-8;base64,${base64}`;
}

/**
 * Generates ready-to-use CSS @font-face snippet
 */
export function generateCssSnippet(project: FontProject, dataUri?: string): string {
  const family = project.family || project.name || 'CustomFont';
  const style = project.styleName || 'Regular';
  const isItalic = style.toLowerCase().includes('italic');
  const isBold = style.toLowerCase().includes('bold') || style.toLowerCase().includes('black');
  const fontWeight = isBold ? '700' : '400';
  const fontStyle = isItalic ? 'italic' : 'normal';

  const src = dataUri
    ? `url("${dataUri}") format("truetype")`
    : `url("./${family.replace(/\s+/g, '_')}-${style}.ttf") format("truetype"),\n       url("./${family.replace(/\s+/g, '_')}-${style}.woff2") format("woff2")`;

  return `/* @font-face declaration for ${family} ${style} */
@font-face {
  font-family: '${family}';
  src: ${src};
  font-weight: ${fontWeight};
  font-style: ${fontStyle};
  font-display: swap;
}

/* Class usage */
.font-${family.toLowerCase().replace(/\s+/g, '-')} {
  font-family: '${family}', sans-serif;
}`;
}
