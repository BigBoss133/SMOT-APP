import type { ViewerDocument } from '../types';

export interface GraphRelation {
  source: string;
  target: string;
  strength: number;
  type: 'category' | 'content';
}

export function computeRelations(documents: ViewerDocument[]): GraphRelation[] {
  const relations: GraphRelation[] = [];

  for (let i = 0; i < documents.length; i++) {
    for (let j = i + 1; j < documents.length; j++) {
      const a = documents[i];
      const b = documents[j];
      if (a.category === b.category) {
        relations.push({ source: a.id, target: b.id, strength: 0.6, type: 'category' });
      } else {
        relations.push({ source: a.id, target: b.id, strength: 0.15, type: 'content' });
      }
    }
  }

  return keepTopPerNode(relations, 5);
}

function keepTopPerNode(relations: GraphRelation[], maxPerNode: number): GraphRelation[] {
  const countMap = new Map<string, number>();
  const filtered: GraphRelation[] = [];
  const sorted = [...relations].sort((a, b) => b.strength - a.strength);

  for (const rel of sorted) {
    const s = countMap.get(rel.source) ?? 0;
    const t = countMap.get(rel.target) ?? 0;
    if (s < maxPerNode && t < maxPerNode) {
      filtered.push(rel);
      countMap.set(rel.source, s + 1);
      countMap.set(rel.target, t + 1);
    }
  }
  return filtered;
}
