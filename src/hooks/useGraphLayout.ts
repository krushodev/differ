import { useMemo } from 'react';
import dagre from 'dagre';
import type { Node, Edge } from '@xyflow/react';
import type { DiffResult } from '@/core/types.ts';
import { ChangeType } from '@/core/types.ts';

const NODE_WIDTH = 180;
const NODE_HEIGHT = 40;

function getNodeColor(changeType: string): string {
  switch (changeType) {
    case ChangeType.Added:
      return '#10b981';
    case ChangeType.Deleted:
      return '#ef4444';
    case ChangeType.Modified:
      return '#f59e0b';
    case ChangeType.Moved:
      return '#3b82f6';
    case ChangeType.MovedAndModified:
      return '#8b5cf6';
    default:
      return '#71717a';
  }
}

function getEdgeColor(changeType: string): string {
  switch (changeType) {
    case ChangeType.Moved:
      return '#3b82f6';
    case ChangeType.MovedAndModified:
      return '#8b5cf6';
    case ChangeType.Modified:
      return '#f59e0b';
    default:
      return '#52525b';
  }
}

export interface GraphFileNode extends Node {
  data: {
    label: string;
    changeType: string;
    path: string;
    side: 'A' | 'B' | 'both';
    color: string;
  };
}

export function useGraphLayout(results: DiffResult[], filterType: string | null) {
  return useMemo(() => {
    const filtered = filterType
      ? results.filter((r) => {
          if (filterType === ChangeType.Moved) {
            return r.changeType === ChangeType.Moved || r.changeType === ChangeType.MovedAndModified;
          }
          return r.changeType === filterType;
        })
      : results;

    const nodes: GraphFileNode[] = [];
    const edges: Edge[] = [];
    const g = new dagre.graphlib.Graph();
    g.setDefaultEdgeLabel(() => ({}));
    g.setGraph({ rankdir: 'LR', nodesep: 30, ranksep: 120, marginx: 40, marginy: 40 });

    for (const r of filtered) {
      const hasBothPaths = r.pathA && r.pathB && r.pathA !== r.pathB;

      if (r.changeType === ChangeType.Added && r.pathB) {
        const id = `b-${r.pathB}`;
        nodes.push({
          id,
          type: 'graphFile',
          position: { x: 0, y: 0 },
          data: { label: r.fileName, changeType: r.changeType, path: r.pathB, side: 'B', color: getNodeColor(r.changeType) },
        });
        g.setNode(id, { width: NODE_WIDTH, height: NODE_HEIGHT });
      } else if (r.changeType === ChangeType.Deleted && r.pathA) {
        const id = `a-${r.pathA}`;
        nodes.push({
          id,
          type: 'graphFile',
          position: { x: 0, y: 0 },
          data: { label: r.fileName, changeType: r.changeType, path: r.pathA, side: 'A', color: getNodeColor(r.changeType) },
        });
        g.setNode(id, { width: NODE_WIDTH, height: NODE_HEIGHT });
      } else if (hasBothPaths) {
        const idA = `a-${r.pathA}`;
        const idB = `b-${r.pathB}`;
        nodes.push({
          id: idA,
          type: 'graphFile',
          position: { x: 0, y: 0 },
          data: { label: r.fileName, changeType: r.changeType, path: r.pathA!, side: 'A', color: getNodeColor(r.changeType) },
        });
        nodes.push({
          id: idB,
          type: 'graphFile',
          position: { x: 0, y: 0 },
          data: { label: r.fileName, changeType: r.changeType, path: r.pathB!, side: 'B', color: getNodeColor(r.changeType) },
        });
        g.setNode(idA, { width: NODE_WIDTH, height: NODE_HEIGHT });
        g.setNode(idB, { width: NODE_WIDTH, height: NODE_HEIGHT });
        edges.push({
          id: `e-${r.pathA}-${r.pathB}`,
          source: idA,
          target: idB,
          type: 'smoothstep',
          animated: r.changeType === ChangeType.Moved || r.changeType === ChangeType.MovedAndModified,
          style: { stroke: getEdgeColor(r.changeType), strokeWidth: 2 },
          label: r.changeType === ChangeType.MovedAndModified ? 'moved+mod' : r.changeType === ChangeType.Moved ? 'moved' : 'modified',
          labelStyle: { fill: '#a1a1aa', fontSize: 10 },
          labelBgStyle: { fill: '#18181b', fillOpacity: 0.8 },
          labelBgPadding: [4, 2] as [number, number],
        });
        g.setEdge(idA, idB);
      } else if (r.pathA) {
        const id = `a-${r.pathA}`;
        nodes.push({
          id,
          type: 'graphFile',
          position: { x: 0, y: 0 },
          data: { label: r.fileName, changeType: r.changeType, path: r.pathA, side: 'both', color: getNodeColor(r.changeType) },
        });
        g.setNode(id, { width: NODE_WIDTH, height: NODE_HEIGHT });
      }
    }

    dagre.layout(g);

    for (const node of nodes) {
      const pos = g.node(node.id);
      if (pos) {
        node.position = { x: pos.x - NODE_WIDTH / 2, y: pos.y - NODE_HEIGHT / 2 };
      }
    }

    return { nodes, edges };
  }, [results, filterType]);
}
