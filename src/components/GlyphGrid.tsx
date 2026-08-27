import React, { useState } from 'react';
import {
  Search,
  Plus,
  CheckCircle2,
  CircleDot,
  Type,
} from 'lucide-react';
import type { CharacterCategory, Glyph } from '../types/font';

interface GlyphGridProps {
  glyphs: Record<string, Glyph>;
  selectedChar: string;
  onSelectChar: (char: string) => void;
  onAddCustomGlyph: (char: string) => void;
}

export const GlyphGrid: React.FC<GlyphGridProps> = ({
  glyphs,
  selectedChar,
  onSelectChar,
  onAddCustomGlyph,
}) => {
  const [activeCategory, setActiveCategory] = useState<CharacterCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [customCharInput, setCustomCharInput] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const categories: { id: CharacterCategory; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'uppercase', label: 'A-Z (Caps)' },
    { id: 'lowercase', label: 'a-z (Lower)' },
    { id: 'numbers', label: '0-9 (Digits)' },
    { id: 'punctuation', label: 'Symbols' },
  ];

  const glyphList = Object.values(glyphs);

  const filteredGlyphs = glyphList.filter((g) => {
    if (activeCategory === 'uppercase' && g.category !== 'uppercase') return false;
    if (activeCategory === 'lowercase' && g.category !== 'lowercase') return false;
    if (activeCategory === 'numbers' && g.category !== 'number') return false;
    if (activeCategory === 'punctuation' && g.category !== 'punctuation') return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchChar = g.char.toLowerCase().includes(q);
      const matchUni = g.unicode.toString(16).toLowerCase().includes(q);
      const matchName = g.name.toLowerCase().includes(q);
      return matchChar || matchUni || matchName;
    }

    return true;
  });

  const completedCount = glyphList.filter((g) => g.isCompleted || (g.svgPath && g.svgPath.length > 0)).length;
  const progressPercent = Math.round((completedCount / (glyphList.length || 1)) * 100);

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (customCharInput.trim()) {
      onAddCustomGlyph(customCharInput.trim()[0]);
      setCustomCharInput('');
      setShowAddModal(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 bg-slate-900/80 backdrop-blur border border-slate-800/80 rounded-2xl p-4 shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
              <Type size={16} className="text-brand-400" />
              <span>Character Map</span>
            </h3>
            <span className="text-xs font-semibold text-slate-400">
              ({completedCount}/{glyphList.length} drawn)
            </span>
          </div>

          <div className="w-44 h-1.5 bg-slate-800 rounded-full mt-1.5 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-brand-500 to-emerald-400 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Find character..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500 w-36 sm:w-44"
            />
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            title="Add Custom Unicode Character or Symbol"
            className="flex items-center gap-1 px-3 py-1.5 bg-brand-600/20 hover:bg-brand-600/30 text-brand-300 border border-brand-500/40 rounded-lg text-xs font-medium transition-all"
          >
            <Plus size={14} />
            <span>Add Glyph</span>
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-1">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              activeCategory === cat.id
                ? 'bg-slate-700 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2 max-h-[380px] overflow-y-auto pr-1">
        {filteredGlyphs.map((glyph) => {
          const isSelected = glyph.char === selectedChar;
          const hasPath = !!(glyph.svgPath && glyph.svgPath.trim().length > 0);

          return (
            <button
              key={glyph.char}
              onClick={() => onSelectChar(glyph.char)}
              className={`relative flex flex-col items-center justify-between p-2 rounded-xl border transition-all aspect-square ${
                isSelected
                  ? 'bg-brand-600/20 border-brand-500 ring-2 ring-brand-500/40 shadow-lg scale-105 z-10'
                  : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
              }`}
            >
              <div className="w-full flex items-center justify-between text-[10px] text-slate-400">
                <span className="font-bold text-slate-200">{glyph.char}</span>
                {hasPath ? (
                  <CheckCircle2 size={10} className="text-emerald-400" />
                ) : (
                  <CircleDot size={10} className="text-slate-600" />
                )}
              </div>

              <div className="w-8 h-8 flex items-center justify-center my-auto">
                {hasPath ? (
                  <svg viewBox="0 0 1000 1000" className="w-full h-full">
                    <path
                      d={glyph.svgPath}
                      fill={isSelected ? '#60a5fa' : '#cbd5e1'}
                    />
                  </svg>
                ) : (
                  <span className="text-xs text-slate-600 font-mono italic select-none">
                    {glyph.char}
                  </span>
                )}
              </div>

              <span className="text-[9px] font-mono text-slate-500">
                {glyph.unicode.toString(16).toUpperCase()}
              </span>
            </button>
          );
        })}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 max-w-sm w-full shadow-2xl">
            <h4 className="text-sm font-bold text-slate-100 mb-2 flex items-center gap-2">
              <Plus size={16} className="text-brand-400" />
              <span>Add Custom Glyph or Symbol</span>
            </h4>
            <p className="text-xs text-slate-400 mb-4">
              Enter any character, accent, emoji, or symbol (e.g. ©, €, ñ, ★, λ, ☺):
            </p>
            <form onSubmit={handleAddCustom} className="flex flex-col gap-3">
              <input
                type="text"
                autoFocus
                maxLength={2}
                value={customCharInput}
                onChange={(e) => setCustomCharInput(e.target.value)}
                placeholder="Enter character (e.g. € or ★)"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-center text-2xl font-bold text-brand-300 focus:outline-none focus:border-brand-500"
              />
              <div className="flex items-center justify-end gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!customCharInput.trim()}
                  className="px-4 py-1.5 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-md"
                >
                  Add Glyph
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
