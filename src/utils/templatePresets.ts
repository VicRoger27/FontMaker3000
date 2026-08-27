import type { FontMetrics, FontProject, Glyph } from '../types/font';
import { generateCirclePath, generateRectPath, generateRoundUPath } from './svgParser';

export const DEFAULT_METRICS: FontMetrics = {
  unitsPerEm: 1000,
  ascender: 800,
  descender: -200,
  capHeight: 700,
  xHeight: 500,
  defaultAdvanceWidth: 600,
};

/**
 * Standard character sets
 */
export const CHAR_PRESETS = {
  UPPERCASE: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''),
  LOWERCASE: 'abcdefghijklmnopqrstuvwxyz'.split(''),
  NUMBERS: '0123456789'.split(''),
  PUNCTUATION: ['!', '"', '#', '$', '%', '&', "'", '(', ')', '*', '+', ',', '-', '.', '/', ':', ';', '<', '=', '>', '?', '@', '[', ']', '^', '_', '{', '|', '}', '~'],
};

/**
 * Generates initial geometric blueprint SVG paths for standard letters
 * Canvas coordinate system: ViewBox 0 0 1000 1000
 * Baseline is at y=800, Cap-height at y=100 (height 700), X-height at y=300 (height 500), Descender at y=1000
 */
export function getGeometricTemplatePath(char: string): string {
  const capTop = 100;
  const baseline = 800;
  const xTop = 300;
  const stroke = 60;
  const w = 600;

  switch (char) {
    // UPPERCASE
    case 'A': {
      return [
        `M ${w / 2} ${capTop}`,
        `L ${w - 80} ${baseline}`,
        `L ${w - 80 - stroke} ${baseline}`,
        `L ${w / 2 + 50} ${baseline - 220}`,
        `L ${w / 2 - 50} ${baseline - 220}`,
        `L ${80 + stroke} ${baseline}`,
        `L 80 ${baseline}`,
        'Z',
        `M ${w / 2} ${capTop + 140}`,
        `L ${w / 2 + 35} ${baseline - 280}`,
        `L ${w / 2 - 35} ${baseline - 280}`,
        'Z',
      ].join(' ');
    }
    case 'B': {
      return [
        `M 100 ${capTop}`,
        `L ${w - 180} ${capTop}`,
        `C ${w - 80} ${capTop} ${w - 80} ${capTop + 280} ${w - 180} ${capTop + 280}`,
        `L 100 ${capTop + 280}`,
        `L ${w - 140} ${capTop + 280}`,
        `C ${w - 40} ${capTop + 280} ${w - 40} ${baseline} ${w - 140} ${baseline}`,
        `L 100 ${baseline}`,
        'Z',
        `M ${100 + stroke} ${capTop + stroke}`,
        `L ${w - 200} ${capTop + stroke}`,
        `C ${w - 140} ${capTop + stroke} ${w - 140} ${capTop + 280 - stroke} ${w - 200} ${capTop + 280 - stroke}`,
        `L ${100 + stroke} ${capTop + 280 - stroke}`,
        'Z',
        `M ${100 + stroke} ${capTop + 280 + stroke}`,
        `L ${w - 160} ${capTop + 280 + stroke}`,
        `C ${w - 100} ${capTop + 280 + stroke} ${w - 100} ${baseline - stroke} ${w - 160} ${baseline - stroke}`,
        `L ${100 + stroke} ${baseline - stroke}`,
        'Z',
      ].join(' ');
    }
    case 'C': {
      const cx = w / 2;
      const cy = (capTop + baseline) / 2;
      const r = (baseline - capTop) / 2;
      const rIn = r - stroke;
      return [
        `M ${cx + r * 0.7} ${cy - r * 0.7}`,
        `C ${cx + r * 0.3} ${cy - r} ${cx - r * 0.3} ${cy - r} ${cx - r * 0.7} ${cy - r * 0.7}`,
        `C ${cx - r} ${cy - r * 0.3} ${cx - r} ${cy + r * 0.3} ${cx - r * 0.7} ${cy + r * 0.7}`,
        `C ${cx - r * 0.3} ${cy + r} ${cx + r * 0.3} ${cy + r} ${cx + r * 0.7} ${cy + r * 0.7}`,
        `L ${cx + rIn * 0.7} ${cy + rIn * 0.7}`,
        `C ${cx + rIn * 0.2} ${cy + rIn} ${cx - rIn * 0.2} ${cy + rIn} ${cx - rIn * 0.7} ${cy + rIn * 0.7}`,
        `C ${cx - rIn} ${cy + rIn * 0.2} ${cx - rIn} ${cy - rIn * 0.2} ${cx - rIn * 0.7} ${cy - rIn * 0.7}`,
        `C ${cx - rIn * 0.2} ${cy - rIn} ${cx + rIn * 0.2} ${cy - rIn} ${cx + rIn * 0.7} ${cy - rIn * 0.7}`,
        'Z',
      ].join(' ');
    }
    case 'D': {
      return [
        `M 100 ${capTop}`,
        `L ${w - 200} ${capTop}`,
        `C ${w - 40} ${capTop} ${w - 40} ${baseline} ${w - 200} ${baseline}`,
        `L 100 ${baseline}`,
        'Z',
        `M ${100 + stroke} ${capTop + stroke}`,
        `L ${w - 200} ${capTop + stroke}`,
        `C ${w - 100} ${capTop + stroke} ${w - 100} ${baseline - stroke} ${w - 200} ${baseline - stroke}`,
        `L ${100 + stroke} ${baseline - stroke}`,
        'Z',
      ].join(' ');
    }
    case 'E': {
      return [
        `M 100 ${capTop}`,
        `L ${w - 100} ${capTop}`,
        `L ${w - 100} ${capTop + stroke}`,
        `L ${100 + stroke} ${capTop + stroke}`,
        `L ${100 + stroke} ${(capTop + baseline) / 2 - stroke / 2}`,
        `L ${w - 160} ${(capTop + baseline) / 2 - stroke / 2}`,
        `L ${w - 160} ${(capTop + baseline) / 2 + stroke / 2}`,
        `L ${100 + stroke} ${(capTop + baseline) / 2 + stroke / 2}`,
        `L ${100 + stroke} ${baseline - stroke}`,
        `L ${w - 100} ${baseline - stroke}`,
        `L ${w - 100} ${baseline}`,
        `L 100 ${baseline}`,
        'Z',
      ].join(' ');
    }
    case 'F': {
      return [
        `M 100 ${capTop}`,
        `L ${w - 100} ${capTop}`,
        `L ${w - 100} ${capTop + stroke}`,
        `L ${100 + stroke} ${capTop + stroke}`,
        `L ${100 + stroke} ${(capTop + baseline) / 2 - stroke / 2}`,
        `L ${w - 160} ${(capTop + baseline) / 2 - stroke / 2}`,
        `L ${w - 160} ${(capTop + baseline) / 2 + stroke / 2}`,
        `L ${100 + stroke} ${(capTop + baseline) / 2 + stroke / 2}`,
        `L ${100 + stroke} ${baseline}`,
        `L 100 ${baseline}`,
        'Z',
      ].join(' ');
    }
    case 'H': {
      const mid = (capTop + baseline) / 2;
      return [
        `M 100 ${capTop}`,
        `L ${100 + stroke} ${capTop}`,
        `L ${100 + stroke} ${mid - stroke / 2}`,
        `L ${w - 100 - stroke} ${mid - stroke / 2}`,
        `L ${w - 100 - stroke} ${capTop}`,
        `L ${w - 100} ${capTop}`,
        `L ${w - 100} ${baseline}`,
        `L ${w - 100 - stroke} ${baseline}`,
        `L ${w - 100 - stroke} ${mid + stroke / 2}`,
        `L ${100 + stroke} ${mid + stroke / 2}`,
        `L ${100 + stroke} ${baseline}`,
        `L 100 ${baseline}`,
        'Z',
      ].join(' ');
    }
    case 'I': {
      return generateRectPath(w / 2 - stroke / 2, capTop, stroke, baseline - capTop);
    }
    case 'L': {
      return [
        `M 100 ${capTop}`,
        `L ${100 + stroke} ${capTop}`,
        `L ${100 + stroke} ${baseline - stroke}`,
        `L ${w - 100} ${baseline - stroke}`,
        `L ${w - 100} ${baseline}`,
        `L 100 ${baseline}`,
        'Z',
      ].join(' ');
    }
    case 'O': {
      const cx = w / 2;
      const cy = (capTop + baseline) / 2;
      const rOuter = (baseline - capTop) / 2;
      const rInner = rOuter - stroke;
      return `${generateCirclePath(cx, cy, rOuter)} ${generateCirclePath(cx, cy, rInner)}`;
    }
    case 'T': {
      return [
        `M 80 ${capTop}`,
        `L ${w - 80} ${capTop}`,
        `L ${w - 80} ${capTop + stroke}`,
        `L ${w / 2 + stroke / 2} ${capTop + stroke}`,
        `L ${w / 2 + stroke / 2} ${baseline}`,
        `L ${w / 2 - stroke / 2} ${baseline}`,
        `L ${w / 2 - stroke / 2} ${capTop + stroke}`,
        `L 80 ${capTop + stroke}`,
        'Z',
      ].join(' ');
    }
    case 'U': {
      return generateRoundUPath(100, w - 100, capTop, baseline, stroke);
    }
    case 'V': {
      return [
        `M 80 ${capTop}`,
        `L ${80 + stroke} ${capTop}`,
        `L ${w / 2} ${baseline - 40}`,
        `L ${w - 80 - stroke} ${capTop}`,
        `L ${w - 80} ${capTop}`,
        `L ${w / 2 + 30} ${baseline}`,
        `L ${w / 2 - 30} ${baseline}`,
        'Z',
      ].join(' ');
    }
    case 'X': {
      return [
        `M 100 ${capTop}`,
        `L ${100 + stroke * 1.2} ${capTop}`,
        `L ${w / 2} ${(capTop + baseline) / 2}`,
        `L ${w - 100 - stroke * 1.2} ${capTop}`,
        `L ${w - 100} ${capTop}`,
        `L ${w / 2 + stroke * 0.8} ${(capTop + baseline) / 2}`,
        `L ${w - 100} ${baseline}`,
        `L ${w - 100 - stroke * 1.2} ${baseline}`,
        `L ${w / 2} ${(capTop + baseline) / 2}`,
        `L ${100 + stroke * 1.2} ${baseline}`,
        `L 100 ${baseline}`,
        `L ${w / 2 - stroke * 0.8} ${(capTop + baseline) / 2}`,
        'Z',
      ].join(' ');
    }
    // LOWERCASE
    case 'c': {
      const cx = w / 2;
      const cy = (xTop + baseline) / 2;
      const r = (baseline - xTop) / 2;
      const rIn = r - stroke;
      return [
        `M ${cx + r * 0.7} ${cy - r * 0.7}`,
        `C ${cx + r * 0.3} ${cy - r} ${cx - r * 0.3} ${cy - r} ${cx - r * 0.7} ${cy - r * 0.7}`,
        `C ${cx - r} ${cy - r * 0.3} ${cx - r} ${cy + r * 0.3} ${cx - r * 0.7} ${cy + r * 0.7}`,
        `C ${cx - r * 0.3} ${cy + r} ${cx + r * 0.3} ${cy + r} ${cx + r * 0.7} ${cy + r * 0.7}`,
        `L ${cx + rIn * 0.7} ${cy + rIn * 0.7}`,
        `C ${cx + rIn * 0.2} ${cy + rIn} ${cx - rIn * 0.2} ${cy + rIn} ${cx - rIn * 0.7} ${cy + rIn * 0.7}`,
        `C ${cx - rIn} ${cy + rIn * 0.2} ${cx - rIn} ${cy - rIn * 0.2} ${cx - rIn * 0.7} ${cy - rIn * 0.7}`,
        `C ${cx - rIn * 0.2} ${cy - rIn} ${cx + rIn * 0.2} ${cy - rIn} ${cx + rIn * 0.7} ${cy - rIn * 0.7}`,
        'Z',
      ].join(' ');
    }
    case 'l': {
      return generateRectPath(w / 2 - stroke / 2, capTop, stroke, baseline - capTop);
    }
    case 'o': {
      const cx = w / 2;
      const cy = (xTop + baseline) / 2;
      const rOuter = (baseline - xTop) / 2;
      const rInner = rOuter - stroke;
      return `${generateCirclePath(cx, cy, rOuter)} ${generateCirclePath(cx, cy, rInner)}`;
    }
    case 'u': {
      return generateRoundUPath(120, w - 120, xTop, baseline, stroke);
    }
    case 'v': {
      return [
        `M 100 ${xTop}`,
        `L ${100 + stroke} ${xTop}`,
        `L ${w / 2} ${baseline - 30}`,
        `L ${w - 100 - stroke} ${xTop}`,
        `L ${w - 100} ${xTop}`,
        `L ${w / 2 + 25} ${baseline}`,
        `L ${w / 2 - 25} ${baseline}`,
        'Z',
      ].join(' ');
    }
    case 'x': {
      return [
        `M 120 ${xTop}`,
        `L ${120 + stroke * 1.2} ${xTop}`,
        `L ${w / 2} ${(xTop + baseline) / 2}`,
        `L ${w - 120 - stroke * 1.2} ${xTop}`,
        `L ${w - 120} ${xTop}`,
        `L ${w / 2 + stroke * 0.8} ${(xTop + baseline) / 2}`,
        `L ${w - 120} ${baseline}`,
        `L ${w - 120 - stroke * 1.2} ${baseline}`,
        `L ${w / 2} ${(xTop + baseline) / 2}`,
        `L ${120 + stroke * 1.2} ${baseline}`,
        `L 120 ${baseline}`,
        `L ${w / 2 - stroke * 0.8} ${(xTop + baseline) / 2}`,
        'Z',
      ].join(' ');
    }
    case '0': {
      const cx = w / 2;
      const cy = (capTop + baseline) / 2;
      const rOuter = (baseline - capTop) / 2;
      const rInner = rOuter - stroke;
      return `${generateCirclePath(cx, cy, rOuter)} ${generateCirclePath(cx, cy, rInner)}`;
    }
    case '1': {
      return [
        `M ${w / 2 - 120} ${capTop + 140}`,
        `L ${w / 2} ${capTop}`,
        `L ${w / 2 + stroke} ${capTop}`,
        `L ${w / 2 + stroke} ${baseline}`,
        `L ${w / 2} ${baseline}`,
        `L ${w / 2} ${capTop + stroke * 1.2}`,
        `L ${w / 2 - 120} ${capTop + stroke * 1.2 + 100}`,
        'Z',
      ].join(' ');
    }
    case '-': {
      const mid = (capTop + baseline) / 2;
      return generateRectPath(120, mid - stroke / 2, w - 240, stroke);
    }
    case '+': {
      const mid = (capTop + baseline) / 2;
      const hRect = generateRectPath(120, mid - stroke / 2, w - 240, stroke);
      const vRect = generateRectPath(w / 2 - stroke / 2, mid - (w - 240) / 2, stroke, w - 240);
      return `${hRect} ${vRect}`;
    }
    case '.': {
      const sz = stroke * 1.4;
      return generateRectPath(w / 2 - sz / 2, baseline - sz, sz, sz, sz / 2);
    }
    default:
      return '';
  }
}

