import { useState } from 'react';
import type { ForceGraphState } from '../../hooks/useForceGraph';
import type { GraphRelation } from '../../services/graphRelations';
import type { ViewerDocument } from '../../types';
import { GraphEdge } from './GraphEdge';
import { GraphNode } from './GraphNode';
import { GraphTooltip } from './GraphTooltip';

interface GraphCanvasProps {
  documents: Array<ViewerDocument & { connections: number; size: number }>;
  relations: GraphRelation[];
  graphState: ForceGraphState;
  selectedId: string | null;
  onNodeClick: (id: string) => void;
  zoom: { scale: number; x: number; y: number };
  onWheel: (e: React.WheelEvent) => void;
  onMouseDown: (e: React.MouseEvent) => void;
  onMouseMove: (e: React.MouseEvent) => void;
  onMouseUp: () => void;
}

export function GraphCanvas({
  documents, relations, graphState, selectedId, onNodeClick,
  zoom, onWheel, onMouseDown, onMouseMove, onMouseUp,
}: GraphCanvasProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const activeId = hoveredId ?? selectedId;
  const connectedIds = new Set<string>();
  if (activeId) {
    connectedIds.add(activeId);
    relations.forEach(r => {
      if (r.source === activeId) connectedIds.add(r.target);
      if (r.target === activeId) connectedIds.add(r.source);
    });
  }

  const posMap = new Map(graphState.nodePositions.map(n => [n.id, n]));
  const hoveredDoc = hoveredId ? documents.find(d => d.id === hoveredId) : null;

  return (
    <div
      className="graph-canvas-container"
      onWheel={onWheel}
      onMouseDown={onMouseDown}
      onMouseMove={e => { onMouseMove(e); }}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
    >
      <svg width="100%" height="100%" className="graph-svg">
        <defs>
          <linearGradient id="edge-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#4338f5" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#894df8" stopOpacity="0.5" />
          </linearGradient>
          <filter id="node-glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <g transform={`translate(${zoom.x},${zoom.y}) scale(${zoom.scale})`}>
          <g>
            {graphState.linkPositions.map((lp, i) => (
              <GraphEdge
                key={`${lp.sourceId}-${lp.targetId}`}
                sx={lp.sx} sy={lp.sy} tx={lp.tx} ty={lp.ty}
                strength={lp.strength}
                isVisible={!activeId || (connectedIds.has(lp.sourceId) && connectedIds.has(lp.targetId))}
                animDelay={i * 30}
              />
            ))}
          </g>
          <g filter="url(#node-glow)">
            {documents.map((doc, i) => {
              const pos = posMap.get(doc.id);
              if (!pos) return null;
              return (
                <GraphNode
                  key={doc.id}
                  doc={doc}
                  x={pos.x} y={pos.y}
                  isSelected={selectedId === doc.id}
                  isActive={!activeId || connectedIds.has(doc.id)}
                  onClick={() => onNodeClick(doc.id)}
                  onHover={(id) => {
                    setHoveredId(id);
                    if (id) {
                      const p = pos;
                      setTooltipPos({
                        x: p.x * zoom.scale + zoom.x,
                        y: p.y * zoom.scale + zoom.y,
                      });
                    }
                  }}
                  animDelay={i * 50}
                />
              );
            })}
          </g>
        </g>
      </svg>
      {hoveredDoc && (
        <GraphTooltip doc={hoveredDoc} x={tooltipPos.x} y={tooltipPos.y} />
      )}
    </div>
  );
}
