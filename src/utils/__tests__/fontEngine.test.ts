import { describe, it, expect } from 'vitest';
import {
  extractAndCleanSvgPath,
  validateSvgPath,
  generateCirclePath,
  generateRoundUPath,
  generateRectPath,
  svgPathToSubpaths,
  subpathsToSvgPath,
} from '../svgParser';
import { compileFontProject, generateCssSnippet, svgPathToOpentypePath } from '../fontCompiler';
import { createDefaultFontProject } from '../templatePresets';
import { transformSvgPath, generateStyledProject } from '../styleGenerator';
import {
  createEmptyPixelGrid,
  pixelGridToSvgPath,
  shiftPixelGrid,
  invertPixelGrid,
  drawPixelLine,
} from '../pixelConverter';

describe('SVG Vector & Geometry Engine', () => {
  it('extracts and cleans raw SVG path from d attribute or markup', () => {
    const rawSvg = '<svg viewBox="0 0 100 100"><path d="M 10 10 L 90 90 Z" /></svg>';
    expect(extractAndCleanSvgPath(rawSvg)).toBe('M 10 10 L 90 90 Z');
    expect(extractAndCleanSvgPath('M 0 0 L 100 100 Z')).toBe('M 0 0 L 100 100 Z');
  });

  it('validates SVG path syntax accurately', () => {
    expect(validateSvgPath('M 10 10 L 50 50 Z').valid).toBe(true);
    expect(validateSvgPath('').valid).toBe(true);
  });

  it('generates smooth Bezier circles with 4 quadrants', () => {
    const circle = generateCirclePath(500, 500, 200);
    expect(circle).toContain('M 500 300');
    expect(circle).toContain('Z');
    expect(svgPathToSubpaths(circle).length).toBeGreaterThan(0);
  });

  it('generates perfect round U curve path', () => {
    const roundU = generateRoundUPath(100, 500, 100, 800, 60);
    expect(roundU).toContain('M 100 100');
    expect(roundU).toContain('Z');
    const subpaths = svgPathToSubpaths(roundU);
    expect(subpaths.length).toBeGreaterThan(0);
  });

  it('generates rectangular stems with optional rounded corners', () => {
    const rect = generateRectPath(100, 100, 400, 600, 10);
    expect(rect).toContain('M');
    expect(rect).toContain('Z');
  });

  it('converts vector subpaths back to SVG string seamlessly', () => {
    const original = 'M 10 10 L 50 50 L 10 50 Z';
    const subpaths = svgPathToSubpaths(original);
    const result = subpathsToSvgPath(subpaths);
    expect(result).toContain('M 10 10');
    expect(result).toContain('L 50 50');
    expect(result).toContain('Z');
  });
});

describe('48x48 Pixel Grid Engine', () => {
  it('creates empty 48x48 grid', () => {
    const grid = createEmptyPixelGrid(48);
    expect(grid.length).toBe(48);
    expect(grid[0].length).toBe(48);
    expect(grid[0][0]).toBe(false);
  });

  it('converts pixel grid into merged SVG path', () => {
    const grid = createEmptyPixelGrid(48);
    grid[10][10] = true;
    grid[10][11] = true;
    grid[10][12] = true;
    const svg = pixelGridToSvgPath(grid, 1000);
    expect(svg).toContain('M');
    expect(svg).toContain('Z');
  });

  it('shifts pixel grid properly', () => {
    const grid = createEmptyPixelGrid(48);
    grid[10][10] = true;
    const shifted = shiftPixelGrid(grid, 1, 2);
    expect(shifted[12][11]).toBe(true);
    expect(shifted[10][10]).toBe(false);
  });

  it('inverts pixel grid correctly', () => {
    const grid = createEmptyPixelGrid(48);
    grid[0][0] = true;
    const inverted = invertPixelGrid(grid);
    expect(inverted[0][0]).toBe(false);
    expect(inverted[0][1]).toBe(true);
  });

  it('draws straight pixel lines using Bresenham algorithm', () => {
    const grid = createEmptyPixelGrid(48);
    const lineGrid = drawPixelLine(grid, 0, 0, 0, 5, true);
    expect(lineGrid[0][0]).toBe(true);
    expect(lineGrid[0][5]).toBe(true);
  });
});

describe('OpenType Font Compiler', () => {
  it('compiles SVG path into opentype.Path in Cartesian space', () => {
    const otPath = svgPathToOpentypePath('M 100 100 L 500 100 L 500 800 Z', 800);
    expect(otPath.commands.length).toBeGreaterThan(0);
    const first = otPath.commands[0] as { type: string; x?: number; y?: number };
    expect(first.y).toBe(700);
  });

  it('compiles a full FontProject into valid opentype.Font', () => {
    const project = createDefaultFontProject('TestTypography', true);
    const font = compileFontProject(project);
    expect(font.glyphs.length).toBeGreaterThan(20);
    const buffer = font.toArrayBuffer();
    expect(buffer.byteLength).toBeGreaterThan(1000);
  });

  it('generates valid CSS @font-face code snippet', () => {
    const project = createDefaultFontProject('AwesomeType', false);
    const css = generateCssSnippet(project);
    expect(css).toContain("@font-face");
    expect(css).toContain("font-family: 'AwesomeType'");
  });
});

describe('Multi-Style Master Generator', () => {
  it('applies slant shear mathematical transformation for italics', () => {
    const path = 'M 300 100 L 300 800 Z';
    const slanted = transformSvgPath(path, {
      slantAngle: 15,
      widthScale: 1.0,
      weightDelta: 0,
      isOutline: false,
      outlineWidth: 10,
      roundedCorners: 0,
    }, 800, 600);

    expect(slanted).not.toBe(path);
    expect(slanted).toContain('M');
  });

  it('generates a complete styled project variant (e.g. Condensed Oblique)', () => {
    const project = createDefaultFontProject('BaseFont', true);
    const styled = generateStyledProject(project, 'Condensed Oblique', {
      slantAngle: 14,
      widthScale: 0.8,
      weightDelta: 0,
      isOutline: false,
      outlineWidth: 10,
      roundedCorners: 0,
    });

    expect(styled.styleName).toBe('Condensed Oblique');
    expect(styled.glyphs['A'].advanceWidth).toBe(Math.round(project.glyphs['A'].advanceWidth * 0.8));
  });
});
