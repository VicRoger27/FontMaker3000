import React, { useState } from 'react';
import {
  Settings,
  X,
  Check,
} from 'lucide-react';
import type { FontProject } from '../../types/font';

interface ProjectSettingsModalProps {
  project: FontProject;
  onSave: (updated: Partial<FontProject>) => void;
  onClose: () => void;
}

export const ProjectSettingsModal: React.FC<ProjectSettingsModalProps> = ({
  project,
  onSave,
  onClose,
}) => {
  const [formData, setFormData] = useState({
    name: project.name,
    family: project.family,
    styleName: project.styleName,
    version: project.version,
    author: project.author,
    description: project.description,
    unitsPerEm: project.metrics.unitsPerEm,
    ascender: project.metrics.ascender,
    descender: project.metrics.descender,
    capHeight: project.metrics.capHeight,
    xHeight: project.metrics.xHeight,
    defaultAdvanceWidth: project.metrics.defaultAdvanceWidth,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name: formData.name,
      family: formData.family,
      styleName: formData.styleName,
      version: formData.version,
      author: formData.author,
      description: formData.description,
      metrics: {
        unitsPerEm: formData.unitsPerEm,
        ascender: formData.ascender,
        descender: formData.descender,
        capHeight: formData.capHeight,
        xHeight: formData.xHeight,
        defaultAdvanceWidth: formData.defaultAdvanceWidth,
      },
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl flex flex-col gap-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Settings size={18} className="text-brand-400" />
            <h3 className="text-base font-bold text-slate-100">Font Project Settings</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Font Metadata
            </span>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[11px] text-slate-300">Family Name:</label>
                <input
                  type="text"
                  value={formData.family}
                  onChange={(e) => setFormData({ ...formData, family: e.target.value, name: e.target.value })}
                  className="px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-brand-500"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] text-slate-300">Style Name:</label>
                <input
                  type="text"
                  value={formData.styleName}
                  onChange={(e) => setFormData({ ...formData, styleName: e.target.value })}
                  className="px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-brand-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[11px] text-slate-300">Author / Designer:</label>
                <input
                  type="text"
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  className="px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] text-slate-300">Version:</label>
                <input
                  type="text"
                  value={formData.version}
                  onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                  className="px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t border-slate-800 pt-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Typographic Metrics (EM Units)
            </span>

            <div className="grid grid-cols-3 gap-2.5">
              <div className="flex flex-col gap-1">
                <label className="text-[11px] text-slate-400">Units Per Em:</label>
                <input
                  type="number"
                  value={formData.unitsPerEm}
                  onChange={(e) => setFormData({ ...formData, unitsPerEm: parseInt(e.target.value) || 1000 })}
                  className="px-2.5 py-1 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 font-mono"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] text-slate-400">Ascender (Y):</label>
                <input
                  type="number"
                  value={formData.ascender}
                  onChange={(e) => setFormData({ ...formData, ascender: parseInt(e.target.value) || 800 })}
                  className="px-2.5 py-1 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 font-mono"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] text-slate-400">Descender (Y):</label>
                <input
                  type="number"
                  value={formData.descender}
                  onChange={(e) => setFormData({ ...formData, descender: parseInt(e.target.value) || -200 })}
                  className="px-2.5 py-1 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 font-mono"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] text-slate-400">Cap-Height:</label>
                <input
                  type="number"
                  value={formData.capHeight}
                  onChange={(e) => setFormData({ ...formData, capHeight: parseInt(e.target.value) || 700 })}
                  className="px-2.5 py-1 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 font-mono"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] text-slate-400">X-Height:</label>
                <input
                  type="number"
                  value={formData.xHeight}
                  onChange={(e) => setFormData({ ...formData, xHeight: parseInt(e.target.value) || 500 })}
                  className="px-2.5 py-1 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 font-mono"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] text-slate-400">Default Width:</label>
                <input
                  type="number"
                  value={formData.defaultAdvanceWidth}
                  onChange={(e) => setFormData({ ...formData, defaultAdvanceWidth: parseInt(e.target.value) || 600 })}
                  className="px-2.5 py-1 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 font-mono"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-slate-800 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-1.5 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-xs font-semibold shadow-md"
            >
              <Check size={14} />
              <span>Save Settings</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
