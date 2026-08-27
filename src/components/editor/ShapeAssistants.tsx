import React from 'react';
import {
  Circle,
  Square,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import type { FontMetrics } from '../../types/font';
import { generateCirclePath, generateRectPath, generateRoundUPath } from '../../utils/svgParser';

interface ShapeAssistantsProps {
  metrics: FontMetrics;
  advanceWidth: number;
  onAddPath: (newPathChunk: string, replace?: boolean) => void;
  onClear: () => void;
}

export const ShapeAssistants: React.FC<ShapeAssistantsProps> = ({
  metrics,
  advanceWidth,
  onAddPath,
  onClear,
}) => {
  const capTop = 1000 - metrics.ascender - metrics.capHeight;
  const baseline = 1000 - metrics.ascender;
  const defaultStroke = 60;
  const w = advanceWidth || 600;
  const margin = 80;

  // 1. Round U Generator
  const handleAddRoundU = () => {
    const uPath = generateRoundUPath(margin, w - margin, capTop, baseline, defaultStroke);
    onAddPath(uPath, false);
  };

  // 2. Round O Generator
  const handleAddRoundO = () => {
    const cx = w / 2;
    const cy = (capTop + baseline) / 2;
    const rOuter = (baseline - capTop) / 2;
    const rInner = rOuter - defaultStroke;
    const oPath = `${generateCirclePath(cx, cy, rOuter)} ${generateCirclePath(cx, cy, rInner)}`;
    onAddPath(oPath, false);
  };

  // 3. Round C Generator
  const handleAddRoundC = () => {
    const cx = w / 2;
    const cy = (capTop + baseline) / 2;
    const r = (baseline - capTop) / 2;
    const rIn = r - defaultStroke;
    const cPath = [
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
    onAddPath(cPath, false);
  };

  // 4. Vertical Left Stem
  const handleAddVerticalStem = () => {
    const stem = generateRectPath(margin, capTop, defaultStroke, baseline - capTop);
    onAddPath(stem, false);
  };

  // 5. Horizontal Crossbar
  const handleAddCrossbar = () => {
    const mid = (capTop + baseline) / 2;
    const bar = generateRectPath(margin, mid - defaultStroke / 2, w - margin * 2, defaultStroke);
    onAddPath(bar, false);
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5 p-2 bg-slate-900/60 border border-slate-800/80 rounded-xl text-xs">
      <div className="flex items-center gap-1 text-slate-400 font-semibold uppercase tracking-wider text-[10px] px-1">
        <Sparkles size={13} className="text-brand-400" />
        <span>Shape Helpers:</span>
      </div>

      <button
        onClick={handleAddRoundU}
        title="Add Perfect Round 'U' Base Curve"
        className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-brand-600/30 text-slate-200 border border-slate-700/60 hover:border-brand-500/50 transition-all"
      >
        <span className="font-bold text-brand-400">∪</span>
        <span>Round 'U'</span>
      </button>

      <button
        onClick={handleAddRoundO}
        title="Add Concentric 'O' Circle"
        className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-brand-600/30 text-slate-200 border border-slate-700/60 hover:border-brand-500/50 transition-all"
      >
        <Circle size={13} className="text-amber-400" />
        <span>Circle 'O'</span>
      </button>

      <button
        onClick={handleAddRoundC}
        title="Add Open Arc 'C'"
        className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-brand-600/30 text-slate-200 border border-slate-700/60 hover:border-brand-500/50 transition-all"
      >
        <span className="font-bold text-emerald-400">⊂</span>
        <span>Curve 'C'</span>
      </button>

      <button
        onClick={handleAddVerticalStem}
        title="Add Full Height Vertical Stem"
        className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/60 transition-all"
      >
        <Square size={13} className="text-indigo-400" />
        <span>Stem |</span>
      </button>

      <button
        onClick={handleAddCrossbar}
        title="Add Middle Crossbar"
        className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/60 transition-all"
      >
        <span className="font-bold text-sky-400">—</span>
        <span>Crossbar —</span>
      </button>

      <div className="flex-1" />

      <button
        onClick={onClear}
        title="Clear Current Canvas"
        className="flex items-center gap-1 px-2 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 transition-all"
      >
        <RefreshCw size={12} />
        <span>Clear</span>
      </button>
    </div>
  );
};
