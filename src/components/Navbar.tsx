import React, { useRef } from 'react';
import {
  Download,
  FolderOpen,
  Save,
  Settings,
  Wand2,
  Type,
  FileText,
  Palette,
  CheckCircle2,
} from 'lucide-react';
import type { FontProject } from '../types/font';
import { downloadProjectJson } from '../utils/exportHelpers';

interface NavbarProps {
  project: FontProject;
  activeView: 'editor' | 'playground' | 'specimen';
  onSelectView: (view: 'editor' | 'playground' | 'specimen') => void;
  onOpenStyleModal: () => void;
  onOpenSettingsModal: () => void;
  onOpenExportModal: () => void;
  onLoadProject: (loaded: FontProject) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  project,
  activeView,
  onSelectView,
  onOpenStyleModal,
  onOpenSettingsModal,
  onOpenExportModal,
  onLoadProject,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json && json.glyphs && json.metrics) {
          onLoadProject(json);
        } else {
          alert('Invalid Font Maker project JSON format.');
        }
      } catch (err) {
        alert('Failed to parse project JSON file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-4 py-2.5">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left: Brand & Project Name */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20 ring-1 ring-brand-400/40">
              <Type size={20} className="stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm tracking-tight text-white">
                  FontForge
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-400 bg-brand-500/10 px-1.5 py-0.2 rounded border border-brand-500/30">
                  Studio
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Custom Typography & Font Creator</p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2 pl-3 border-l border-slate-800">
            <span className="text-xs font-semibold text-slate-200">
              {project.family}
            </span>
            <span className="text-[10px] font-medium text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700">
              {project.styleName}
            </span>
            <span className="flex items-center gap-1 text-[10px] text-emerald-400/80">
              <CheckCircle2 size={11} />
              <span>Autosaved</span>
            </span>
          </div>
        </div>

        {/* Center: Main View Navigation */}
        <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 shadow-inner">
          <button
            onClick={() => onSelectView('editor')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeView === 'editor'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Palette size={14} />
            <span>Glyph Studio</span>
          </button>

          <button
            onClick={() => onSelectView('playground')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeView === 'playground'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Type size={14} />
            <span>Live Tester</span>
          </button>

          <button
            onClick={() => onSelectView('specimen')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeView === 'specimen'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText size={14} />
            <span>Specimen Poster</span>
          </button>
        </div>

        {/* Right: Actions (Styles, Settings, Save/Load, Export) */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onOpenStyleModal}
            title="Generate Multi-Style Masters (Bold, Italic, Condensed)"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-800 text-xs font-medium transition-colors"
          >
            <Wand2 size={14} className="text-indigo-400" />
            <span className="hidden sm:inline">Styles</span>
          </button>

          <button
            onClick={onOpenSettingsModal}
            title="Font Project Settings & Metrics"
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-800 text-xs transition-colors"
          >
            <Settings size={16} />
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileInputChange}
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            title="Load Saved Project (.json)"
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-800 text-xs transition-colors"
          >
            <FolderOpen size={16} />
          </button>

          <button
            onClick={() => downloadProjectJson(project)}
            title="Save Project Source (.json)"
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-800 text-xs transition-colors"
          >
            <Save size={16} />
          </button>

          <button
            onClick={onOpenExportModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-brand-500/20 transition-all ml-1"
          >
            <Download size={14} />
            <span>Export & Host</span>
          </button>
        </div>
      </div>
    </header>
  );
};
