import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForceGraph } from '../../hooks/useForceGraph';
import { useGraphData } from '../../hooks/useGraphData';
import { useGraphZoom } from '../../hooks/useGraphZoom';
import type { ViewerDocument } from '../../types';
import { GraphCanvas } from './GraphCanvas';
import { GraphControls } from './GraphControls';
import { GraphLegend } from './GraphLegend';
import { GraphSidebar } from './GraphSidebar';

interface GraphViewProps {
  documents: ViewerDocument[];
}

export function GraphView({ documents }: GraphViewProps) {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ width: 800, height: 600 });
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { nodeData, relations } = useGraphData(documents);
  const graphState = useForceGraph(documents, relations, dims.width, dims.height);
  const {
    zoom, handleWheel, handleMouseDown, handleMouseMove, handleMouseUp,
    zoomIn, zoomOut, resetView,
  } = useGraphZoom();

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      setDims({ width, height });
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const selectedDoc = selectedId
    ? (nodeData.find(d => d.id === selectedId) ?? null)
    : null;

  const handleNodeClick = useCallback((id: string) => {
    setSelectedId(prev => (prev === id ? null : id));
  }, []);

  return (
    <div className="graph-view" ref={containerRef}>
      <GraphCanvas
        documents={nodeData}
        relations={relations}
        graphState={graphState}
        selectedId={selectedId}
        onNodeClick={handleNodeClick}
        zoom={zoom}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      />
      <GraphLegend />
      <GraphControls onZoomIn={zoomIn} onZoomOut={zoomOut} onReset={resetView} />
      <GraphSidebar
        doc={selectedDoc}
        onClose={() => setSelectedId(null)}
        onNavigate={id => navigate(`/viewer/${id}`)}
      />
    </div>
  );
}
