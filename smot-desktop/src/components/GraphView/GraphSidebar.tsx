import type { ViewerDocument } from '../../types';
import { getCategoryColor } from './GraphNode';

interface GraphSidebarProps {
  doc: (ViewerDocument & { connections: number }) | null;
  onClose: () => void;
  onNavigate: (id: string) => void;
}

export function GraphSidebar({ doc, onClose, onNavigate }: GraphSidebarProps) {
  return (
    <div className={`graph-sidebar${doc ? ' open' : ''}`}>
      {doc && (
        <>
          <div className="graph-sidebar-header">
            <h3 style={{ color: getCategoryColor(doc.category), margin: 0, fontSize: '1rem' }}>
              {doc.name}
            </h3>
            <button onClick={onClose} className="graph-ctrl-btn" title="Chiudi">&#x2715;</button>
          </div>
          <div className="graph-sidebar-meta">
            {[
              ['Categoria', doc.category],
              ['Tipo', doc.file_type],
              ['Dimensione', `${(doc.size_kb / 1024).toFixed(2)} MB`],
              ['Pagine', String(doc.pages)],
              ['Connessioni', String(doc.connections)],
            ].map(([label, val]) => (
              <div key={label} className="graph-sidebar-row">
                <span className="card-label">{label}</span>
                <span>{val}</span>
              </div>
            ))}
            <div className="graph-sidebar-row">
              <span className="card-label">Stato</span>
              <span className={doc.indexed ? 'tag-success' : 'tag-warning'}>
                {doc.indexed ? 'Indicizzato' : 'Non indicizzato'}
              </span>
            </div>
          </div>
          <button
            className="action-button"
            style={{ width: '100%', marginTop: 16, cursor: 'pointer' }}
            onClick={() => onNavigate(doc.id)}
          >
            Apri nel Viewer
          </button>
        </>
      )}
    </div>
  );
}
