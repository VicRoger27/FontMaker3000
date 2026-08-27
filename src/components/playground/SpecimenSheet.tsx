import React, { useMemo } from 'react';
import {
  FileText,
  Printer,
} from 'lucide-react';
import type { FontProject } from '../../types/font';
import { fontToDataUri } from '../../utils/fontCompiler';

interface SpecimenSheetProps {
  project: FontProject;
}

export const SpecimenSheet: React.FC<SpecimenSheetProps> = ({ project }) => {
  const fontDataUri = useMemo(() => {
    try {
      return fontToDataUri(project);
    } catch (e) {
      return '';
    }
  }, [project]);

  const customFontFamily = `SpecimenFont_${project.family.replace(/\s+/g, '_')}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col gap-4 bg-slate-900/80 backdrop-blur border border-slate-800/80 rounded-2xl p-6 shadow-xl">
      {fontDataUri && (
        <style>
          {`
            @font-face {
              font-family: '${customFontFamily}';
              src: url("${fontDataUri}") format("truetype");
            }
            .specimen-custom-font {
              font-family: '${customFontFamily}', sans-serif;
            }
          `}
        </style>
      )}

      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <FileText size={18} className="text-brand-400" />
            <span>Typographic Specimen Showcase</span>
          </h3>
          <p className="text-xs text-slate-400">
            A comprehensive poster showcasing {project.family} ({project.styleName})
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium border border-slate-700 transition-colors"
        >
          <Printer size={14} />
          <span>Print / Export PDF</span>
        </button>
      </div>

      <div className="bg-slate-950 rounded-2xl border border-slate-800 p-8 flex flex-col gap-8 text-slate-100 shadow-2xl">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-800/80 pb-6">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-widest text-brand-400 font-semibold">
              Typeface Specimen No. 01
            </span>
            <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-white mt-1 specimen-custom-font">
              {project.family}
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Style: <strong className="text-slate-200">{project.styleName}</strong> • Designed by {project.author || 'Anonymous'}
            </p>
          </div>

          <div className="flex items-center gap-4 bg-slate-900/80 px-4 py-2 rounded-xl border border-slate-800 text-xs font-mono text-slate-400">
            <div>EM: <span className="text-brand-300">{project.metrics.unitsPerEm}</span></div>
            <div>ASC: <span className="text-emerald-300">{project.metrics.ascender}</span></div>
            <div>DESC: <span className="text-rose-300">{project.metrics.descender}</span></div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-6 bg-slate-900/40 rounded-xl border border-slate-800/60 text-center">
          <div className="flex flex-col items-center">
            <span className="text-6xl sm:text-7xl font-bold text-slate-100 specimen-custom-font">Aa</span>
            <span className="text-[10px] font-mono text-slate-500 mt-1">LATIN CAPITAL & SMALL A</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-6xl sm:text-7xl font-bold text-slate-100 specimen-custom-font">Gg</span>
            <span className="text-[10px] font-mono text-slate-500 mt-1">LATIN CAPITAL & SMALL G</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-6xl sm:text-7xl font-bold text-slate-100 specimen-custom-font">Qq</span>
            <span className="text-[10px] font-mono text-slate-500 mt-1">LATIN CAPITAL & SMALL Q</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-6xl sm:text-7xl font-bold text-brand-400 specimen-custom-font">&?</span>
            <span className="text-[10px] font-mono text-slate-500 mt-1">AMPERSAND & QUESTION</span>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Uppercase Characters (A-Z)
            </span>
            <div className="text-2xl sm:text-3xl text-slate-200 tracking-wider mt-1 specimen-custom-font">
              ABCDEFGHIJKLMNOPQRSTUVWXYZ
            </div>
          </div>

          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Lowercase Characters (a-z)
            </span>
            <div className="text-2xl sm:text-3xl text-slate-300 tracking-wider mt-1 specimen-custom-font">
              abcdefghijklmnopqrstuvwxyz
            </div>
          </div>

          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Numerals & Special Glyphs
            </span>
            <div className="text-2xl sm:text-3xl text-cyan-300 tracking-wider mt-1 specimen-custom-font">
              0123456789 !?@#$%&*()+-=/{};:.,
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800/80 pt-6">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Editorial Reading Sample
          </span>
          <p className="text-lg sm:text-xl text-slate-200 leading-relaxed mt-2 specimen-custom-font">
            Good design is as little design as possible. Less, but better — because it concentrates on the essential aspects, and the products are not burdened with non-essentials. Back to purity, back to simplicity. Typography exists to honor content.
          </p>
        </div>
      </div>
    </div>
  );
};
