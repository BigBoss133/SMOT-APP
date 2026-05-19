import { describe, it, expect } from 'vitest';
import { computeRelations } from './graphRelations';
import type { ViewerDocument } from '../types';

describe('computeRelations', () => {
  it('should return empty array for less than 2 documents', () => {
    expect(computeRelations([])).toEqual([]);
    expect(computeRelations([{ id: '1', name: 'doc1', file_type: 'pdf', category: 'A', indexed: true, size_kb: 10, pages: 1 }])).toEqual([]);
  });

  it('should create relations based on category (same category)', () => {
    const docs: ViewerDocument[] = [
      { id: '1', name: 'doc1', file_type: 'pdf', category: 'A', indexed: true, size_kb: 10, pages: 1 },
      { id: '2', name: 'doc2', file_type: 'pdf', category: 'A', indexed: true, size_kb: 10, pages: 1 },
    ];
    const relations = computeRelations(docs);
    expect(relations).toHaveLength(1);
    expect(relations[0]).toEqual({
      source: '1',
      target: '2',
      strength: 0.6,
      type: 'category'
    });
  });

  it('should create relations based on content (different category)', () => {
    const docs: ViewerDocument[] = [
      { id: '1', name: 'doc1', file_type: 'pdf', category: 'A', indexed: true, size_kb: 10, pages: 1 },
      { id: '2', name: 'doc2', file_type: 'pdf', category: 'B', indexed: true, size_kb: 10, pages: 1 },
    ];
    const relations = computeRelations(docs);
    expect(relations).toHaveLength(1);
    expect(relations[0]).toEqual({
      source: '1',
      target: '2',
      strength: 0.15,
      type: 'content'
    });
  });

  it('should limit relations to top 5 per node', () => {
    const docs: ViewerDocument[] = [
      { id: 'src', name: 'doc', file_type: 'pdf', category: 'A', indexed: true, size_kb: 10, pages: 1 },
    ];
    for (let i = 0; i < 10; i++) {
        docs.push({ id: `t${i}`, name: `t${i}`, file_type: 'pdf', category: i < 6 ? 'A' : 'B', indexed: true, size_kb: 10, pages: 1 })
    }
    const relations = computeRelations(docs);

    const countMap = new Map<string, number>();
    for (const rel of relations) {
      countMap.set(rel.source, (countMap.get(rel.source) || 0) + 1);
      countMap.set(rel.target, (countMap.get(rel.target) || 0) + 1);
    }

    // Each node should have at most 5 relations
    for (const count of countMap.values()) {
        expect(count).toBeLessThanOrEqual(5);
    }
  });
});
