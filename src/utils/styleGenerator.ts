import { parseSVG, makeAbsolute, type CommandMadeAbsolute } from 'svg-path-parser';
import type { FontProject, Glyph, StyleModifiers } from '../types/font';
import { extractAndCleanSvgPath } from './svgParser';

/**
 * Transforms an SVG path using mathematical transformations (Slant, Width scale, Weight/expansion)
 */
export function transformSvgPath(
  svgPathStr: string,
  modifiers: StyleModifiers,
  baselineY: number = 800,
  glyphWidth: number = 600
): string {
  const cleaned = extractAndCleanSvgPath(svgPathStr);
  if (!cleaned) return '';

  let commands: CommandMadeAbsolute[];
  try {
    commands = makeAbsolute(parseSVG(cleaned));
  } catch (e) {
    console.warn('Failed to parse SVG for transformation:', e);
    return svgPathStr;
  }

  const rad = (modifiers.slantAngle * Math.PI) / 180;
  const tanAngle = Math.tan(rad);
  const centerX = glyphWidth / 2;
  const widthScale = modifiers.widthScale || 1.0;

  // Apply shear and scale
  const transformPoint = (x: number, y: number): { x: number; y: number } => {
    const scaledX = centerX + (x - centerX) * widthScale;
    const scaledY = y;
    const distAboveBaseline = baselineY - scaledY;
    const slantedX = scaledX + distAboveBaseline * tanAngle;

    return {
      x: Math.round(slantedX * 10) / 10,
      y: Math.round(scaledY * 10) / 10,
    };
  };

  const newParts: string[] = [];

  for (const cmd of commands) {
    switch (cmd.code) {
      case 'M': {
        const pt = transformPoint(cmd.x, cmd.y);
        newParts.push(`M ${pt.x} ${pt.y}`);
        break;
      }
      case 'L':
      case 'H':
      case 'V': {
        const pt = transformPoint(cmd.x, cmd.y);
        newParts.push(`L ${pt.x} ${pt.y}`);
        break;
      }
      case 'C': {
        const cp1 = transformPoint(cmd.x1, cmd.y1);
        const cp2 = transformPoint(cmd.x2, cmd.y2);
        const pt = transformPoint(cmd.x, cmd.y);
        newParts.push(`C ${cp1.x} ${cp1.y} ${cp2.x} ${cp2.y} ${pt.x} ${pt.y}`);
        break;
      }
      case 'S': {
        const cp2 = transformPoint(cmd.x2, cmd.y2);
        const pt = transformPoint(cmd.x, cmd.y);
        newParts.push(`S ${cp2.x} ${cp2.y} ${pt.x} ${pt.y}`);
        break;
      }
      case 'Q': {
        const cp1 = transformPoint(cmd.x1, cmd.y1);
        const pt = transformPoint(cmd.x, cmd.y);
        newParts.push(`Q ${cp1.x} ${cp1.y} ${pt.x} ${pt.y}`);
        break;
      }
      case 'Z': {
        newParts.push('Z');
        break;
      }
    }
  }

  const finalPath = newParts.join(' ');
  return finalPath;
}

/**
 * Creates a new styled variant of an entire FontProject (e.g. Bold, Italic, Condensed)
 */
export function generateStyledProject(
  baseProject: FontProject,
  styleName: string,
  modifiers: StyleModifiers
): FontProject {
  const newGlyphs: Record<string, Glyph> = {};
  const baselineY = baseProject.metrics.ascender || 800;

  for (const [key, glyph] of Object.entries(baseProject.glyphs)) {
    const widthScale = modifiers.widthScale || 1.0;
    const newAdvanceWidth = Math.round(glyph.advanceWidth * widthScale);

    let newSvgPath = glyph.svgPath;
    if (glyph.svgPath) {
      newSvgPath = transformSvgPath(
        glyph.svgPath,
        modifiers,
        baselineY,
        glyph.advanceWidth
      );
    }

    newGlyphs[key] = {
      ...glyph,
      advanceWidth: newAdvanceWidth,
      svgPath: newSvgPath,
      modifiedAt: Date.now(),
    };
  }

  return {
    ...baseProject,
    id: `${baseProject.id}_${styleName.toLowerCase()}`,
    styleName: styleName,
    glyphs: newGlyphs,
    updatedAt: Date.now(),
  };
}
