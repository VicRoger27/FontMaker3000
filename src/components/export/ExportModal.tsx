import React, { useState, useMemo } from 'react';
import {
  Download,
  X,
  FileCode,
  Globe,
  Package,
  Copy,
  Check,
  Sparkles,
} from 'lucide-react';
import type { FontProject } from '../../types/font';
import {
  downloadCompleteFontZip,
  downloadOtfFont,
  downloadProjectJson,
  downloadTtfFont,
  downloadWoffFont,
} from '../../utils/exportHelpers';
import { fontToDataUri, generateCssSnippet } from '../../utils/fontCompiler';

interface ExportModalProps {
  project: FontProject;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ project, onClose }) => {
  const [activeTab, setActiveTab] = useState<'download' | 'webhost' | 'css'>('download');
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [copiedDataUri, setCopiedDataUri] = useState(false);
  const [isZipping, setIsZipping] = useState(false);

  const dataUri = useMemo(() => {
    try {
      return fontToDataUri(project);
    } catch (e) {
      console.warn('Data URI generation failed:', e);
      return '';
    }
  }, [project]);

  const cssSnippet = useMemo(() => {
    return generateCssSnippet(project, dataUri);
  }, [project, dataUri]);

  const handleCopyCss = () => {
    navigator.clipboard.writeText(cssSnippet);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  const handleCopyDataUri = () => {
    navigator.clipboard.writeText(dataUri);
    setCopiedDataUri(true);
    setTimeout(() => setCopiedDataUri(false), 2000);
  };

  const handleDownloadZip = async () => {
    try {
      setIsZipping(true);
      await downloadCompleteFontZip(project);
    } catch (e) {
      console.error('ZIP generation failed:', e);
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-2xl w-full shadow-2xl flex flex-col gap-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Download size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">
                Export & Web Font Hosting
              </h3>
              <p className="text-xs text-slate-400">
                Download font files (.TTF, .OTF, .WOFF) or copy instant web-ready embed codes
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

        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('download')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'download'
                ? 'bg-brand-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Package size={14} />
            <span>Font Files & ZIP</span>
          </button>

          <button
            onClick={() => setActiveTab('webhost')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'webhost'
                ? 'bg-brand-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe size={14} />
            <span>Web Embed & Data URI</span>
          </button>

          <button
            onClick={() => setActiveTab('css')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'css'
                ? 'bg-brand-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCode size={14} />
            <span>CSS @font-face</span>
          </button>
        </div>

        {activeTab === 'download' && (
          <div className="flex flex-col gap-4">
            <div className="p-5 rounded-2xl bg-gradient-to-br from-brand-900/40 to-indigo-950/40 border border-brand-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold text-brand-400 uppercase tracking-wider bg-brand-500/20 px-2 py-0.5 rounded-full border border-brand-500/30">
                  Recommended
                </span>
                <h4 className="text-sm font-bold text-white mt-1">
                  Complete Web Font Package (.ZIP)
                </h4>
                <p className="text-xs text-slate-300 mt-0.5">
                  Includes .TTF, .OTF, .WOFF, SVG glyphs archive, demo HTML test page, and ready CSS.
                </p>
              </div>

              <button
                onClick={handleDownloadZip}
                disabled={isZipping}
                className="flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-brand-500/20 transition-all flex-shrink-0"
              >
                <Download size={14} />
                <span>{isZipping ? 'Packaging ZIP...' : 'Download Full ZIP'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={() => downloadTtfFont(project)}
                className="flex flex-col items-start p-4 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 hover:bg-slate-850 transition-all group"
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-bold text-xs text-slate-100 group-hover:text-brand-400">
                    TrueType (.TTF)
                  </span>
                  <Download size={14} className="text-slate-500 group-hover:text-brand-400" />
                </div>
                <span className="text-[11px] text-slate-400 mt-1">
                  Standard desktop font for Windows, macOS & Linux
                </span>
              </button>

              <button
                onClick={() => downloadOtfFont(project)}
                className="flex flex-col items-start p-4 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 hover:bg-slate-850 transition-all group"
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-bold text-xs text-slate-100 group-hover:text-indigo-400">
                    OpenType (.OTF)
                  </span>
                  <Download size={14} className="text-slate-500 group-hover:text-indigo-400" />
                </div>
                <span className="text-[11px] text-slate-400 mt-1">
                  Professional OpenType format for graphic design
                </span>
              </button>

              <button
                onClick={() => downloadWoffFont(project)}
                className="flex flex-col items-start p-4 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 hover:bg-slate-850 transition-all group"
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-bold text-xs text-slate-100 group-hover:text-emerald-400">
                    Web Font (.WOFF)
                  </span>
                  <Download size={14} className="text-slate-500 group-hover:text-emerald-400" />
                </div>
                <span className="text-[11px] text-slate-400 mt-1">
                  Optimized compressed web font format
                </span>
              </button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
              <div>
                <span className="font-semibold text-slate-200">Save Project Source (.JSON)</span>
                <p className="text-[11px] text-slate-400">Save all glyphs, vectors, and settings to re-open anytime</p>
              </div>
              <button
                onClick={() => downloadProjectJson(project)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
              >
                <Download size={13} />
                <span>Save .json</span>
              </button>
            </div>
          </div>
        )}

        {activeTab === 'webhost' && (
          <div className="flex flex-col gap-4">
            <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 text-xs text-slate-300">
              <span className="font-bold text-cyan-400 flex items-center gap-1.5 mb-1">
                <Sparkles size={14} /> Zero-Hosting Immediate Web Font
              </span>
              You can embed your font directly into any HTML/CSS file without uploading or hosting any font files on a server! The Base64 Data URI contains the entire font binary.
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-semibold">Base64 Data URI Web Font:</span>
                <button
                  onClick={handleCopyDataUri}
                  className="flex items-center gap-1 px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-medium transition-colors shadow-sm"
                >
                  {copiedDataUri ? <Check size={13} /> : <Copy size={13} />}
                  <span>{copiedDataUri ? 'Copied URI' : 'Copy Data URI'}</span>
                </button>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-[11px] text-cyan-300 max-h-28 overflow-y-auto break-all">
                {dataUri || 'Generating font Data URI...'}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'css' && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-semibold">Ready-to-use CSS Snippet:</span>
              <button
                onClick={handleCopyCss}
                className="flex items-center gap-1 px-3 py-1 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-xs font-medium transition-colors shadow-sm"
              >
                {copiedSnippet ? <Check size={13} /> : <Copy size={13} />}
                <span>{copiedSnippet ? 'Copied CSS' : 'Copy CSS'}</span>
              </button>
            </div>

            <pre className="p-4 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-emerald-300 overflow-x-auto max-h-56">
              {cssSnippet}
            </pre>
          </div>
        )}

        <div className="flex items-center justify-end border-t border-slate-800 pt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
