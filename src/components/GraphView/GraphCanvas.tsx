import { useCallback, useMemo, useState } from 'react';
import { ReactFlow, Background, Controls, MiniMap, Panel, type NodeTypes, type NodeMouseHandler, useReactFlow } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Maximize2, Minimize2, ChevronsUpDown } from 'lucide-react';
import { useProjectStore } from '@/store/useProjectStore.ts';
import { useTrees, useGraphLayout, getChangeColor, collectDirIds, collectAllDirIds } from '@/hooks/useGraphLayout.ts';
import { GraphFileNode, GraphDirNode } from './FileNode.tsx';

const nodeTypes: NodeTypes = {
  fileNode: GraphFileNode,
  dirNode: GraphDirNode
};

function GraphToolbar({ setExpanded, trees, nodeCount }: { setExpanded: (s: Set<string>) => void; trees: NonNullable<ReturnType<typeof useTrees>>; nodeCount: number }) {
  const { fitView } = useReactFlow();

  const expandAll = useCallback(() => {
    const all = new Set<string>();
    for (const id of collectAllDirIds(trees.treeA, 'A')) all.add(id);
    for (const id of collectAllDirIds(trees.treeB, 'B')) all.add(id);
    setExpanded(all);
    setTimeout(() => fitView({ padding: 0.2, duration: 300 }), 50);
  }, [trees, setExpanded, fitView]);

  const collapseAll = useCallback(() => {
    // keep only roots expanded
    setExpanded(new Set(['A-root', 'B-root']));
    setTimeout(() => fitView({ padding: 0.2, duration: 300 }), 50);
  }, [setExpanded, fitView]);

  const expandToDepth = useCallback(
    (depth: number) => {
      const ids = new Set<string>();
      for (const id of collectDirIds(trees.treeA, 'A', depth)) ids.add(id);
      for (const id of collectDirIds(trees.treeB, 'B', depth)) ids.add(id);
      setExpanded(ids);
      setTimeout(() => fitView({ padding: 0.2, duration: 300 }), 50);
    },
    [trees, setExpanded, fitView]
  );

  return (
    <div className="flex items-center gap-2 bg-zinc-900/90 backdrop-blur-sm border border-zinc-700/60 rounded-lg px-3 py-1.5 shadow-lg">
      <button onClick={expandAll} className="flex items-center gap-1 text-[10px] text-zinc-300 hover:text-zinc-100 transition-colors" title="Expand all">
        <Maximize2 className="w-3 h-3" /> All
      </button>
      <button onClick={collapseAll} className="flex items-center gap-1 text-[10px] text-zinc-300 hover:text-zinc-100 transition-colors" title="Collapse all">
        <Minimize2 className="w-3 h-3" /> Root
      </button>
      <span className="w-px h-4 bg-zinc-700" />
      <span className="text-[10px] text-zinc-500 flex items-center gap-1">
        <ChevronsUpDown className="w-3 h-3" /> Depth:
      </span>
      {[1, 2, 3].map(d => (
        <button key={d} onClick={() => expandToDepth(d)} className="text-[10px] text-zinc-400 hover:text-zinc-100 bg-zinc-800 hover:bg-zinc-700 rounded px-1.5 py-0.5 transition-colors">
          {d}
        </button>
      ))}
      <span className="w-px h-4 bg-zinc-700" />
      <span className="text-[9px] text-zinc-500">{nodeCount} nodes</span>
    </div>
  );
}

export function GraphCanvas() {
  const { results, filterType, projectA, projectB, projectAMeta, projectBMeta, setSelectedResult } = useProjectStore();

  const filesA = useMemo(() => (projectA ?? projectAMeta)?.files ?? [], [projectA, projectAMeta]);
  const filesB = useMemo(() => (projectB ?? projectBMeta)?.files ?? [], [projectB, projectBMeta]);

  const trees = useTrees(results, filterType, filesA, filesB);

  // start with only roots expanded
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(['A-root', 'B-root']));

  const { nodes, edges } = useGraphLayout(trees, expanded, results, filterType);

  const handleNodeClick: NodeMouseHandler = useCallback(
    (_event, node) => {
      if (node.type === 'dirNode') {
        // toggle expand/collapse
        setExpanded(prev => {
          const next = new Set(prev);
          if (next.has(node.id)) next.delete(node.id);
          else next.add(node.id);
          return next;
        });
        return;
      }
      const path = node.data.path as string;
      const match = results.find(r => r.pathA === path || r.pathB === path);
      if (match) setSelectedResult(match);
    },
    [results, setSelectedResult]
  );

  const proOptions = useMemo(() => ({ hideAttribution: true }), []);

  if (!trees || nodes.length === 0) {
    return <div className="flex items-center justify-center h-[500px] text-sm text-zinc-500">No changes to visualize. Adjust filters or load projects.</div>;
  }

  return (
    <div className="h-[calc(100vh-320px)] min-h-[400px] rounded-lg overflow-hidden border border-white/10 ring-1 ring-white/5 shadow-xl shadow-black/20 bg-zinc-950">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodeClick={handleNodeClick}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        proOptions={proOptions}
        minZoom={0.1}
        maxZoom={2.5}
        defaultEdgeOptions={{ type: 'smoothstep' }}
      >
        <Background color="#27272a" gap={20} size={1} />
        <Controls className="!bg-zinc-900 !border-zinc-700 !rounded-lg !shadow-lg [&>button]:!bg-zinc-800 [&>button]:!border-zinc-700 [&>button]:!text-zinc-300 [&>button:hover]:!bg-zinc-700" />
        <MiniMap
          nodeColor={node => {
            if (node.type === 'dirNode') return '#3f3f46';
            return (node.data?.color as string) ?? '#71717a';
          }}
          maskColor="rgba(0, 0, 0, 0.7)"
          className="!bg-zinc-900 !border-zinc-700 !rounded-lg"
        />
        <Panel position="top-left" className="!m-3">
          <div className="flex flex-col gap-2">
            <GraphToolbar setExpanded={setExpanded} trees={trees} nodeCount={nodes.length} />
            <div className="flex flex-col gap-1.5 bg-zinc-900/90 backdrop-blur-sm border border-zinc-700/60 rounded-lg px-3 py-2 shadow-lg">
              <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Legend</p>
              <div className="flex flex-wrap gap-x-3 gap-y-1">
                {[
                  { label: 'Added', ct: 'added' },
                  { label: 'Modified', ct: 'modified' },
                  { label: 'Deleted', ct: 'deleted' },
                  { label: 'Moved', ct: 'moved' },
                  { label: 'Moved+Mod', ct: 'moved_modified' }
                ].map(({ label, ct }) => (
                  <span key={ct} className="flex items-center gap-1 text-[10px] text-zinc-300">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: getChangeColor(ct) }} />
                    {label}
                  </span>
                ))}
                <span className="flex items-center gap-1 text-[10px] text-zinc-400">
                  <span className="w-4 border-t-2 border-dashed border-zinc-500" />
                  Cross-tree link
                </span>
              </div>
              <p className="text-[9px] text-zinc-500 mt-0.5">Click a folder to expand/collapse. Click a file to view diff.</p>
            </div>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
}
