import type { ViewerDocument } from '../../types';
import { getCategoryColor } from './GraphNode';

interface GraphTooltipProps {
  doc: ViewerDocument;
  x: number;
  y: number;
}

export function GraphTooltip({ doc, x, y }: GraphTooltipProps) {
  return (
    <div className="graph-tooltip" style={{ left: x + 16, top: y - 8 }}>
      <p style={{ color: getCategoryColor(doc.category), fontWeight: 600, margin: 0 }}>{doc.name}</p>
      <p style={{ margin: '4px 0 0', fontSize: '0.85em' }}>{doc.category} • {doc.file_type}</p>
      <p style={{ margin: '2px 0 0', fontSize: '0.82em', color: '#8a9bb5' }}>
        {(doc.size_kb / 1024).toFixed(2)} MB • {doc.pages} pag.
      </p>
    </div>
  );
}
