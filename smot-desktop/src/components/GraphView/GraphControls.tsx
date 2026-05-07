interface GraphControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
}

export function GraphControls({ onZoomIn, onZoomOut, onReset }: GraphControlsProps) {
  return (
    <div className="graph-controls">
      <button onClick={onZoomIn} title="Zoom In" className="graph-ctrl-btn">＋</button>
      <button onClick={onZoomOut} title="Zoom Out" className="graph-ctrl-btn">－</button>
      <button onClick={onReset} title="Reset View" className="graph-ctrl-btn">↺</button>
    </div>
  );
}
