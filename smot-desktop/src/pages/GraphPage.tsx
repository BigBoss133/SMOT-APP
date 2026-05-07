import { useEffect, useState } from 'react';
import { GraphView } from '../components/GraphView/GraphView';
import { getDocuments } from '../services/api';
import type { ViewerDocument } from '../types';

export default function GraphPage() {
  const [documents, setDocuments] = useState<ViewerDocument[]>([]);

  useEffect(() => {
    void getDocuments().then(setDocuments);
  }, []);

  return (
    <div
      className="page-grid"
      style={{ height: 'calc(100vh - 130px)' }}
      data-testid="graph-page"
    >
      <section
        className="panel-card"
        style={{ padding: 0, overflow: 'hidden', height: '100%', position: 'relative' }}
        data-testid="graph-panel"
      >
        <GraphView documents={documents} />
      </section>
    </div>
  );
}
