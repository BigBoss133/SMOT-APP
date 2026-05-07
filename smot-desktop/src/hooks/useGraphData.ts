import { useMemo } from 'react';
import { computeRelations } from '../services/graphRelations';
import type { ViewerDocument } from '../types';

export function useGraphData(documents: ViewerDocument[]) {
  const relations = useMemo(() => computeRelations(documents), [documents]);

  const nodeData = useMemo(
    () => documents.map(doc => ({
      ...doc,
      connections: relations.filter(r => r.source === doc.id || r.target === doc.id).length,
      size: Math.min(doc.size_kb / 1000, 4),
    })),
    [documents, relations]
  );

  return { nodeData, relations };
}
