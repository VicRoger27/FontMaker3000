import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Sparkles,
  ClipboardPaste,
  FileCode,
} from 'lucide-react';
import { extractAndCleanSvgPath, validateSvgPath } from '../../utils/svgParser';

interface SvgCodeEditorProps {
  svgPath: string;
  onChangeSvgPath: (newPath: string) => void;
  advanceWidth: number;
}

export const SvgCodeEditor: React.FC<SvgCodeEditorProps> = ({
  svgPath,
  onChangeSvgPath,
  advanceWidth,
}) => {
  const [codeValue, setCodeValue] = useState(svgPath || '');
  const [copied, setCopied] = useState(false);
  const [validation, setValidation] = useState<{ valid: boolean; error?: string }>({ valid: true });

  useEffect(() => {
    setCodeValue(svgPath || '');
    setValidation(validateSvgPath(svgPath));
  }, [svgPath]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setCodeValue(val);
    const cleaned = extractAndCleanSvgPath(val);
    const valResult = validateSvgPath(cleaned);
    setValidation(valResult);

    if (valResult.valid) {
      onChangeSvgPath(cleaned);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(codeValue);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setCodeValue(text);
        const cleaned = extractAndCleanSvgPath(text);
        const valResult = validateSvgPath(cleaned);
        setValidation(valResult);
        if (valResult.valid) {
          onChangeSvgPath(cleaned);
        }
      }
    } catch (e) {
      console.warn('Clipboard read failed:', e);
    }
  };

  const handleFormat = () => {
    const cleaned = extractAndCleanSvgPath(codeValue);
    const formatted = cleaned.replace(/([MLHVCSQTAZmlhvcsqtaz])/g, '\n$1 ').trim();
    setCodeValue(formatted);
    onChangeSvgPath(cleaned);
  };

  return (
    <div className="flex flex-col h-[520px] bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <FileCode size={16} className="text-brand-400" />
          <span className="text-xs font-semibold text-slate-200">SVG & Path Editor</span>
          {validation.valid ? (
            <span className="flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              <CheckCircle2 size={12} /> Valid SVG Path
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[11px] text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
              <AlertCircle size={12} /> {validation.error}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handlePasteClipboard}
            title="Paste from Clipboard"
            className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <ClipboardPaste size={13} />
            <span>Paste</span>
          </button>
          <button
            onClick={handleFormat}
            title="Format / Beautify SVG Commands"
            className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <Sparkles size={13} />
            <span>Format</span>
          </button>
          <button
            onClick={handleCopy}
            title="Copy SVG to Clipboard"
            className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg bg-brand-600 hover:bg-brand-500 text-white transition-colors shadow-sm"
          >
            {copied ? <Check size={13} /> : <Copy size={13} />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 flex-1 overflow-hidden">
        <div className="md:col-span-2 relative flex flex-col border-r border-slate-800 bg-slate-950 font-mono text-xs">
          <textarea
            value={codeValue}
            onChange={handleTextChange}
            placeholder='Paste or write SVG path commands here, e.g. M 100 100 L 500 100 L 500 800 Z, or full <svg><path d="..."/></svg>'
            className="w-full flex-1 p-4 bg-transparent text-emerald-300 focus:outline-none resize-none font-mono text-xs leading-relaxed"
            spellCheck={false}
          />
          <div className="p-2 border-t border-slate-900 bg-slate-900/40 text-[11px] text-slate-500 flex justify-between">
            <span>Coordinates: 0 0 to {advanceWidth} 1000</span>
            <span>{codeValue.length} chars</span>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center p-6 bg-slate-900/50 canvas-checkerboard">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Real-time Preview
          </div>
          <div className="w-48 h-48 bg-slate-950 rounded-xl border border-slate-800 p-2 shadow-lg flex items-center justify-center">
            {svgPath ? (
              <svg viewBox="0 0 1000 1000" className="w-full h-full">
                <path d={svgPath} fill="#60a5fa" />
              </svg>
            ) : (
              <span className="text-xs text-slate-600 italic">No path drawn</span>
            )}
          </div>
          <span className="text-[11px] text-slate-500 mt-3 font-mono">
            ViewBox: 0 0 {advanceWidth} 1000
          </span>
        </div>
      </div>
    </div>
  );
};
