import { useMemo } from 'react';
import dagre from 'dagre';
import type { Node, Edge } from '@xyflow/react';
import type { DiffResult, FileNodeMeta } from '@/core/types.ts';
import { ChangeType } from '@/core/types.ts';

// ── Dimensions ──────────────────────────────────────────────
const DIR_NODE_W = 220;
const DIR_NODE_H = 52;
const FILE_NODE_W = 200;
const FILE_NODE_H = 36;
const TREE_GAP = 400; // horizontal gap between two trees

// ── Colors ──────────────────────────────────────────────────
export function getChangeColor(changeType: string): string {
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

// ── Change stats per directory ──────────────────────────────
export interface DirStats {
  added: number;
  deleted: number;
  modified: number;
  moved: number;
  total: number;
}

function emptyStats(): DirStats {
  return { added: 0, deleted: 0, modified: 0, moved: 0, total: 0 };
}

function addToStats(stats: DirStats, ct: string) {
  stats.total++;
  if (ct === ChangeType.Added) stats.added++;
  else if (ct === ChangeType.Deleted) stats.deleted++;
  else if (ct === ChangeType.Modified) stats.modified++;
  else if (ct === ChangeType.Moved || ct === ChangeType.MovedAndModified) stats.moved++;
}

// ── Internal tree structure ─────────────────────────────────
export interface TreeEntry {
  name: string;
  path: string;
  isDir: boolean;
  changeType?: string;
  children: Map<string, TreeEntry>;
  stats: DirStats;
  childDirCount: number;
  childFileCount: number;
}

function ensureDir(root: TreeEntry, dirPath: string): TreeEntry {
  if (dirPath === '') return root;
  const parts = dirPath.split('/');
  let current = root;
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (!current.children.has(part)) {
      current.children.set(part, {
        name: part,
        path: parts.slice(0, i + 1).join('/'),
        isDir: true,
        children: new Map(),
        stats: emptyStats(),
        childDirCount: 0,
        childFileCount: 0
      });
    }
    current = current.children.get(part)!;
  }
  return current;
}

function buildProjectTree(files: FileNodeMeta[], results: DiffResult[], side: 'A' | 'B'): TreeEntry {
  const root: TreeEntry = {
    name: side === 'A' ? 'Project A' : 'Project B',
    path: '',
    isDir: true,
    children: new Map(),
    stats: emptyStats(),
    childDirCount: 0,
    childFileCount: 0
  };

  const changeMap = new Map<string, string>();
  for (const r of results) {
    if (side === 'A' && r.pathA) changeMap.set(r.pathA, r.changeType);
    if (side === 'B' && r.pathB) changeMap.set(r.pathB, r.changeType);
  }

  for (const file of files) {
    const ct = changeMap.get(file.path);
    if (!ct) continue;

    const dirPath = file.path.includes('/') ? file.path.substring(0, file.path.lastIndexOf('/')) : '';
    const dir = ensureDir(root, dirPath);
    dir.children.set(file.name, {
      name: file.name,
      path: file.path,
      isDir: false,
      changeType: ct,
      children: new Map(),
      stats: emptyStats(),
      childDirCount: 0,
      childFileCount: 0
    });
  }

  function propagate(entry: TreeEntry): DirStats {
    const stats = emptyStats();
    let dirs = 0;
    let fileCount = 0;
    for (const child of entry.children.values()) {
      if (child.isDir) {
        dirs++;
        const childStats = propagate(child);
        stats.added += childStats.added;
        stats.deleted += childStats.deleted;
        stats.modified += childStats.modified;
        stats.moved += childStats.moved;
        stats.total += childStats.total;
      } else {
        fileCount++;
        if (child.changeType) addToStats(stats, child.changeType);
      }
    }
    entry.stats = stats;
    entry.childDirCount = dirs;
    entry.childFileCount = fileCount;
    return stats;
  }
  propagate(root);

  return root;
}

