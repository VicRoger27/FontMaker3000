import React, { useState } from 'react';
import {
  Wand2,
  X,
  Check,
  RotateCw,
  Maximize,
} from 'lucide-react';
import type { FontProject, StyleModifiers } from '../../types/font';
import { generateStyledProject } from '../../utils/styleGenerator';

interface StyleGeneratorModalProps {
  project: FontProject;
  onApplyStyle: (newProject: FontProject) => void;
  onClose: () => void;
}

export const StyleGeneratorModal: React.FC<StyleGeneratorModalProps> = ({
  project,
  onApplyStyle,
  onClose,
}) => {
  const [styleName, setStyleName] = useState('Italic');
  const [modifiers, setModifiers] = useState<StyleModifiers>({
    weightDelta: 0,
    slantAngle: 12,
    widthScale: 1.0,
    isOutline: false,
    outlineWidth: 20,
    roundedCorners: 0,
  });

  const previewProject = generateStyledProject(project, styleName, modifiers);

  const presets = [
    { label: 'Italic / Slant', name: 'Italic', slant: 12, width: 1.0 },
    { label: 'Extreme Italic', name: 'Oblique', slant: 20, width: 1.0 },
    { label: 'Backslant', name: 'Backslant', slant: -12, width: 1.0 },
    { label: 'Condensed', name: 'Condensed', slant: 0, width: 0.75 },
    { label: 'Expanded / Wide', name: 'Expanded', slant: 0, width: 1.35 },
    { label: 'Condensed Italic', name: 'Condensed Italic', slant: 12, width: 0.8 },
  ];

  const handleApplyPreset = (p: typeof presets[0]) => {
    setStyleName(p.name);
    setModifiers((prev) => ({
      ...prev,
      slantAngle: p.slant,
      widthScale: p.width,
    }));
  };

  const handleSave = () => {
    onApplyStyle(previewProject);
    onClose();
  };

  const sampleChars = ['A', 'B', 'C', 'G', 'Q', 'U', 'R', 'S', '0', '8', 'g', 'm', 'w'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-2xl w-full shadow-2xl flex flex-col gap-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-brand-500/20 text-brand-400 border border-brand-500/30">
              <Wand2 size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">
                Multi-Style Master Generator
              </h3>
              <p className="text-xs text-slate-400">
                Generate Bold, Italic, Condensed & Expanded variations algorithmically
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-slate-400 font-medium mr-1">Quick Presets:</span>
          {presets.map((p) => (
            <button
              key={p.name}
              onClick={() => handleApplyPreset(p)}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs border border-slate-700/60 transition-colors"
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950/70 p-4 rounded-2xl border border-slate-800">
          <div className="sm:col-span-2 flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-300">Variant Style Name:</label>
            <input
              type="text"
              value={styleName}
              onChange={(e) => setStyleName(e.target.value)}
              placeholder="e.g. Italic, Bold Italic, Condensed"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400 flex items-center gap-1">
                <RotateCw size={13} className="text-indigo-400" /> Slant / Italic Angle:
              </span>
              <span className="font-mono text-slate-200">{modifiers.slantAngle}°</span>
            </div>
            <input
              type="range"
              min="-25"
              max="25"
              value={modifiers.slantAngle}
              onChange={(e) =>
                setModifiers((m) => ({ ...m, slantAngle: parseFloat(e.target.value) }))
              }
              className="w-full accent-indigo-500 cursor-pointer"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400 flex items-center gap-1">
                <Maximize size={13} className="text-cyan-400" /> Width Stretch / Condensed:
              </span>
              <span className="font-mono text-slate-200">{Math.round(modifiers.widthScale * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="1.8"
              step="0.05"
              value={modifiers.widthScale}
              onChange={(e) =>
                setModifiers((m) => ({ ...m, widthScale: parseFloat(e.target.value) }))
              }
              className="w-full accent-cyan-500 cursor-pointer"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Transformed Glyph Preview
          </span>
          <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 p-3 bg-slate-950 rounded-2xl border border-slate-800">
            {sampleChars.map((ch) => {
              const glyph = previewProject.glyphs[ch];
              return (
                <div
                  key={ch}
                  className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-900 border border-slate-800/80 aspect-square"
                >
                  <div className="w-8 h-8 flex items-center justify-center">
                    {glyph?.svgPath ? (
                      <svg viewBox="0 0 1000 1000" className="w-full h-full">
                        <path d={glyph.svgPath} fill="#60a5fa" />
                      </svg>
                    ) : (
                      <span className="text-xs text-slate-600 italic">{ch}</span>
                    )}
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 mt-1">{ch}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-slate-800 pt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-brand-500/20 transition-all"
          >
            <Check size={14} />
            <span>Apply Style Variant ({styleName})</span>
          </button>
        </div>
      </div>
    </div>
  );
};
