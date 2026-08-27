import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Code,
  Palette,
  Grid,
  Undo2,
  Redo2,
  Sparkles,
  Sliders,
} from 'lucide-react';
import type { EditorTool, FontMetrics, Glyph } from '../../types/font';
import { ToolBar } from './ToolBar';
import { VectorCanvas } from './VectorCanvas';
import { SvgCodeEditor } from './SvgCodeEditor';
import { ShapeAssistants } from './ShapeAssistants';
import { PixelCanvas } from './PixelCanvas';
import { getGeometricTemplatePath } from '../../utils/templatePresets';

interface GlyphEditorProps {
  currentGlyph: Glyph;
  metrics: FontMetrics;
  onUpdateGlyph: (updated: Partial<Glyph>) => void;
  onSelectPrev: () => void;
  onSelectNext: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
}

export const GlyphEditor: React.FC<GlyphEditorProps> = ({
  currentGlyph,
  metrics,
  onUpdateGlyph,
  onSelectPrev,
  onSelectNext,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
}) => {
  const [editorMode, setEditorMode] = useState<'pixel' | 'visual' | 'code'>('pixel');
  const [currentTool, setCurrentTool] = useState<EditorTool>('pen');
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [showGuides, setShowGuides] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [zoom, setZoom] = useState(1.0);

  const handleSvgPathChange = (newPath: string) => {
    onUpdateGlyph({
      svgPath: newPath,
      isCompleted: !!newPath && newPath.trim().length > 0,
    });
  };

  const handlePixelChange = (newPath: string, newGrid: boolean[][]) => {
    onUpdateGlyph({
      svgPath: newPath,
      pixelGrid: newGrid,
      isCompleted: !!newPath && newPath.trim().length > 0,
    });
  };

  const handleAddPath = (chunk: string, replace = false) => {
    if (replace || !currentGlyph.svgPath) {
      handleSvgPathChange(chunk);
    } else {
      handleSvgPathChange(`${currentGlyph.svgPath} ${chunk}`.trim());
    }
  };

  const handleResetToTemplate = () => {
    const template = getGeometricTemplatePath(currentGlyph.char);
    if (template) {
      handleSvgPathChange(template);
    }
  };

  const handleClear = () => {
    handleSvgPathChange('');
  };

  return (
    <div className="flex flex-col gap-3 bg-slate-900/80 backdrop-blur border border-slate-800/80 rounded-2xl p-4 shadow-xl">
      {/* Editor Header Navigation & Info */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        {/* Left: Glyph Switcher & Title */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <button
              onClick={onSelectPrev}
              title="Previous Glyph (Left Arrow)"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              <ChevronLeft size={18} />
            </button>

            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-brand-600 to-indigo-700 text-white rounded-xl font-bold text-2xl shadow-md ring-1 ring-brand-400/40">
              {currentGlyph.char}
            </div>

            <button
              onClick={onSelectNext}
              title="Next Glyph (Right Arrow)"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-100">
                Glyph '{currentGlyph.char}'
              </h2>
              <span className="px-2 py-0.5 rounded-md bg-slate-800 text-[11px] font-mono text-brand-300 border border-slate-700">
                U+{currentGlyph.unicode.toString(16).toUpperCase().padStart(4, '0')}
              </span>
            </div>
            <p className="text-xs text-slate-400 capitalize">{currentGlyph.category} character</p>
          </div>
        </div>

        {/* Center: Undo / Redo & Template Blueprints */}
        <div className="flex items-center gap-2">
          {onUndo && (
            <button
              onClick={onUndo}
              disabled={!canUndo}
              title="Undo (Ctrl+Z)"
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 disabled:hover:bg-slate-800 transition-colors"
            >
              <Undo2 size={16} />
            </button>
          )}
          {onRedo && (
            <button
              onClick={onRedo}
              disabled={!canRedo}
              title="Redo (Ctrl+Shift+Z or Ctrl+Y)"
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 disabled:hover:bg-slate-800 transition-colors"
            >
              <Redo2 size={16} />
            </button>
          )}

          <button
            onClick={handleResetToTemplate}
            title="Load standard blueprint for this character"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-medium transition-all"
          >
            <Sparkles size={14} className="text-indigo-400" />
            <span>Load Blueprint</span>
          </button>
        </div>

        {/* Right: Advance Width Control & Mode Tabs */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-950 px-3 py-1 rounded-lg border border-slate-800 text-xs">
            <Sliders size={13} className="text-cyan-400" />
            <span className="text-slate-400">Advance Width:</span>
            <input
              type="number"
              min="200"
              max="1200"
              step="10"
              value={currentGlyph.advanceWidth || 600}
              onChange={(e) => onUpdateGlyph({ advanceWidth: parseInt(e.target.value) || 600 })}
              className="w-16 bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-cyan-300 font-mono text-xs focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setEditorMode('pixel')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                editorMode === 'pixel'
                  ? 'bg-brand-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Grid size={14} />
              <span>Pixel Board (48x48)</span>
            </button>
            <button
              onClick={() => setEditorMode('visual')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                editorMode === 'visual'
                  ? 'bg-brand-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Palette size={14} />
              <span>Vector Studio</span>
            </button>
            <button
              onClick={() => setEditorMode('code')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                editorMode === 'code'
                  ? 'bg-brand-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Code size={14} />
              <span>SVG Code</span>
            </button>
          </div>
        </div>
      </div>

      {/* MODE 1: 48x48 Pixel Grid Board */}
      {editorMode === 'pixel' && (
        <PixelCanvas
          currentSvgPath={currentGlyph.svgPath}
          initialGrid={currentGlyph.pixelGrid}
          onChangeSvgPath={handlePixelChange}
          metrics={metrics}
          advanceWidth={currentGlyph.advanceWidth || 600}
        />
      )}

      {/* MODE 2: Visual Vector Studio */}
      {editorMode === 'visual' && (
        <div className="flex flex-col gap-2">
          <ToolBar
            currentTool={currentTool}
            onSelectTool={setCurrentTool}
            snapToGrid={snapToGrid}
            onToggleSnap={() => setSnapToGrid(!snapToGrid)}
            showGuides={showGuides}
            onToggleGuides={() => setShowGuides(!showGuides)}
            showGrid={showGrid}
            onToggleGrid={() => setShowGrid(!showGrid)}
            zoom={zoom}
            onZoomIn={() => setZoom((z) => Math.min(2.5, z + 0.15))}
            onZoomOut={() => setZoom((z) => Math.max(0.5, z - 0.15))}
            onResetZoom={() => setZoom(1.0)}
          />

          <ShapeAssistants
            metrics={metrics}
            advanceWidth={currentGlyph.advanceWidth || 600}
            onAddPath={handleAddPath}
            onClear={handleClear}
          />

          <VectorCanvas
            svgPath={currentGlyph.svgPath}
            onChangeSvgPath={handleSvgPathChange}
            metrics={metrics}
            advanceWidth={currentGlyph.advanceWidth || 600}
            onChangeAdvanceWidth={(w) => onUpdateGlyph({ advanceWidth: w })}
            currentTool={currentTool}
            snapToGrid={snapToGrid}
            showGuides={showGuides}
            showGrid={showGrid}
            zoom={zoom}
          />
        </div>
      )}

      {/* MODE 3: SVG Code Studio */}
      {editorMode === 'code' && (
        <SvgCodeEditor
          svgPath={currentGlyph.svgPath}
          onChangeSvgPath={handleSvgPathChange}
          advanceWidth={currentGlyph.advanceWidth || 600}
        />
      )}
    </div>
  );
};