// ── Collect all directory IDs up to a depth ─────────────────
export function collectDirIds(tree: TreeEntry, side: 'A' | 'B', maxDepth: number): Set<string> {
  const ids = new Set<string>();
  function walk(entry: TreeEntry, depth: number) {
    if (!entry.isDir) return;
    const id = `${side}-${entry.path || 'root'}`;
    if (depth < maxDepth) {
      ids.add(id);
    }
    for (const child of entry.children.values()) {
      walk(child, depth + 1);
    }
  }
  walk(tree, 0);
  return ids;
}

// ── Collect ALL dir IDs (for expand-all) ────────────────────
export function collectAllDirIds(tree: TreeEntry, side: 'A' | 'B'): Set<string> {
  const ids = new Set<string>();
  function walk(entry: TreeEntry) {
    if (!entry.isDir) return;
    ids.add(`${side}-${entry.path || 'root'}`);
    for (const child of entry.children.values()) walk(child);
  }
  walk(tree);
  return ids;
}

// ── Flatten only visible nodes ──────────────────────────────
function flattenVisible(entry: TreeEntry, side: 'A' | 'B', expanded: Set<string>, nodes: Node[], edges: Edge[], g: dagre.graphlib.Graph, parentId: string | null) {
  const id = `${side}-${entry.path || 'root'}`;
  const isExpanded = expanded.has(id);
  const hiddenCount = isExpanded ? 0 : entry.stats.total;

  if (entry.isDir) {
    nodes.push({
      id,
      type: 'dirNode',
      position: { x: 0, y: 0 },
      data: {
        label: entry.name,
        path: entry.path,
        side,
        stats: entry.stats,
        isRoot: entry.path === '',
        isExpanded,
        hiddenCount,
        childDirCount: entry.childDirCount,
        childFileCount: entry.childFileCount
      }
    });
    g.setNode(id, { width: DIR_NODE_W, height: DIR_NODE_H });
  } else {
    nodes.push({
      id,
      type: 'fileNode',
      position: { x: 0, y: 0 },
      data: {
        label: entry.name,
        path: entry.path,
        side,
        changeType: entry.changeType ?? '',
        color: getChangeColor(entry.changeType ?? '')
      }
    });
    g.setNode(id, { width: FILE_NODE_W, height: FILE_NODE_H });
  }

  if (parentId) {
    edges.push({
      id: `hier-${parentId}-${id}`,
      source: parentId,
      target: id,
      type: 'smoothstep',
      style: { stroke: '#3f3f46', strokeWidth: 1.5 },
      animated: false
    });
    g.setEdge(parentId, id);
  }

  // only recurse into children if this directory is expanded
  if (entry.isDir && isExpanded) {
    const sorted = [...entry.children.values()].sort((a, b) => {
      if (a.isDir !== b.isDir) return a.isDir ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
    for (const child of sorted) {
      flattenVisible(child, side, expanded, nodes, edges, g, id);
    }
  }
}

// ── Main hook ───────────────────────────────────────────────
export interface GraphTrees {
  treeA: TreeEntry;
  treeB: TreeEntry;
}

export function useTrees(results: DiffResult[], filterType: string | null, filesA: FileNodeMeta[], filesB: FileNodeMeta[]): GraphTrees | null {
  return useMemo(() => {
    if (results.length === 0 || (filesA.length === 0 && filesB.length === 0)) return null;

    const filtered = filterType
      ? results.filter(r => {
          if (filterType === ChangeType.Moved) return r.changeType === ChangeType.Moved || r.changeType === ChangeType.MovedAndModified;
          return r.changeType === filterType;
        })
      : results;

    return {
      treeA: buildProjectTree(filesA, filtered, 'A'),
      treeB: buildProjectTree(filesB, filtered, 'B')
    };
  }, [results, filterType, filesA, filesB]);
}

export function useGraphLayout(trees: GraphTrees | null, expanded: Set<string>, results: DiffResult[], filterType: string | null) {
  return useMemo(() => {
    if (!trees) return { nodes: [], edges: [] };

    const filtered = filterType
      ? results.filter(r => {
          if (filterType === ChangeType.Moved) return r.changeType === ChangeType.Moved || r.changeType === ChangeType.MovedAndModified;
          return r.changeType === filterType;
        })
      : results;

    // flatten visible nodes per side
    const nodesA: Node[] = [];
    const edgesA: Edge[] = [];
    const gA = new dagre.graphlib.Graph();
    gA.setDefaultEdgeLabel(() => ({}));
    gA.setGraph({ rankdir: 'TB', nodesep: 16, ranksep: 50, marginx: 20, marginy: 20 });
    flattenVisible(trees.treeA, 'A', expanded, nodesA, edgesA, gA, null);
    dagre.layout(gA);

    const nodesB: Node[] = [];
    const edgesB: Edge[] = [];
    const gB = new dagre.graphlib.Graph();
    gB.setDefaultEdgeLabel(() => ({}));
    gB.setGraph({ rankdir: 'TB', nodesep: 16, ranksep: 50, marginx: 20, marginy: 20 });
    flattenVisible(trees.treeB, 'B', expanded, nodesB, edgesB, gB, null);
    dagre.layout(gB);

    // position tree A left, tree B right
    let maxXA = 0;
    for (const node of nodesA) {
      const pos = gA.node(node.id);
      if (pos) {
        const w = node.type === 'dirNode' ? DIR_NODE_W : FILE_NODE_W;
        const h = node.type === 'dirNode' ? DIR_NODE_H : FILE_NODE_H;
        node.position = { x: pos.x - w / 2, y: pos.y - h / 2 };
        maxXA = Math.max(maxXA, pos.x + w / 2);
      }
    }

    const offsetX = maxXA + TREE_GAP;
    for (const node of nodesB) {
      const pos = gB.node(node.id);
      if (pos) {
        const w = node.type === 'dirNode' ? DIR_NODE_W : FILE_NODE_W;
        const h = node.type === 'dirNode' ? DIR_NODE_H : FILE_NODE_H;
        node.position = { x: offsetX + pos.x - w / 2, y: pos.y - h / 2 };
      }
    }

    // cross-tree edges (only if both endpoints are visible)
    const visibleA = new Set(nodesA.map(n => n.id));
    const visibleB = new Set(nodesB.map(n => n.id));
    const crossEdges: Edge[] = [];

    for (const r of filtered) {
      if (!r.pathA || !r.pathB) continue;
      const isMoveOrMod = r.changeType === ChangeType.Modified || r.changeType === ChangeType.Moved || r.changeType === ChangeType.MovedAndModified;
      if (!isMoveOrMod) continue;

      const srcId = `A-${r.pathA}`;
      const tgtId = `B-${r.pathB}`;
      if (!visibleA.has(srcId) || !visibleB.has(tgtId)) continue;

      const isMove = r.changeType === ChangeType.Moved || r.changeType === ChangeType.MovedAndModified;

      crossEdges.push({
        id: `cross-${r.pathA}-${r.pathB}`,
        source: srcId,
        target: tgtId,
        type: 'smoothstep',
        animated: isMove,
        style: { stroke: getEdgeColor(r.changeType), strokeWidth: 2, strokeDasharray: isMove ? undefined : '6 3' },
        label: r.changeType === ChangeType.MovedAndModified ? 'moved+mod' : r.changeType === ChangeType.Moved ? 'moved' : 'modified',
        labelStyle: { fill: '#a1a1aa', fontSize: 10, fontWeight: 500 },
        labelBgStyle: { fill: '#18181b', fillOpacity: 0.9 },
        labelBgPadding: [6, 3] as [number, number]
      });
    }

    return {
      nodes: [...nodesA, ...nodesB],
      edges: [...edgesA, ...edgesB, ...crossEdges]
    };
  }, [trees, expanded, results, filterType]);
}
