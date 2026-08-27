import React, { useState, useEffect, useCallback } from 'react';
import type { FontProject, Glyph } from './types/font';
import { createDefaultFontProject } from './utils/templatePresets';
import {
  loadProjectFromLocalStorage,
  saveProjectToLocalStorage,
} from './utils/exportHelpers';
import { Navbar } from './components/Navbar';
import { GlyphGrid } from './components/GlyphGrid';
import { GlyphEditor } from './components/editor/GlyphEditor';
import { LivePlayground } from './components/playground/LivePlayground';
import { SpecimenSheet } from './components/playground/SpecimenSheet';
import { StyleGeneratorModal } from './components/styles/StyleGeneratorModal';
import { ProjectSettingsModal } from './components/project/ProjectSettingsModal';
import { ExportModal } from './components/export/ExportModal';

export const App: React.FC = () => {
  const [project, setProject] = useState<FontProject>(() => {
    const saved = loadProjectFromLocalStorage();
    if (saved && saved.glyphs && saved.metrics) {
      return saved;
    }
    return createDefaultFontProject('ModernForge', true);
  });

  const [selectedChar, setSelectedChar] = useState<string>('A');
  const [activeView, setActiveView] = useState<'editor' | 'playground' | 'specimen'>('editor');

  const [showStyleModal, setShowStyleModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  const [history, setHistory] = useState<FontProject[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  useEffect(() => {
    saveProjectToLocalStorage(project);
  }, [project]);

  const currentGlyph: Glyph = project.glyphs[selectedChar] || {
    id: `glyph_${selectedChar.charCodeAt(0)}`,
    char: selectedChar,
    unicode: selectedChar.charCodeAt(0),
    name: `uni_${selectedChar}`,
    svgPath: '',
    advanceWidth: project.metrics.defaultAdvanceWidth,
    category: 'custom',
  };

  const handleUpdateCurrentGlyph = useCallback(
    (updated: Partial<Glyph>) => {
      setProject((prev) => {
        setHistory((h) => [...h.slice(0, historyIndex + 1), prev]);
        setHistoryIndex((idx) => idx + 1);

        const newGlyphs = {
          ...prev.glyphs,
          [selectedChar]: {
            ...currentGlyph,
            ...updated,
            modifiedAt: Date.now(),
          },
        };

        return {
          ...prev,
          glyphs: newGlyphs,
          updatedAt: Date.now(),
        };
      });
    },
    [selectedChar, currentGlyph, historyIndex]
  );

  const handleUndo = useCallback(() => {
    if (historyIndex >= 0) {
      const prevProject = history[historyIndex];
      setHistoryIndex((idx) => idx - 1);
      setProject(prevProject);
    }
  }, [history, historyIndex]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextProject = history[historyIndex + 1];
      setHistoryIndex((idx) => idx + 1);
      setProject(nextProject);
    }
  }, [history, historyIndex]);

  const charsList = Object.keys(project.glyphs);
  const currentIndex = charsList.indexOf(selectedChar);

  const handleSelectPrev = () => {
    const prevIdx = (currentIndex - 1 + charsList.length) % charsList.length;
    setSelectedChar(charsList[prevIdx]);
  };

  const handleSelectNext = () => {
    const nextIdx = (currentIndex + 1) % charsList.length;
    setSelectedChar(charsList[nextIdx]);
  };

  const handleAddCustomGlyph = (char: string) => {
    const unicode = char.charCodeAt(0);
    const newGlyph: Glyph = {
      id: `glyph_${unicode}`,
      char,
      unicode,
      name: `custom_${char}`,
      svgPath: '',
      advanceWidth: project.metrics.defaultAdvanceWidth,
      category: 'custom',
      isCompleted: false,
    };

    setProject((prev) => ({
      ...prev,
      glyphs: {
        ...prev.glyphs,
        [char]: newGlyph,
      },
      updatedAt: Date.now(),
    }));

    setSelectedChar(char);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-brand-500 selection:text-white">
      <Navbar
        project={project}
        activeView={activeView}
        onSelectView={setActiveView}
        onOpenStyleModal={() => setShowStyleModal(true)}
        onOpenSettingsModal={() => setShowSettingsModal(true)}
        onOpenExportModal={() => setShowExportModal(true)}
        onLoadProject={(loaded) => {
          setProject(loaded);
          const first = Object.keys(loaded.glyphs)[0] || 'A';
          setSelectedChar(first);
        }}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 flex flex-col gap-5">
        {activeView === 'editor' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            <div className="lg:col-span-8 flex flex-col gap-4">
              <GlyphEditor
                currentGlyph={currentGlyph}
                metrics={project.metrics}
                onUpdateGlyph={handleUpdateCurrentGlyph}
                onSelectPrev={handleSelectPrev}
                onSelectNext={handleSelectNext}
                canUndo={historyIndex >= 0}
                canRedo={historyIndex < history.length - 1}
                onUndo={handleUndo}
                onRedo={handleRedo}
              />
            </div>

            <div className="lg:col-span-4 flex flex-col gap-4">
              <GlyphGrid
                glyphs={project.glyphs}
                selectedChar={selectedChar}
                onSelectChar={setSelectedChar}
                onAddCustomGlyph={handleAddCustomGlyph}
              />
            </div>
          </div>
        )}

        {activeView === 'playground' && <LivePlayground project={project} />}
        {activeView === 'specimen' && <SpecimenSheet project={project} />}
      </main>

      {showStyleModal && (
        <StyleGeneratorModal
          project={project}
          onApplyStyle={(styledProj) => {
            setProject(styledProj);
          }}
          onClose={() => setShowStyleModal(false)}
        />
      )}

      {showSettingsModal && (
        <ProjectSettingsModal
          project={project}
          onSave={(updated) => {
            setProject((prev) => ({
              ...prev,
              ...updated,
              metrics: updated.metrics || prev.metrics,
              updatedAt: Date.now(),
            }));
          }}
          onClose={() => setShowSettingsModal(false)}
        />
      )}

      {showExportModal && (
        <ExportModal project={project} onClose={() => setShowExportModal(false)} />
      )}
    </div>
  );
};

export default App;
