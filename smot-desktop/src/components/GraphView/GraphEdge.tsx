interface GraphEdgeProps {
  sx: number; sy: number;
  tx: number; ty: number;
  strength: number;
  isVisible: boolean;
  animDelay: number;
}

export function GraphEdge({ sx, sy, tx, ty, strength, isVisible, animDelay }: GraphEdgeProps) {
  return (
    <line
      x1={sx} y1={sy} x2={tx} y2={ty}
      stroke="url(#edge-gradient)"
      strokeWidth={Math.max(0.5, strength * 3)}
      opacity={isVisible ? strength * 0.7 : 0.04}
      style={{
        transition: 'opacity 0.25s ease',
        animation: `edge-fade-in 1.5s ease-out ${animDelay}ms both`,
      }}
    />
  );
}
