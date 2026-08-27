import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { EditorTool, FontMetrics, Point, VectorNode, VectorSubpath } from '../../types/font';
import {
  generateCirclePath,
  generateEllipsePath,
  generateRectPath,
  subpathsToSvgPath,
  svgPathToSubpaths,
} from '../../utils/svgParser';

interface VectorCanvasProps {
  svgPath: string;
  onChangeSvgPath: (newPath: string) => void;
  metrics: FontMetrics;
  advanceWidth: number;
  onChangeAdvanceWidth: (width: number) => void;
  currentTool: EditorTool;
  snapToGrid: boolean;
  showGuides: boolean;
  showGrid: boolean;
  zoom: number;
}

export const VectorCanvas: React.FC<VectorCanvasProps> = ({
  svgPath,
  onChangeSvgPath,
  metrics,
  advanceWidth,
  onChangeAdvanceWidth,
  currentTool,
  snapToGrid,
  showGuides,
  showGrid,
  zoom,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Subpath vector data for node manipulation
  const [subpaths, setSubpaths] = useState<VectorSubpath[]>([]);
  const [selectedNode, setSelectedNode] = useState<{ subpathIdx: number; nodeIdx: number; handle?: 'in' | 'out' } | null>(null);

  // Active drawing states
  const [isDrawing, setIsDrawing] = useState(false);
  const [dragStart, setDragStart] = useState<Point | null>(null);
  const [currentMousePos, setCurrentMousePos] = useState<Point>({ x: 0, y: 0 });
  const [activePenSubpath, setActivePenSubpath] = useState<VectorSubpath | null>(null);
  const [brushPoints, setBrushPoints] = useState<Point[]>([]);

  // Dragging metrics guides
  const [draggingGuide, setDraggingGuide] = useState<'advanceWidth' | null>(null);

  // Sync subpaths from incoming svgPath when not actively editing
  useEffect(() => {
    const sp = svgPathToSubpaths(svgPath);
    setSubpaths(sp);
  }, [svgPath]);

  // Coordinate conversion: screen pointer event -> SVG ViewBox (0 0 1000 1000)
  const getSvgCoordinates = useCallback(
    (e: React.MouseEvent | MouseEvent): Point => {
      if (!svgRef.current) return { x: 0, y: 0 };
      const rect = svgRef.current.getBoundingClientRect();
      const rawX = ((e.clientX - rect.left) / rect.width) * 1000;
      const rawY = ((e.clientY - rect.top) / rect.height) * 1000;

      if (snapToGrid) {
        const gridSize = 25;
        return {
          x: Math.round(rawX / gridSize) * gridSize,
          y: Math.round(rawY / gridSize) * gridSize,
        };
      }

      return {
        x: Math.round(rawX * 10) / 10,
        y: Math.round(rawY * 10) / 10,
      };
    },
    [snapToGrid]
  );

  // Update SVG Path and propagate
  const updateAndPropagate = (newSubpaths: VectorSubpath[]) => {
    setSubpaths(newSubpaths);
    const newSvg = subpathsToSvgPath(newSubpaths);
    onChangeSvgPath(newSvg);
  };

  // Keyboard Shortcuts (Delete node, Enter to close pen, etc.)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedNode !== null) {
          e.preventDefault();
          const { subpathIdx, nodeIdx } = selectedNode;
          const updated = [...subpaths];
          if (updated[subpathIdx]) {
            updated[subpathIdx].nodes.splice(nodeIdx, 1);
            if (updated[subpathIdx].nodes.length === 0) {
              updated.splice(subpathIdx, 1);
            }
            setSelectedNode(null);
            updateAndPropagate(updated);
          }
        }
      } else if (e.key === 'Enter') {
        if (activePenSubpath) {
          const updated = [...subpaths, activePenSubpath];
          setActivePenSubpath(null);
          updateAndPropagate(updated);
        }
      } else if (e.key === 'Escape') {
        setActivePenSubpath(null);
        setIsDrawing(false);
        setDragStart(null);
        setSelectedNode(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNode, subpaths, activePenSubpath]);

  // MOUSE DOWN HANDLER
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    const pt = getSvgCoordinates(e);
    setDragStart(pt);
    setIsDrawing(true);

    if (currentTool === 'pen') {
      if (!activePenSubpath) {
        const newSp: VectorSubpath = {
          id: `sp_${Date.now()}`,
          closed: false,
          nodes: [
            {
              id: `n_${Date.now()}`,
              x: pt.x,
              y: pt.y,
              type: 'move',
            },
          ],
        };
        setActivePenSubpath(newSp);
      } else {
        const firstNode = activePenSubpath.nodes[0];
        const dist = Math.hypot(pt.x - firstNode.x, pt.y - firstNode.y);
        if (dist < 20 && activePenSubpath.nodes.length > 2) {
          const closedSp: VectorSubpath = { ...activePenSubpath, closed: true };
          const updated = [...subpaths, closedSp];
          setActivePenSubpath(null);
          updateAndPropagate(updated);
          setIsDrawing(false);
          return;
        }

        const newNode: VectorNode = {
          id: `n_${Date.now()}`,
          x: pt.x,
          y: pt.y,
          type: 'line',
        };
        setActivePenSubpath({
          ...activePenSubpath,
          nodes: [...activePenSubpath.nodes, newNode],
        });
      }
    } else if (currentTool === 'brush') {
      setBrushPoints([pt]);
    }
  };

  // MOUSE MOVE HANDLER
  const handleMouseMove = (e: React.MouseEvent) => {
    const pt = getSvgCoordinates(e);
    setCurrentMousePos(pt);

    if (draggingGuide === 'advanceWidth') {
      const clamped = Math.max(200, Math.min(1000, Math.round(pt.x / 10) * 10));
      onChangeAdvanceWidth(clamped);
      return;
    }

    if (!isDrawing || !dragStart) return;

    if (currentTool === 'brush') {
      setBrushPoints((prev) => [...prev, pt]);
    } else if (currentTool === 'pen' && activePenSubpath) {
      const nodes = [...activePenSubpath.nodes];
      const lastIdx = nodes.length - 1;
      if (lastIdx >= 0) {
        const node = nodes[lastIdx];
        const dx = pt.x - node.x;
        const dy = pt.y - node.y;
        node.type = 'cubic';
        node.handleOut = { x: node.x + dx, y: node.y + dy };
        node.handleIn = { x: node.x - dx, y: node.y - dy };
        setActivePenSubpath({ ...activePenSubpath, nodes });
      }
    } else if (currentTool === 'node' && selectedNode !== null) {
      const { subpathIdx, nodeIdx, handle } = selectedNode;
      const updated = [...subpaths];
      const targetNode = updated[subpathIdx]?.nodes[nodeIdx];
      if (targetNode) {
        if (!handle) {
          const dx = pt.x - targetNode.x;
          const dy = pt.y - targetNode.y;
          targetNode.x = pt.x;
          targetNode.y = pt.y;
          if (targetNode.handleIn) {
            targetNode.handleIn.x += dx;
            targetNode.handleIn.y += dy;
          }
          if (targetNode.handleOut) {
            targetNode.handleOut.x += dx;
            targetNode.handleOut.y += dy;
          }
        } else if (handle === 'in') {
          targetNode.handleIn = { x: pt.x, y: pt.y };
        } else if (handle === 'out') {
          targetNode.handleOut = { x: pt.x, y: pt.y };
        }
        updateAndPropagate(updated);
      }
    }
  };

  // MOUSE UP HANDLER
  const handleMouseUp = (e: React.MouseEvent) => {
    if (draggingGuide) {
      setDraggingGuide(null);
    }

    if (!isDrawing || !dragStart) return;
    const pt = getSvgCoordinates(e);
    setIsDrawing(false);

    if (currentTool === 'circle') {
      const dx = pt.x - dragStart.x;
      const dy = pt.y - dragStart.y;
      const r = Math.max(10, Math.hypot(dx, dy));
      const circlePath = generateCirclePath(dragStart.x, dragStart.y, r);
      const newSp = svgPathToSubpaths(circlePath);
      updateAndPropagate([...subpaths, ...newSp]);
    } else if (currentTool === 'ellipse') {
      const rx = Math.max(10, Math.abs(pt.x - dragStart.x));
      const ry = Math.max(10, Math.abs(pt.y - dragStart.y));
      const ellipsePath = generateEllipsePath(dragStart.x, dragStart.y, rx, ry);
      const newSp = svgPathToSubpaths(ellipsePath);
      updateAndPropagate([...subpaths, ...newSp]);
    } else if (currentTool === 'rect') {
      const x = Math.min(dragStart.x, pt.x);
      const y = Math.min(dragStart.y, pt.y);
      const w = Math.max(10, Math.abs(pt.x - dragStart.x));
      const h = Math.max(10, Math.abs(pt.y - dragStart.y));
      const rectPath = generateRectPath(x, y, w, h, 0);
      const newSp = svgPathToSubpaths(rectPath);
      updateAndPropagate([...subpaths, ...newSp]);
    } else if (currentTool === 'roundedRect') {
      const x = Math.min(dragStart.x, pt.x);
      const y = Math.min(dragStart.y, pt.y);
      const w = Math.max(10, Math.abs(pt.x - dragStart.x));
      const h = Math.max(10, Math.abs(pt.y - dragStart.y));
      const rectPath = generateRectPath(x, y, w, h, 20);
      const newSp = svgPathToSubpaths(rectPath);
      updateAndPropagate([...subpaths, ...newSp]);
    } else if (currentTool === 'line') {
      const lineSp: VectorSubpath = {
        id: `sp_${Date.now()}`,
        closed: false,
        nodes: [
          { id: `n1_${Date.now()}`, x: dragStart.x, y: dragStart.y, type: 'move' },
          { id: `n2_${Date.now()}`, x: pt.x, y: pt.y, type: 'line' },
        ],
      };
      updateAndPropagate([...subpaths, lineSp]);
    } else if (currentTool === 'brush' && brushPoints.length > 1) {
      const simplifiedNodes: VectorNode[] = brushPoints.map((p, idx) => ({
        id: `bp_${idx}_${Date.now()}`,
        x: p.x,
        y: p.y,
        type: idx === 0 ? 'move' : 'line',
      }));
      const brushSp: VectorSubpath = {
        id: `sp_${Date.now()}`,
        closed: false,
        nodes: simplifiedNodes,
      };
      updateAndPropagate([...subpaths, brushSp]);
      setBrushPoints([]);
    }

    setDragStart(null);
  };

  const capTop = 1000 - metrics.ascender - metrics.capHeight;
  const xTop = 1000 - metrics.ascender - metrics.xHeight;
  const baseline = 1000 - metrics.ascender;
  const descenderY = 1000 - metrics.ascender - metrics.descender;
  const leftBearing = 40;
  const rightBearing = advanceWidth || 600;

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[520px] flex items-center justify-center bg-slate-950 rounded-2xl border border-slate-800/80 overflow-hidden select-none canvas-checkerboard shadow-inner"
    >
      <div
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: 'center center',
          transition: 'transform 0.1s ease-out',
        }}
        className="w-[500px] h-[500px] relative bg-slate-900/90 shadow-2xl rounded-lg border border-slate-700/50"
      >
        <svg
          ref={svgRef}
          viewBox="0 0 1000 1000"
          className="w-full h-full cursor-crosshair overflow-visible"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={() => {
            if (draggingGuide) setDraggingGuide(null);
          }}
        >
          {showGrid && (
            <defs>
              <pattern id="gridPattern" width="50" height="50" patternUnits="userSpaceOnUse">
                <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
              </pattern>
            </defs>
          )}
          {showGrid && <rect width="1000" height="1000" fill="url(#gridPattern)" />}

          {showGuides && (
            <g className="pointer-events-none">
              <line x1="0" y1={capTop} x2="1000" y2={capTop} stroke="#ec4899" strokeWidth="2" strokeDasharray="6 4" opacity="0.75" />
              <text x="12" y={capTop - 6} fill="#ec4899" fontSize="24" fontWeight="600" fontFamily="monospace">
                Cap-Height ({Math.round(capTop)})
              </text>

              <line x1="0" y1={xTop} x2="1000" y2={xTop} stroke="#8b5cf6" strokeWidth="2" strokeDasharray="6 4" opacity="0.7" />
              <text x="12" y={xTop - 6} fill="#8b5cf6" fontSize="24" fontWeight="600" fontFamily="monospace">
                X-Height ({Math.round(xTop)})
              </text>

              <line x1="0" y1={baseline} x2="1000" y2={baseline} stroke="#3b82f6" strokeWidth="3" opacity="0.9" />
              <text x="12" y={baseline - 8} fill="#3b82f6" fontSize="26" fontWeight="bold" fontFamily="monospace">
                Baseline (y={Math.round(baseline)})
              </text>

              {descenderY <= 1000 && (
                <>
                  <line x1="0" y1={descenderY} x2="1000" y2={descenderY} stroke="#f97316" strokeWidth="2" strokeDasharray="6 4" opacity="0.7" />
                  <text x="12" y={descenderY - 6} fill="#f97316" fontSize="24" fontWeight="600" fontFamily="monospace">
                    Descender ({Math.round(descenderY)})
                  </text>
                </>
              )}

              <line x1={leftBearing} y1="0" x2={leftBearing} y2="1000" stroke="#10b981" strokeWidth="2" strokeDasharray="4 4" opacity="0.6" />
            </g>
          )}

          <g className="cursor-ew-resize" onMouseDown={(e) => { e.stopPropagation(); setDraggingGuide('advanceWidth'); }}>
            <line x1={rightBearing} y1="0" x2={rightBearing} y2="1000" stroke="#06b6d4" strokeWidth="3" opacity="0.85" />
            <rect x={rightBearing - 16} y="40" width="32" height="60" rx="6" fill="#06b6d4" opacity="0.85" />
            <text x={rightBearing} y="75" fill="#042f2e" fontSize="20" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
              ⇔
            </text>
            <text x={rightBearing + 10} y="130" fill="#06b6d4" fontSize="22" fontWeight="bold" fontFamily="monospace">
              Width: {rightBearing}
            </text>
          </g>

          {svgPath && (
            <path
              d={svgPath}
              fill="#f8fafc"
              stroke="#60a5fa"
              strokeWidth="2"
              strokeLinejoin="round"
              strokeLinecap="round"
              className="transition-colors"
            />
          )}

          {isDrawing && dragStart && currentTool === 'circle' && (
            <circle
              cx={dragStart.x}
              cy={dragStart.y}
              r={Math.hypot(currentMousePos.x - dragStart.x, currentMousePos.y - dragStart.y)}
              fill="rgba(59, 130, 246, 0.25)"
              stroke="#3b82f6"
              strokeWidth="3"
              strokeDasharray="6 4"
            />
          )}

          {isDrawing && dragStart && currentTool === 'ellipse' && (
            <ellipse
              cx={dragStart.x}
              cy={dragStart.y}
              rx={Math.abs(currentMousePos.x - dragStart.x)}
              ry={Math.abs(currentMousePos.y - dragStart.y)}
              fill="rgba(245, 158, 11, 0.25)"
              stroke="#f59e0b"
              strokeWidth="3"
              strokeDasharray="6 4"
            />
          )}

          {isDrawing && dragStart && (currentTool === 'rect' || currentTool === 'roundedRect') && (
            <rect
              x={Math.min(dragStart.x, currentMousePos.x)}
              y={Math.min(dragStart.y, currentMousePos.y)}
              width={Math.abs(currentMousePos.x - dragStart.x)}
              height={Math.abs(currentMousePos.y - dragStart.y)}
              rx={currentTool === 'roundedRect' ? 20 : 0}
              fill="rgba(99, 102, 241, 0.25)"
              stroke="#6366f1"
              strokeWidth="3"
              strokeDasharray="6 4"
            />
          )}

          {isDrawing && dragStart && currentTool === 'line' && (
            <line
              x1={dragStart.x}
              y1={dragStart.y}
              x2={currentMousePos.x}
              y2={currentMousePos.y}
              stroke="#38bdf8"
              strokeWidth="6"
              strokeLinecap="round"
            />
          )}

          {isDrawing && currentTool === 'brush' && brushPoints.length > 1 && (
            <polyline
              points={brushPoints.map((p) => `${p.x},${p.y}`).join(' ')}
              fill="none"
              stroke="#a855f7"
              strokeWidth="20"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {activePenSubpath && (
            <g>
              <path
                d={subpathsToSvgPath([activePenSubpath])}
                fill="none"
                stroke="#ec4899"
                strokeWidth="4"
                strokeDasharray="6 3"
              />
              {activePenSubpath.nodes.map((n, i) => (
                <circle key={i} cx={n.x} cy={n.y} r="10" fill="#ec4899" stroke="#ffffff" strokeWidth="3" />
              ))}
            </g>
          )}

          {currentTool === 'node' &&
            subpaths.map((sp, spIdx) => (
              <g key={sp.id}>
                {sp.nodes.map((node, nIdx) => {
                  const isSelected =
                    selectedNode?.subpathIdx === spIdx && selectedNode?.nodeIdx === nIdx;

                  return (
                    <g key={node.id}>
                      {node.handleOut && (
                        <>
                          <line
                            x1={node.x}
                            y1={node.y}
                            x2={node.handleOut.x}
                            y2={node.handleOut.y}
                            stroke="#38bdf8"
                            strokeWidth="2"
                          />
                          <circle
                            cx={node.handleOut.x}
                            cy={node.handleOut.y}
                            r="8"
                            fill="#38bdf8"
                            className="cursor-pointer hover:scale-125 transition-transform"
                            onMouseDown={(e) => {
                              e.stopPropagation();
                              setSelectedNode({ subpathIdx: spIdx, nodeIdx: nIdx, handle: 'out' });
                              setIsDrawing(true);
                            }}
                          />
                        </>
                      )}

                      {node.handleIn && (
                        <>
                          <line
                            x1={node.x}
                            y1={node.y}
                            x2={node.handleIn.x}
                            y2={node.handleIn.y}
                            stroke="#ec4899"
                            strokeWidth="2"
                          />
                          <circle
                            cx={node.handleIn.x}
                            cy={node.handleIn.y}
                            r="8"
                            fill="#ec4899"
                            className="cursor-pointer hover:scale-125 transition-transform"
                            onMouseDown={(e) => {
                              e.stopPropagation();
                              setSelectedNode({ subpathIdx: spIdx, nodeIdx: nIdx, handle: 'in' });
                              setIsDrawing(true);
                            }}
                          />
                        </>
                      )}

                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={isSelected ? '12' : '9'}
                        fill={isSelected ? '#f59e0b' : '#3b82f6'}
                        stroke="#ffffff"
                        strokeWidth="3"
                        className="cursor-pointer hover:scale-125 transition-transform"
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          setSelectedNode({ subpathIdx: spIdx, nodeIdx: nIdx });
                          setIsDrawing(true);
                        }}
                      />
                    </g>
                  );
                })}
              </g>
            ))}
        </svg>
      </div>

      <div className="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur border border-slate-800 rounded-lg px-3 py-1.5 text-[11px] font-mono text-slate-400 flex items-center gap-3 pointer-events-none">
        <span>X: <strong className="text-slate-200">{Math.round(currentMousePos.x)}</strong></span>
        <span>Y: <strong className="text-slate-200">{Math.round(currentMousePos.y)}</strong></span>
        <span>Width: <strong className="text-cyan-400">{advanceWidth}</strong></span>
      </div>
    </div>
  );
};