/**
 * Creates a complete initial FontProject
 */
export function createDefaultFontProject(
  name = 'Font Maker 3000',
  withTemplates = true
): FontProject {
  const glyphs: Record<string, Glyph> = {};
  const allChars = [
    ...CHAR_PRESETS.UPPERCASE,
    ...CHAR_PRESETS.LOWERCASE,
    ...CHAR_PRESETS.NUMBERS,
    ...CHAR_PRESETS.PUNCTUATION,
  ];

  for (const char of allChars) {
    const unicode = char.charCodeAt(0);
    const category = CHAR_PRESETS.UPPERCASE.includes(char)
      ? 'uppercase'
      : CHAR_PRESETS.LOWERCASE.includes(char)
      ? 'lowercase'
      : CHAR_PRESETS.NUMBERS.includes(char)
      ? 'number'
      : 'punctuation';

    const path = withTemplates ? getGeometricTemplatePath(char) : '';

    glyphs[char] = {
      id: `glyph_${unicode}`,
      char,
      unicode,
      name: char.toLowerCase() === char ? `uni_${char}` : `cap_${char}`,
      svgPath: path,
      advanceWidth: DEFAULT_METRICS.defaultAdvanceWidth,
      leftSideBearing: 40,
      category,
      isCompleted: !!path,
    };
  }

  return {
    id: `font_proj_${Date.now()}`,
    name,
    family: name,
    styleName: 'Regular',
    version: '1.0.0',
    author: 'Font Maker Creator',
    description: 'Custom font created with Font Maker 3000',
    metrics: { ...DEFAULT_METRICS },
    glyphs,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}
