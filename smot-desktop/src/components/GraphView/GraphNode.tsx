import type { ViewerDocument } from '../../types';

export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    Lavoro: '#4338f5',
    Studio: '#894df8',
    Personale: '#bcc41c',
    default: '#8a9bb5',
  };
  return colors[category] ?? colors.default;
}

interface GraphNodeProps {
  doc: ViewerDocument & { connections: number; size: number };
  x: number;
  y: number;
  isSelected: boolean;
  isActive: boolean;
  onClick: () => void;
  onHover: (id: string | null) => void;
  animDelay: number;
}

export function GraphNode({ doc, x, y, isSelected, isActive, onClick, onHover, animDelay }: GraphNodeProps) {
  const color = getCategoryColor(doc.category);
  const radius = 8 + doc.size * 3;

  return (
    <g
      transform={`translate(${x},${y})`}
      style={{
        cursor: 'pointer',
        opacity: isActive ? 1 : 0.2,
        transition: 'opacity 0.25s ease',
        animation: `node-appear 0.5s ease-out ${animDelay}ms both`,
      }}
      onClick={onClick}
      onMouseEnter={() => onHover(doc.id)}
      onMouseLeave={() => onHover(null)}
    >
      <circle r={radius + 6} fill={color} opacity={isSelected ? 0.3 : 0.12}
        style={{ transition: 'opacity 0.2s' }} />
      <circle
        r={isSelected ? radius + 3 : radius}
        fill={doc.indexed ? color : '#8a9bb5'}
        stroke={isSelected ? '#ffffff' : color}
        strokeWidth={isSelected ? 2.5 : 1.5}
        style={{ transition: 'r 0.2s ease' }}
      />
      <text
        dy={radius + 15}
        textAnchor="middle"
        fill="#ffffff"
        fontSize="11"
        fontFamily="Manrope, sans-serif"
        opacity={0.85}
        style={{ pointerEvents: 'none', userSelect: 'none' }}
      >
        {doc.name.length > 20 ? doc.name.slice(0, 18) + '…' : doc.name}
      </text>
    </g>
  );
}
