import React, { useState, useEffect, useCallback } from 'react';
import {
  Pencil,
  Eraser,
  PaintBucket,
  Square,
  Circle,
  Minus,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  RefreshCw,
  FlipHorizontal,
  FlipVertical,
  Contrast,
  Grid,
} from 'lucide-react';
import type { PixelTool, FontMetrics } from '../../types/font';
import {
  createEmptyPixelGrid,
  drawPixelCircle,
  drawPixelLine,
  drawPixelRectangle,
  flipPixelGridH,
  flipPixelGridV,
  floodFillPixelGrid,
  invertPixelGrid,
  pixelGridToSvgPath,
  shiftPixelGrid,
} from '../../utils/pixelConverter';

interface PixelCanvasProps {
  currentSvgPath: string;
  initialGrid?: boolean[][];
  onChangeSvgPath: (newPath: string, newGrid: boolean[][]) => void;
  metrics: FontMetrics;
  advanceWidth: number;
}

export const PixelCanvas: React.FC<PixelCanvasProps> = ({
  initialGrid,
  onChangeSvgPath,
  metrics,
}) => {
  const [gridSize, setGridSize] = useState<number>(48);
  const [grid, setGrid] = useState<boolean[][]>(() => {
    if (initialGrid && initialGrid.length > 0) return initialGrid;
    return createEmptyPixelGrid(48);
  });

  const [currentTool, setCurrentTool] = useState<PixelTool>('pencil');
  const [isDrawing, setIsDrawing] = useState(false);
  const [dragStart, setDragStart] = useState<{ r: number; c: number } | null>(null);
  const [currentHover, setCurrentHover] = useState<{ r: number; c: number } | null>(null);
  const [showGridLines, setShowGridLines] = useState(true);
  const [showMetrics, setShowMetrics] = useState(true);

  // Sync when initialGrid changes from outside
  useEffect(() => {
    if (initialGrid && initialGrid.length > 0) {
      setGrid(initialGrid);
      setGridSize(initialGrid.length);
    }
  }, [initialGrid]);

  // Propagate changes to parent as both SVG Path & boolean[][]
  const updateAndEmit = useCallback(
    (newGrid: boolean[][]) => {
      setGrid(newGrid);
      const svg = pixelGridToSvgPath(newGrid, 1000);
      onChangeSvgPath(svg, newGrid);
    },
    [onChangeSvgPath]
  );

  // Handle Resolution Switch (16x16, 24x24, 32x32, 48x48)
  const handleGridSizeChange = (newSize: number) => {
    const newGrid = createEmptyPixelGrid(newSize);
    // Simple resample from old to new if any
    const oldSize = grid.length;
    for (let r = 0; r < newSize; r++) {
      for (let c = 0; c < newSize; c++) {
        const srcR = Math.floor((r / newSize) * oldSize);
        const srcC = Math.floor((c / newSize) * oldSize);
        if (grid[srcR]?.[srcC]) {
          newGrid[r][c] = true;
        }
      }
    }
    setGridSize(newSize);
    updateAndEmit(newGrid);
  };

  // Cell Interaction Handlers
  const handleCellMouseDown = (r: number, c: number, e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDrawing(true);
    setDragStart({ r, c });

    if (currentTool === 'pencil') {
      const next = grid.map((row) => [...row]);
      next[r][c] = true;
      updateAndEmit(next);
    } else if (currentTool === 'eraser') {
      const next = grid.map((row) => [...row]);
      next[r][c] = false;
      updateAndEmit(next);
    } else if (currentTool === 'bucket') {
      const next = floodFillPixelGrid(grid, r, c, !grid[r][c]);
      updateAndEmit(next);
    }
  };

  const handleCellMouseEnter = (r: number, c: number) => {
    setCurrentHover({ r, c });
    if (!isDrawing) return;

    if (currentTool === 'pencil') {
      if (!grid[r][c]) {
        const next = grid.map((row) => [...row]);
        next[r][c] = true;
        updateAndEmit(next);
      }
    } else if (currentTool === 'eraser') {
      if (grid[r][c]) {
        const next = grid.map((row) => [...row]);
        next[r][c] = false;
        updateAndEmit(next);
      }
    }
  };

  const handleMouseUp = () => {
    if (isDrawing && dragStart && currentHover) {
      if (currentTool === 'line') {
        const next = drawPixelLine(grid, dragStart.r, dragStart.c, currentHover.r, currentHover.c, true);
        updateAndEmit(next);
      } else if (currentTool === 'rect') {
        const next = drawPixelRectangle(grid, dragStart.r, dragStart.c, currentHover.r, currentHover.c, true, true);
        updateAndEmit(next);
      } else if (currentTool === 'circle') {
        const rad = Math.round(Math.hypot(currentHover.r - dragStart.r, currentHover.c - dragStart.c));
        const next = drawPixelCircle(grid, dragStart.r, dragStart.c, rad, true, true);
        updateAndEmit(next);
      }
    }
    setIsDrawing(false);
    setDragStart(null);
  };

  // Guidelines mapped to grid rows
  const baselineRow = Math.round(( (1000 - metrics.ascender) / 1000 ) * gridSize); // e.g. row 38
  const capRow = Math.round(( (1000 - metrics.ascender - metrics.capHeight) / 1000 ) * gridSize); // e.g. row 5
  const xRow = Math.round(( (1000 - metrics.ascender - metrics.xHeight) / 1000 ) * gridSize); // e.g. row 14

  const activePixelCount = grid.reduce(
    (acc, row) => acc + row.filter(Boolean).length,
    0
  );

  return (
    <div
      className="flex flex-col gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800 shadow-2xl select-none"
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Top Toolbar: Pixel Tools & Grid Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
        {/* Tool Palette */}
        <div className="flex items-center gap-1">
          {[
            { id: 'pencil' as PixelTool, label: 'Pencil', icon: <Pencil size={15} /> },
            { id: 'eraser' as PixelTool, label: 'Eraser', icon: <Eraser size={15} /> },
            { id: 'bucket' as PixelTool, label: 'Fill Bucket', icon: <PaintBucket size={15} /> },
            { id: 'line' as PixelTool, label: 'Line', icon: <Minus size={15} /> },
            { id: 'rect' as PixelTool, label: 'Rectangle', icon: <Square size={15} /> },
            { id: 'circle' as PixelTool, label: 'Circle', icon: <Circle size={15} /> },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setCurrentTool(t.id)}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentTool === t.id
                  ? 'bg-brand-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {t.icon}
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          ))}
        </div>

        {/* Board Resolution Selector */}
        <div className="flex items-center gap-1.5 border-l border-slate-800 pl-2 text-xs">
          <span className="text-slate-400 text-[11px] font-medium">Board:</span>
          {[16, 24, 32, 48].map((sz) => (
            <button
              key={sz}
              onClick={() => handleGridSizeChange(sz)}
              className={`px-2 py-1 rounded-md text-[11px] font-mono font-bold transition-all ${
                gridSize === sz
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
              }`}
            >
              {sz}x{sz}
            </button>
          ))}
        </div>

        {/* Grid & Guide Toggles */}
        <div className="flex items-center gap-1 border-l border-slate-800 pl-2">
          <button
            onClick={() => setShowGridLines(!showGridLines)}
            title={showGridLines ? 'Hide Grid Lines' : 'Show Grid Lines'}
            className={`p-1.5 rounded-lg text-xs transition-all ${
              showGridLines ? 'bg-slate-800 text-cyan-400' : 'text-slate-500 hover:bg-slate-850'
            }`}
          >
            <Grid size={15} />
          </button>
          <button
            onClick={() => setShowMetrics(!showMetrics)}
            title="Toggle Baseline Guides"
            className={`p-1.5 rounded-lg text-xs transition-all ${
              showMetrics ? 'bg-slate-800 text-emerald-400' : 'text-slate-500 hover:bg-slate-850'
            }`}
          >
            <span className="text-xs font-mono font-bold">BL</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Pixel Board */}
      <div className="relative flex flex-col items-center justify-center p-3 bg-slate-900/50 rounded-xl border border-slate-800/80 overflow-hidden canvas-checkerboard">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
            width: '460px',
            height: '460px',
          }}
          className={`relative bg-slate-950 rounded-lg shadow-2xl border border-slate-700/80 overflow-hidden cursor-crosshair ${
            showGridLines ? 'divide-x divide-y divide-slate-800/40' : ''
          }`}
        >
          {grid.map((row, r) =>
            row.map((filled, c) => {
              const isBaseline = showMetrics && r === baselineRow;
              const isCap = showMetrics && r === capRow;
              const isX = showMetrics && r === xRow;

              return (
                <div
                  key={`${r}-${c}`}
                  onMouseDown={(e) => handleCellMouseDown(r, c, e)}
                  onMouseEnter={() => handleCellMouseEnter(r, c)}
                  className={`relative transition-colors duration-75 ${
                    filled
                      ? 'bg-cyan-400 shadow-sm'
                      : isBaseline
                      ? 'bg-blue-900/30'
                      : isCap
                      ? 'bg-pink-900/20'
                      : isX
                      ? 'bg-purple-900/20'
                      : 'hover:bg-slate-800/60'
                  }`}
                />
              );
            })
          )}
        </div>

        {/* Typographic Guide Badges */}
        {showMetrics && (
          <div className="flex items-center gap-4 mt-2 text-[11px] font-mono text-slate-400">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-pink-500" /> Cap-Height (Row {capRow})
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-purple-500" /> X-Height (Row {xRow})
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-500" /> Baseline (Row {baselineRow})
            </span>
          </div>
        )}
      </div>

      {/* Quick Action Matrix Controls (Nudge, Flip, Invert, Clear) */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-slate-900/80 rounded-xl border border-slate-800 text-xs">
        {/* Nudge Arrows */}
        <div className="flex items-center gap-1">
          <span className="text-slate-400 text-[11px] font-semibold uppercase mr-1">Shift:</span>
          <button
            onClick={() => updateAndEmit(shiftPixelGrid(grid, -1, 0))}
            title="Shift Left 1px"
            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
          >
            <ArrowLeft size={14} />
          </button>
          <button
            onClick={() => updateAndEmit(shiftPixelGrid(grid, 0, -1))}
            title="Shift Up 1px"
            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
          >
            <ArrowUp size={14} />
          </button>
          <button
            onClick={() => updateAndEmit(shiftPixelGrid(grid, 0, 1))}
            title="Shift Down 1px"
            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
          >
            <ArrowDown size={14} />
          </button>
          <button
            onClick={() => updateAndEmit(shiftPixelGrid(grid, 1, 0))}
            title="Shift Right 1px"
            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
          >
            <ArrowRight size={14} />
          </button>
        </div>

        {/* Transform Actions */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => updateAndEmit(invertPixelGrid(grid))}
            title="Invert Pixels"
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <Contrast size={13} />
            <span>Invert</span>
          </button>

          <button
            onClick={() => updateAndEmit(flipPixelGridH(grid))}
            title="Flip Horizontally"
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <FlipHorizontal size={13} />
            <span>Flip H</span>
          </button>

          <button
            onClick={() => updateAndEmit(flipPixelGridV(grid))}
            title="Flip Vertically"
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <FlipVertical size={13} />
            <span>Flip V</span>
          </button>

          <button
            onClick={() => updateAndEmit(createEmptyPixelGrid(gridSize))}
            title="Clear Pixel Board"
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 transition-colors ml-1"
          >
            <RefreshCw size={13} />
            <span>Clear</span>
          </button>
        </div>

        {/* Stats */}
        <div className="text-[11px] font-mono text-slate-500">
          Pixels: <strong className="text-cyan-400">{activePixelCount}</strong>
        </div>
      </div>
    </div>
  );
};
