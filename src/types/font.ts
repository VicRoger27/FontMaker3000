export interface FontMetrics {
  unitsPerEm: number;
  ascender: number;
  descender: number;
  capHeight: number;
  xHeight: number;
  defaultAdvanceWidth: number;
}

export interface Point {
  x: number;
  y: number;
}

export interface ControlPoint extends Point {
  id: string;
  isHandle?: boolean;
  parentPointId?: string;
  handleType?: 'in' | 'out';
}

export interface VectorNode {
  id: string;
  x: number;
  y: number;
  type: 'move' | 'line' | 'cubic' | 'quadratic' | 'close';
  handleIn?: Point;
  handleOut?: Point;
  isSelected?: boolean;
}

export interface VectorSubpath {
  id: string;
  closed: boolean;
  nodes: VectorNode[];
}

export interface Glyph {
  id: string;
  char: string;
  unicode: number;
  name: string;
  svgPath: string;
  advanceWidth: number;
  leftSideBearing?: number;
  category: 'uppercase' | 'lowercase' | 'number' | 'punctuation' | 'symbol' | 'custom';
  tags?: string[];
  isCompleted?: boolean;
  modifiedAt?: number;
}

export interface FontProject {
  id: string;
  name: string;
  family: string;
  styleName: string;
  version: string;
  author: string;
  description: string;
  metrics: FontMetrics;
  glyphs: Record<string, Glyph>;
  createdAt: number;
  updatedAt: number;
}

export type EditorTool =
  | 'select'
  | 'node'
  | 'pen'
  | 'circle'
  | 'ellipse'
  | 'rect'
  | 'roundedRect'
  | 'line'
  | 'arc'
  | 'brush'
  | 'eraser';

export interface StyleModifiers {
  weightDelta: number;
  slantAngle: number;
  widthScale: number;
  isOutline: boolean;
  outlineWidth: number;
  roundedCorners: number;
}

export type CharacterCategory = 'all' | 'uppercase' | 'lowercase' | 'numbers' | 'punctuation' | 'symbols' | 'custom';
