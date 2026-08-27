import { parseSVG, makeAbsolute, type CommandMadeAbsolute } from 'svg-path-parser';
import type { Point, VectorSubpath } from '../types/font';

/**
 * Normalizes any SVG input: extracts path from raw <svg>...</svg> or cleans raw d="..."
 */
export function extractAndCleanSvgPath(input: string): string {
  if (!input) return '';
  const trimmed = input.trim();

  // If full SVG markup, look for <path d="..." />
  if (trimmed.includes('<svg') || trimmed.includes('<path')) {
    const dMatch = trimmed.match(/d\s*=\s*["']([^"']+)["']/i);
    if (dMatch && dMatch[1]) {
      return dMatch[1].trim();
    }
  }

  return trimmed;
}

/**
 * Validates if an SVG path string is syntactically parseable
 */
export function validateSvgPath(pathStr: string): { valid: boolean; error?: string } {
  if (!pathStr || !pathStr.trim()) {
    return { valid: true };
  }
  try {
    const cleaned = extractAndCleanSvgPath(pathStr);
    const parsed = parseSVG(cleaned);
    if (!parsed || parsed.length === 0) {
      return { valid: false, error: 'Path is empty or has no valid commands.' };
    }
    return { valid: true };
  } catch (err: unknown) {
    return { valid: false, error: (err as Error).message || 'Invalid SVG path format.' };
  }
}

/**
 * Converts an SVG Path string into VectorSubpaths containing editable VectorNodes
 */
export function svgPathToSubpaths(pathStr: string): VectorSubpath[] {
  const cleaned = extractAndCleanSvgPath(pathStr);
  if (!cleaned) return [];

  let commands: CommandMadeAbsolute[];
  try {
    commands = makeAbsolute(parseSVG(cleaned));
  } catch (e) {
    console.warn('Failed to parse SVG path:', e);
    return [];
  }

  const subpaths: VectorSubpath[] = [];
  let currentSubpath: VectorSubpath | null = null;
  let currentPos: Point = { x: 0, y: 0 };
  let startPos: Point = { x: 0, y: 0 };

  let nodeIdCounter = 0;
  const getNodeId = () => `node_${++nodeIdCounter}_${Math.random().toString(36).substr(2, 5)}`;

  for (let i = 0; i < commands.length; i++) {
    const cmd = commands[i];

    switch (cmd.code) {
      case 'M': {
        if (currentSubpath && currentSubpath.nodes.length > 0) {
          subpaths.push(currentSubpath);
        }
        currentPos = { x: cmd.x, y: cmd.y };
        startPos = { x: cmd.x, y: cmd.y };
        currentSubpath = {
          id: `subpath_${subpaths.length + 1}`,
          closed: false,
          nodes: [
            {
              id: getNodeId(),
              x: cmd.x,
              y: cmd.y,
              type: 'move',
            },
          ],
        };
        break;
      }
      case 'L':
      case 'H':
      case 'V': {
        if (!currentSubpath) {
          currentSubpath = { id: `subpath_1`, closed: false, nodes: [] };
        }
        currentPos = { x: cmd.x, y: cmd.y };
        currentSubpath.nodes.push({
          id: getNodeId(),
          x: cmd.x,
          y: cmd.y,
          type: 'line',
        });
        break;
      }
      case 'C': {
        if (!currentSubpath) {
          currentSubpath = { id: `subpath_1`, closed: false, nodes: [] };
        }
        const prevNode = currentSubpath.nodes[currentSubpath.nodes.length - 1];
        if (prevNode) {
          prevNode.handleOut = { x: cmd.x1, y: cmd.y1 };
        }
        currentPos = { x: cmd.x, y: cmd.y };
        currentSubpath.nodes.push({
          id: getNodeId(),
          x: cmd.x,
          y: cmd.y,
          type: 'cubic',
          handleIn: { x: cmd.x2, y: cmd.y2 },
        });
        break;
      }
      case 'S': {
        if (!currentSubpath) {
          currentSubpath = { id: `subpath_1`, closed: false, nodes: [] };
        }
        const prevNode = currentSubpath.nodes[currentSubpath.nodes.length - 1];
        let h1: Point = { x: currentPos.x, y: currentPos.y };
        if (prevNode && prevNode.handleOut) {
          h1 = {
            x: 2 * currentPos.x - prevNode.handleOut.x,
            y: 2 * currentPos.y - prevNode.handleOut.y,
          };
        }
        if (prevNode) {
          prevNode.handleOut = h1;
        }
        currentPos = { x: cmd.x, y: cmd.y };
        currentSubpath.nodes.push({
          id: getNodeId(),
          x: cmd.x,
          y: cmd.y,
          type: 'cubic',
          handleIn: { x: cmd.x2, y: cmd.y2 },
        });
        break;
      }
      case 'Q': {
        if (!currentSubpath) {
          currentSubpath = { id: `subpath_1`, closed: false, nodes: [] };
        }
        const cp = { x: cmd.x1, y: cmd.y1 };
        const qx0 = currentPos.x;
        const qy0 = currentPos.y;
        const qx1 = cp.x;
        const qy1 = cp.y;
        const qx2 = cmd.x;
        const qy2 = cmd.y;

        const cx1 = qx0 + (2 / 3) * (qx1 - qx0);
        const cy1 = qy0 + (2 / 3) * (qy1 - qy0);
        const cx2 = qx2 + (2 / 3) * (qx1 - qx2);
        const cy2 = qy2 + (2 / 3) * (qy1 - qy2);

        const prevNode = currentSubpath.nodes[currentSubpath.nodes.length - 1];
        if (prevNode) {
          prevNode.handleOut = { x: cx1, y: cy1 };
        }
        currentPos = { x: qx2, y: qy2 };
        currentSubpath.nodes.push({
          id: getNodeId(),
          x: qx2,
          y: qy2,
          type: 'cubic',
          handleIn: { x: cx2, y: cy2 },
        });
        break;
      }
      case 'Z': {
        if (currentSubpath) {
          currentSubpath.closed = true;
          currentPos = { ...startPos };
        }
        break;
      }
    }
  }

  if (currentSubpath && currentSubpath.nodes.length > 0) {
    subpaths.push(currentSubpath);
  }

  return subpaths;
}

