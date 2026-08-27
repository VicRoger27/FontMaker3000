/**
 * Utilities for 48x48 Pixel Grid Font Creation and Vector Conversion
 */

export function createEmptyPixelGrid(size = 48): boolean[][] {
  const grid: boolean[][] = [];
  for (let r = 0; r < size; r++) {
    grid.push(new Array(size).fill(false));
  }
  return grid;
}

/**
 * Converts a boolean pixel grid (e.g. 48x48) into an optimized SVG Path string
 * Merges contiguous horizontal pixel spans into unified rectangular subpaths
 */
export function pixelGridToSvgPath(
  grid: boolean[][],
  viewBoxSize = 1000
): string {
  if (!grid || grid.length === 0) return '';

  const actualSize = grid.length;
  // Calculate cell size
  const scale = viewBoxSize / actualSize;
  const parts: string[] = [];

  for (let r = 0; r < actualSize; r++) {
    let cStart = -1;

    for (let c = 0; c <= actualSize; c++) {
      const isFilled = c < actualSize && grid[r][c];

      if (isFilled && cStart === -1) {
        cStart = c;
      } else if (!isFilled && cStart !== -1) {
        // We found a contiguous span from cStart to c - 1
        const spanLength = c - cStart;
        const x = Math.round(cStart * scale * 10) / 10;
        const y = Math.round(r * scale * 10) / 10;
        const w = Math.round(spanLength * scale * 10) / 10;
        const h = Math.round(scale * 10) / 10;

        // Rectangle path: M x y H x+w V y+h H x Z
        parts.push(`M ${x} ${y} H ${x + w} V ${y + h} H ${x} Z`);
        cStart = -1;
      }
    }
  }

  return parts.join(' ');
}

/**
 * Shifts the pixel grid by dx, dy with boundary wrapping/clamping
 */
export function shiftPixelGrid(grid: boolean[][], dx: number, dy: number): boolean[][] {
  const size = grid.length;
  const newGrid = createEmptyPixelGrid(size);

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c]) {
        const nr = r + dy;
        const nc = c + dx;
        if (nr >= 0 && nr < size && nc >= 0 && nc < size) {
          newGrid[nr][nc] = true;
        }
      }
    }
  }

  return newGrid;
}

/**
 * Inverts the pixel grid
 */
export function invertPixelGrid(grid: boolean[][]): boolean[][] {
  const size = grid.length;
  const newGrid = createEmptyPixelGrid(size);

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      newGrid[r][c] = !grid[r][c];
    }
  }

  return newGrid;
}

/**
 * Flips the pixel grid horizontally
 */
export function flipPixelGridH(grid: boolean[][]): boolean[][] {
  const size = grid.length;
  const newGrid = createEmptyPixelGrid(size);

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      newGrid[r][size - 1 - c] = grid[r][c];
    }
  }

  return newGrid;
}

/**
 * Flips the pixel grid vertically
 */
export function flipPixelGridV(grid: boolean[][]): boolean[][] {
  const size = grid.length;
  const newGrid = createEmptyPixelGrid(size);

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      newGrid[size - 1 - r][c] = grid[r][c];
    }
  }

  return newGrid;
}

/**
 * Flood fill algorithm for bucket tool
 */
export function floodFillPixelGrid(
  grid: boolean[][],
  startR: number,
  startC: number,
  fillVal: boolean
): boolean[][] {
  const size = grid.length;
  if (startR < 0 || startR >= size || startC < 0 || startC >= size) return grid;

  const targetVal = grid[startR][startC];
  if (targetVal === fillVal) return grid;

  const newGrid = grid.map((row) => [...row]);
  const queue: [number, number][] = [[startR, startC]];
  newGrid[startR][startC] = fillVal;

  while (queue.length > 0) {
    const [r, c] = queue.pop()!;

    const neighbors: [number, number][] = [
      [r - 1, c],
      [r + 1, c],
      [r, c - 1],
      [r, c + 1],
    ];

    for (const [nr, nc] of neighbors) {
      if (nr >= 0 && nr < size && nc >= 0 && nc < size) {
        if (newGrid[nr][nc] === targetVal) {
          newGrid[nr][nc] = fillVal;
          queue.push([nr, nc]);
        }
      }
    }
  }

  return newGrid;
}

/**
 * Bresenham Line algorithm on pixel grid
 */
export function drawPixelLine(
  grid: boolean[][],
  r0: number,
  c0: number,
  r1: number,
  c1: number,
  val: boolean
): boolean[][] {
  const newGrid = grid.map((row) => [...row]);
  const size = grid.length;

  let x0 = c0;
  let y0 = r0;
  const x1 = c1;
  const y1 = r1;

  const dx = Math.abs(x1 - x0);
  const dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;

  while (true) {
    if (y0 >= 0 && y0 < size && x0 >= 0 && x0 < size) {
      newGrid[y0][x0] = val;
    }

    if (x0 === x1 && y0 === y1) break;
    const e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      x0 += sx;
    }
    if (e2 < dx) {
      err += dx;
      y0 += sy;
    }
  }

  return newGrid;
}

/**
 * Draw rectangle on pixel grid
 */
export function drawPixelRectangle(
  grid: boolean[][],
  r0: number,
  c0: number,
  r1: number,
  c1: number,
  val: boolean,
  filled = true
): boolean[][] {
  const newGrid = grid.map((row) => [...row]);
  const size = grid.length;

  const minR = Math.max(0, Math.min(r0, r1));
  const maxR = Math.min(size - 1, Math.max(r0, r1));
  const minC = Math.max(0, Math.min(c0, c1));
  const maxC = Math.min(size - 1, Math.max(c0, c1));

  for (let r = minR; r <= maxR; r++) {
    for (let c = minC; c <= maxC; c++) {
      if (filled || r === minR || r === maxR || c === minC || c === maxC) {
        newGrid[r][c] = val;
      }
    }
  }

  return newGrid;
}

/**
 * Draw circle on pixel grid
 */
export function drawPixelCircle(
  grid: boolean[][],
  cr: number,
  cc: number,
  r: number,
  val: boolean,
  filled = true
): boolean[][] {
  const newGrid = grid.map((row) => [...row]);
  const size = grid.length;

  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      const dist = Math.hypot(row - cr, col - cc);
      if (filled) {
        if (dist <= r) {
          newGrid[row][col] = val;
        }
      } else {
        if (Math.abs(dist - r) < 0.8) {
          newGrid[row][col] = val;
        }
      }
    }
  }

  return newGrid;
}
