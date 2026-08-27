import React, { useState, useMemo } from 'react';
import {
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Sparkles,
  Layers,
} from 'lucide-react';
import type { FontProject } from '../../types/font';
import { fontToDataUri } from '../../utils/fontCompiler';

interface LivePlaygroundProps {
  project: FontProject;
}

export const LivePlayground: React.FC<LivePlaygroundProps> = ({ project }) => {
  const [sampleText, setSampleText] = useState(
    'The quick brown fox jumps over the lazy dog! 0123456789'
  );
  const [fontSize, setFontSize] = useState(48);
  const [letterSpacing, setLetterSpacing] = useState(0);
  const [lineHeight] = useState(1.3);
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right'>('left');
  const [viewMode, setViewMode] = useState<'sandbox' | 'waterfall'>('sandbox');
  const [theme, setTheme] = useState<'dark' | 'light' | 'cyber' | 'paper'>('dark');

  const fontDataUri = useMemo(() => {
    try {
      return fontToDataUri(project);
    } catch (e) {
      console.warn('Live font compilation error:', e);
      return '';
    }
  }, [project]);

  const customFontFamily = `LiveFont_${project.family.replace(/\s+/g, '_')}_${Date.now()}`;

  const pangrams = [
    { label: 'Standard Pangram', text: 'The quick brown fox jumps over the lazy dog!' },
    { label: 'Liquor Jugs', text: 'Pack my box with five dozen liquor jugs.' },
    { label: 'Sphinx & Quartz', text: 'Sphinx of black quartz, judge my vow.' },
    { label: 'Uppercase Alphabet', text: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' },
    { label: 'Lowercase Alphabet', text: 'abcdefghijklmnopqrstuvwxyz' },
    { label: 'Numbers & Symbols', text: '0123456789 !?@#$%&*()+-={}' },
    { label: 'Headline & Body', text: 'Typography is the art and technique of arranging type to make written language legible, readable and appealing.' },
  ];

  const themeStyles = {
    dark: 'bg-slate-950 text-slate-100 border-slate-800',
    light: 'bg-slate-50 text-slate-900 border-slate-300',
    cyber: 'bg-[#0b0f19] text-cyan-400 border-cyan-500/30 selection:bg-cyan-500 selection:text-black',
    paper: 'bg-[#fbf7ee] text-[#2c2416] border-[#e2d7c3]',
  };

  return (
    <div className="flex flex-col gap-4 bg-slate-900/80 backdrop-blur border border-slate-800/80 rounded-2xl p-5 shadow-xl">
      {fontDataUri && (
        <style>
          {`
            @font-face {
              font-family: '${customFontFamily}';
              src: url("${fontDataUri}") format("truetype");
              font-weight: normal;
              font-style: normal;
            }
            .live-custom-font {
              font-family: '${customFontFamily}', sans-serif;
            }
          `}
        </style>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Sparkles size={18} className="text-brand-400" />
            <span>Live Type Playground & Sandbox</span>
          </h3>
          <p className="text-xs text-slate-400">
            Type anything in the canvas below to test your custom font in real time.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setViewMode('sandbox')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'sandbox'
                  ? 'bg-brand-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Type size={14} />
              <span>Interactive Sandbox</span>
            </button>
            <button
              onClick={() => setViewMode('waterfall')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'waterfall'
                  ? 'bg-brand-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers size={14} />
              <span>Waterfall Scale</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-medium">Pangram:</span>
          <select
            onChange={(e) => setSampleText(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200 text-xs focus:outline-none focus:border-brand-500"
          >
            {pangrams.map((p, idx) => (
              <option key={idx} value={p.text}>
                {p.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Size:</span>
            <input
              type="range"
              min="14"
              max="120"
              value={fontSize}
              onChange={(e) => setFontSize(parseInt(e.target.value))}
              className="w-24 accent-brand-500 cursor-pointer"
            />
            <span className="font-mono text-slate-300 w-8">{fontSize}px</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400">Spacing:</span>
            <input
              type="range"
              min="-2"
              max="16"
              value={letterSpacing}
              onChange={(e) => setLetterSpacing(parseInt(e.target.value))}
              className="w-20 accent-brand-500 cursor-pointer"
            />
            <span className="font-mono text-slate-300 w-6">{letterSpacing}px</span>
          </div>

          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setTextAlign('left')}
              className={`p-1 rounded ${textAlign === 'left' ? 'bg-slate-700 text-white' : 'text-slate-400'}`}
            >
              <AlignLeft size={14} />
            </button>
            <button
              onClick={() => setTextAlign('center')}
              className={`p-1 rounded ${textAlign === 'center' ? 'bg-slate-700 text-white' : 'text-slate-400'}`}
            >
              <AlignCenter size={14} />
            </button>
            <button
              onClick={() => setTextAlign('right')}
              className={`p-1 rounded ${textAlign === 'right' ? 'bg-slate-700 text-white' : 'text-slate-400'}`}
            >
              <AlignRight size={14} />
            </button>
          </div>

          <div className="flex items-center gap-1">
            {(['dark', 'light', 'cyber', 'paper'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={`w-5 h-5 rounded-full border ${
                  t === 'dark'
                    ? 'bg-slate-950 border-slate-700'
                    : t === 'light'
                    ? 'bg-slate-100 border-slate-400'
                    : t === 'cyber'
                    ? 'bg-cyan-950 border-cyan-400'
                    : 'bg-[#fbf7ee] border-[#d4c3a3]'
                } ${theme === t ? 'ring-2 ring-brand-400 scale-110' : 'opacity-70 hover:opacity-100'}`}
              />
            ))}
          </div>
        </div>
      </div>

      {viewMode === 'sandbox' ? (
        <div className={`p-8 rounded-2xl border min-h-[300px] flex flex-col justify-center transition-all ${themeStyles[theme]}`}>
          <textarea
            value={sampleText}
            onChange={(e) => setSampleText(e.target.value)}
            style={{
              fontSize: `${fontSize}px`,
              letterSpacing: `${letterSpacing}px`,
              lineHeight: lineHeight,
              textAlign: textAlign,
            }}
            placeholder="Type your custom text here..."
            className="w-full bg-transparent focus:outline-none resize-none live-custom-font border-none overflow-hidden"
            rows={4}
          />
        </div>
      ) : (
        <div className={`p-6 rounded-2xl border flex flex-col gap-6 max-h-[450px] overflow-y-auto ${themeStyles[theme]}`}>
          {[72, 48, 36, 24, 18, 14].map((sz) => (
            <div key={sz} className="flex items-baseline gap-4 border-b border-current/10 pb-4">
              <span className="font-mono text-xs opacity-50 w-12 flex-shrink-0">{sz}px</span>
              <div
                className="live-custom-font flex-1 overflow-hidden text-ellipsis whitespace-nowrap"
                style={{
                  fontSize: `${sz}px`,
                  letterSpacing: `${letterSpacing}px`,
                }}
              >
                {sampleText}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
