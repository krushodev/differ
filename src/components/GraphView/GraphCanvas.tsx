import { useCallback, useMemo } from 'react';
import { ReactFlow, Background, Controls, MiniMap, type NodeTypes, type NodeMouseHandler } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useProjectStore } from '@/store/useProjectStore.ts';
import { useGraphLayout } from '@/hooks/useGraphLayout.ts';
import { GraphFileNode } from './FileNode.tsx';

const nodeTypes: NodeTypes = {
  graphFile: GraphFileNode,
};

export function GraphCanvas() {
  const { results, filterType, setSelectedResult } = useProjectStore();
  const { nodes, edges } = useGraphLayout(results, filterType);

  const handleNodeClick: NodeMouseHandler = useCallback(
    (_event, node) => {
      const path = node.data.path as string;
      const match = results.find((r) => r.pathA === path || r.pathB === path);
      if (match) setSelectedResult(match);
    },
    [results, setSelectedResult],
  );

  const proOptions = useMemo(() => ({ hideAttribution: true }), []);

  if (nodes.length === 0) {
    return (
      <div className="flex items-center justify-center h-[500px] text-sm text-zinc-500">
        No changes to visualize. Adjust filters or load projects.
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-320px)] min-h-[400px] rounded-lg overflow-hidden border border-white/10 ring-1 ring-white/5 shadow-xl shadow-black/20 bg-zinc-950">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodeClick={handleNodeClick}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        proOptions={proOptions}
        minZoom={0.2}
        maxZoom={2}
        defaultEdgeOptions={{ type: 'smoothstep' }}
      >
        <Background color="#27272a" gap={20} size={1} />
        <Controls
          className="!bg-zinc-900 !border-zinc-700 !rounded-lg !shadow-lg [&>button]:!bg-zinc-800 [&>button]:!border-zinc-700 [&>button]:!text-zinc-300 [&>button:hover]:!bg-zinc-700"
        />
        <MiniMap
          nodeColor={(node) => (node.data?.color as string) ?? '#71717a'}
          maskColor="rgba(0, 0, 0, 0.7)"
          className="!bg-zinc-900 !border-zinc-700 !rounded-lg"
        />
      </ReactFlow>
    </div>
  );
}
