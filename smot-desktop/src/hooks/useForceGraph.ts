import { useEffect, useRef, useState } from 'react';
import type { GraphRelation } from '../services/graphRelations';
import type { ViewerDocument } from '../types';

export interface NodePosition {
  id: string;
  x: number;
  y: number;
}

export interface LinkPosition {
  sourceId: string;
  targetId: string;
  sx: number;
  sy: number;
  tx: number;
  ty: number;
  strength: number;
  type: string;
}

export interface ForceGraphState {
  nodePositions: NodePosition[];
  linkPositions: LinkPosition[];
}

type SimNode = {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  connections: number;
  size: number;
};

type SimLink = {
  source: string | SimNode;
  target: string | SimNode;
  strength: number;
  type: string;
};

function getId(n: string | SimNode): string {
  return typeof n === 'string' ? n : n.id;
}

export function useForceGraph(
  documents: ViewerDocument[],
  relations: GraphRelation[],
  width: number,
  height: number
) {
  const [state, setState] = useState<ForceGraphState>({ nodePositions: [], linkPositions: [] });
  const rafRef = useRef<number | null>(null);
  const simRef = useRef<{ nodes: SimNode[]; links: SimLink[]; alpha: number } | null>(null);

  useEffect(() => {
    if (!documents.length || width === 0 || height === 0) return;

    const connMap = new Map<string, number>();
    relations.forEach(r => {
      connMap.set(r.source, (connMap.get(r.source) ?? 0) + 1);
      connMap.set(r.target, (connMap.get(r.target) ?? 0) + 1);
    });

    const nodes: SimNode[] = documents.map(doc => ({
      id: doc.id,
      x: width / 2 + (Math.random() - 0.5) * 200,
      y: height / 2 + (Math.random() - 0.5) * 200,
      vx: 0, vy: 0,
      connections: connMap.get(doc.id) ?? 0,
      size: Math.min(doc.size_kb / 1000, 4),
    }));

    const links: SimLink[] = relations.map(r => ({
      source: r.source, target: r.target,
      strength: r.strength, type: r.type,
    }));

    simRef.current = { nodes, links, alpha: 1 };

    const nodeMap = () => {
      const m = new Map<string, SimNode>();
      nodes.forEach(n => m.set(n.id, n));
      return m;
    };

    const tick = () => {
      const sim = simRef.current;
      if (!sim || sim.alpha < 0.001) return;

      const map = nodeMap();
      const alpha = sim.alpha;

      // Link force
      for (const link of sim.links) {
        const s = typeof link.source === 'string' ? map.get(link.source)! : link.source as SimNode;
        const t = typeof link.target === 'string' ? map.get(link.target)! : link.target as SimNode;
        if (!s || !t) continue;
        // Resolve source/target to objects after first tick
        link.source = s;
        link.target = t;
        const dx = (t.x - s.x) || 0.01;
        const dy = (t.y - s.y) || 0.01;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const targetDist = 150 - link.strength * 100;
        const force = (dist - targetDist) / dist * alpha * link.strength * 0.5;
        s.vx += dx * force; s.vy += dy * force;
        t.vx -= dx * force; t.vy -= dy * force;
      }

      // Many-body (repulsion)
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j];
          const dx = b.x - a.x || 0.01;
          const dy = b.y - a.y || 0.01;
          const dist2 = dx * dx + dy * dy || 1;
          const strength = (-200 - a.connections * 30) * alpha;
          const force = strength / dist2;
          a.vx -= dx * force; a.vy -= dy * force;
          b.vx += dx * force; b.vy += dy * force;
        }
      }

      // Center force
      const cx = width / 2, cy = height / 2;
      for (const n of nodes) {
        n.vx += (cx - n.x) * 0.02 * alpha;
        n.vy += (cy - n.y) * 0.02 * alpha;
      }

      // Integrate + decay
      for (const n of nodes) {
        n.vx *= 0.7; n.vy *= 0.7;
        n.x += n.vx; n.y += n.vy;
        // Clamp
        n.x = Math.max(20, Math.min(width - 20, n.x));
        n.y = Math.max(20, Math.min(height - 20, n.y));
      }

      sim.alpha *= 0.98;

      setState({
        nodePositions: nodes.map(n => ({ id: n.id, x: n.x, y: n.y })),
        linkPositions: sim.links.map(l => {
          const s = l.source as SimNode;
          const t = l.target as SimNode;
          return {
            sourceId: getId(l.source), targetId: getId(l.target),
            sx: s.x ?? 0, sy: s.y ?? 0,
            tx: t.x ?? 0, ty: t.y ?? 0,
            strength: l.strength, type: l.type,
          };
        }),
      });

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      simRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documents.length, relations.length, width, height]);

  return state;
}