/**
 * Converts VectorSubpaths back into an optimized SVG path d string
 */
export function subpathsToSvgPath(subpaths: VectorSubpath[]): string {
  if (!subpaths || subpaths.length === 0) return '';

  const round = (n: number) => Math.round(n * 100) / 100;
  const parts: string[] = [];

  for (const sp of subpaths) {
    if (sp.nodes.length === 0) continue;

    for (let i = 0; i < sp.nodes.length; i++) {
      const node = sp.nodes[i];
      if (i === 0 || node.type === 'move') {
        parts.push(`M ${round(node.x)} ${round(node.y)}`);
      } else if (node.type === 'line') {
        parts.push(`L ${round(node.x)} ${round(node.y)}`);
      } else if (node.type === 'cubic') {
        const prev = sp.nodes[i - 1];
        const h1 = prev?.handleOut || { x: prev?.x || node.x, y: prev?.y || node.y };
        const h2 = node.handleIn || { x: node.x, y: node.y };
        parts.push(
          `C ${round(h1.x)} ${round(h1.y)} ${round(h2.x)} ${round(h2.y)} ${round(node.x)} ${round(node.y)}`
        );
      }
    }

    if (sp.closed) {
      parts.push('Z');
    }
  }

  return parts.join(' ');
}

/**
 * Helper to generate a 4-point Bezier circle
 */
export function generateCirclePath(cx: number, cy: number, r: number): string {
  const k = 0.552284749831 * r;
  const round = (n: number) => Math.round(n * 10) / 10;
  return [
    `M ${round(cx)} ${round(cy - r)}`,
    `C ${round(cx + k)} ${round(cy - r)} ${round(cx + r)} ${round(cy - k)} ${round(cx + r)} ${round(cy)}`,
    `C ${round(cx + r)} ${round(cy + k)} ${round(cx + k)} ${round(cy + r)} ${round(cx)} ${round(cy + r)}`,
    `C ${round(cx - k)} ${round(cy + r)} ${round(cx - r)} ${round(cy + k)} ${round(cx - r)} ${round(cy)}`,
    `C ${round(cx - r)} ${round(cy - k)} ${round(cx - k)} ${round(cy - r)} ${round(cx)} ${round(cy - r)}`,
    'Z',
  ].join(' ');
}

/**
 * Helper to generate an Ellipse path
 */
