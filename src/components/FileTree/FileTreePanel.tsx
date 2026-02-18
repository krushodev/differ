import { useMemo } from 'react';
import type { FileNode, DiffResult } from '@/core/types.ts';
import { useProjectStore } from '@/store/useProjectStore.ts';
import { FileTreeNode } from './FileTreeNode.tsx';
import type { TreeNode } from './FileTreeNode.tsx';

function buildTree(files: FileNode[], results: DiffResult[], side: 'A' | 'B'): TreeNode {
  const root: TreeNode = { name: 'root', path: '', isDirectory: true, children: [] };

  const changeMap = new Map<string, string>();
  for (const r of results) {
    if (side === 'A' && r.pathA) changeMap.set(r.pathA, r.changeType);
    if (side === 'B' && r.pathB) changeMap.set(r.pathB, r.changeType);
  }

  for (const file of files) {
    const parts = file.path.split('/');
    let current = root;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isLast = i === parts.length - 1;
      const partPath = parts.slice(0, i + 1).join('/');

      let child = current.children.find(c => c.name === part);
      if (!child) {
        child = {
          name: part,
          path: partPath,
          isDirectory: !isLast || file.isDirectory,
          children: [],
          changeType: isLast ? changeMap.get(file.path) : undefined
        };
        current.children.push(child);
      }
      current = child;
    }
  }

  return root;
}

export function FileTreePanel() {
  const { projectA, projectB, results, setSelectedResult } = useProjectStore();

  const treeA = useMemo(() => (projectA ? buildTree(projectA.files, results, 'A') : null), [projectA, results]);

  const treeB = useMemo(() => (projectB ? buildTree(projectB.files, results, 'B') : null), [projectB, results]);

  const handleSelect = (path: string) => {
    const match = results.find(r => r.pathA === path || r.pathB === path);
    if (match) setSelectedResult(match);
  };

  if (!treeA && !treeB) return null;

  return (
    <div className="space-y-4">
      {treeA && (
        <div>
          <h4 className="text-xs font-medium text-zinc-400 uppercase tracking-wider px-2 mb-1">{projectA?.name} (Base)</h4>
          <div className="max-h-[300px] overflow-auto">
            {treeA.children.map(node => (
              <FileTreeNode key={node.path} node={node} depth={0} onSelect={handleSelect} />
            ))}
          </div>
        </div>
      )}
      {treeB && (
        <div>
          <h4 className="text-xs font-medium text-zinc-400 uppercase tracking-wider px-2 mb-1">{projectB?.name} (Updated)</h4>
          <div className="max-h-[300px] overflow-auto">
            {treeB.children.map(node => (
              <FileTreeNode key={node.path} node={node} depth={0} onSelect={handleSelect} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
