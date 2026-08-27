import React from 'react';
import {
  MousePointer,
  PenTool,
  Circle,
  Square,
  Minus,
  Pencil,
  Trash2,
  Spline,
  Maximize2,
  Minimize2,
  Grid,
  Magnet,
  Compass,
} from 'lucide-react';
import type { EditorTool } from '../../types/font';

interface ToolBarProps {
  currentTool: EditorTool;
  onSelectTool: (tool: EditorTool) => void;
  snapToGrid: boolean;
  onToggleSnap: () => void;
  showGuides: boolean;
  onToggleGuides: () => void;
  showGrid: boolean;
  onToggleGrid: () => void;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
}

export const ToolBar: React.FC<ToolBarProps> = ({
  currentTool,
  onSelectTool,
  snapToGrid,
  onToggleSnap,
  showGuides,
  onToggleGuides,
  showGrid,
  onToggleGrid,
  zoom,
  onZoomIn,
  onZoomOut,
  onResetZoom,
}) => {
  const tools: { id: EditorTool; label: string; icon: React.ReactNode; shortcut: string }[] = [
    { id: 'select', label: 'Select / Move', icon: <MousePointer size={18} />, shortcut: 'V' },
    { id: 'node', label: 'Node / Curve Edit', icon: <Spline size={18} />, shortcut: 'N' },
    { id: 'pen', label: 'Bezier Pen', icon: <PenTool size={18} />, shortcut: 'P' },
    { id: 'circle', label: 'Circle Helper', icon: <Circle size={18} />, shortcut: 'C' },
    { id: 'ellipse', label: 'Ellipse Helper', icon: <Compass size={18} />, shortcut: 'O' },
    { id: 'rect', label: 'Rectangle Stem', icon: <Square size={18} />, shortcut: 'R' },
    { id: 'line', label: 'Straight Line', icon: <Minus size={18} />, shortcut: 'L' },
    { id: 'brush', label: 'Freehand Brush', icon: <Pencil size={18} />, shortcut: 'B' },
    { id: 'eraser', label: 'Eraser', icon: <Trash2 size={18} />, shortcut: 'E' },
  ];

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-slate-900/90 backdrop-blur border border-slate-800 rounded-xl shadow-lg">
      <div className="flex items-center gap-1">
        {tools.map((t) => {
          const isActive = currentTool === t.id;
          return (
            <button
              key={t.id}
              onClick={() => onSelectTool(t.id)}
              title={`${t.label} (${t.shortcut})`}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-brand-600 text-white shadow-sm shadow-brand-500/30 ring-1 ring-brand-400'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
              }`}
            >
              {t.icon}
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-1 border-l border-slate-800 pl-2">
        <button
          onClick={onToggleSnap}
          title={snapToGrid ? 'Disable Grid Snapping' : 'Enable Grid Snapping'}
          className={`p-1.5 rounded-lg text-xs transition-all ${
            snapToGrid
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Magnet size={17} />
        </button>

        <button
          onClick={onToggleGrid}
          title={showGrid ? 'Hide Grid' : 'Show Grid'}
          className={`p-1.5 rounded-lg text-xs transition-all ${
            showGrid
              ? 'bg-brand-500/20 text-brand-400 border border-brand-500/40'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Grid size={17} />
        </button>

        <button
          onClick={onToggleGuides}
          title={showGuides ? 'Hide Typographic Guides' : 'Show Typographic Guides'}
          className={`p-1.5 rounded-lg text-xs transition-all ${
            showGuides
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Compass size={17} />
        </button>

        <div className="flex items-center gap-1 ml-1 border-l border-slate-800 pl-2 text-xs text-slate-400">
          <button
            onClick={onZoomOut}
            title="Zoom Out"
            className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-slate-200"
          >
            <Minimize2 size={16} />
          </button>
          <button
            onClick={onResetZoom}
            title="Reset Zoom"
            className="px-1.5 py-1 font-mono hover:bg-slate-800 rounded text-[11px]"
          >
            {Math.round(zoom * 100)}%
          </button>
          <button
            onClick={onZoomIn}
            title="Zoom In"
            className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-slate-200"
          >
            <Maximize2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