export function generateEllipsePath(cx: number, cy: number, rx: number, ry: number): string {
  const kx = 0.552284749831 * rx;
  const ky = 0.552284749831 * ry;
  const round = (n: number) => Math.round(n * 10) / 10;
  return [
    `M ${round(cx)} ${round(cy - ry)}`,
    `C ${round(cx + kx)} ${round(cy - ry)} ${round(cx + rx)} ${round(cy - ky)} ${round(cx + rx)} ${round(cy)}`,
    `C ${round(cx + rx)} ${round(cy + ky)} ${round(cx + kx)} ${round(cy + ry)} ${round(cx)} ${round(cy + ry)}`,
    `C ${round(cx - kx)} ${round(cy + ry)} ${round(cx - rx)} ${round(cy + ky)} ${round(cx - rx)} ${round(cy)}`,
    `C ${round(cx - rx)} ${round(cy - ky)} ${round(cx - kx)} ${round(cy - ry)} ${round(cx)} ${round(cy - ry)}`,
    'Z',
  ].join(' ');
}

/**
 * Helper to generate a Smooth Round 'U' Base Curve with straight vertical stems
 */
export function generateRoundUPath(
  left: number,
  right: number,
  top: number,
  bottom: number,
  thickness: number
): string {
  const round = (n: number) => Math.round(n * 10) / 10;
  const innerLeft = left + thickness;
  const innerRight = right - thickness;
  const innerBottom = bottom - thickness;
  const outerRx = (right - left) / 2;
  const innerRx = (innerRight - innerLeft) / 2;
  const outerRy = outerRx;
  const innerRy = Math.max(10, innerRx);
  const outerCurveStartY = bottom - outerRy;
  const innerCurveStartY = innerBottom - innerRy;

  const kOut = 0.552284749831 * outerRx;
  const kIn = 0.552284749831 * innerRx;

  const cx = (left + right) / 2;

  return [
    `M ${round(left)} ${round(top)}`,
    `L ${round(left)} ${round(outerCurveStartY)}`,
    `C ${round(left)} ${round(outerCurveStartY + kOut)} ${round(cx - kOut)} ${round(bottom)} ${round(cx)} ${round(bottom)}`,
    `C ${round(cx + kOut)} ${round(bottom)} ${round(right)} ${round(outerCurveStartY + kOut)} ${round(right)} ${round(outerCurveStartY)}`,
    `L ${round(right)} ${round(top)}`,
    `L ${round(innerRight)} ${round(top)}`,
    `L ${round(innerRight)} ${round(innerCurveStartY)}`,
    `C ${round(innerRight)} ${round(innerCurveStartY + kIn)} ${round(cx + kIn)} ${round(innerBottom)} ${round(cx)} ${round(innerBottom)}`,
    `C ${round(cx - kIn)} ${round(innerBottom)} ${round(innerLeft)} ${round(innerCurveStartY + kIn)} ${round(innerLeft)} ${round(innerCurveStartY)}`,
    `L ${round(innerLeft)} ${round(top)}`,
    'Z',
  ].join(' ');
}

/**
 * Generates a standard filled rectangle path
 */
export function generateRectPath(x: number, y: number, w: number, h: number, rx = 0): string {
  const round = (n: number) => Math.round(n * 10) / 10;
  if (rx <= 0) {
    return `M ${round(x)} ${round(y)} L ${round(x + w)} ${round(y)} L ${round(x + w)} ${round(y + h)} L ${round(x)} ${round(y + h)} Z`;
  }
  const r = Math.min(rx, w / 2, h / 2);
  const k = 0.552284749831 * r;
  return [
    `M ${round(x + r)} ${round(y)}`,
    `L ${round(x + w - r)} ${round(y)}`,
    `C ${round(x + w - r + k)} ${round(y)} ${round(x + w)} ${round(y + r - k)} ${round(x + w)} ${round(y + r)}`,
    `L ${round(x + w)} ${round(y + h - r)}`,
    `C ${round(x + w)} ${round(y + h - r + k)} ${round(x + w - r + k)} ${round(y + h)} ${round(x + w - r)} ${round(y + h)}`,
    `L ${round(x + r)} ${round(y + h)}`,
    `C ${round(x + r - k)} ${round(y + h)} ${round(x)} ${round(y + h - r + k)} ${round(x)} ${round(y + h - r)}`,
    `L ${round(x)} ${round(y + r)}`,
    `C ${round(x)} ${round(y + r - k)} ${round(x + r - k)} ${round(y)} ${round(x + r)} ${round(y)}`,
    'Z',
  ].join(' ');
}
