import { memo, useState } from 'react';
import { ChevronRight, Folder, File } from 'lucide-react';
import { cn } from '@/lib/utils.ts';

export interface TreeNode {
  name: string;
  path: string;
  isDirectory: boolean;
  children: TreeNode[];
  changeType?: string;
}

interface FileTreeNodeProps {
  node: TreeNode;
  depth: number;
  onSelect?: (path: string) => void;
}

function getColor(changeType?: string) {
  switch (changeType) {
    case 'added':
      return 'text-emerald-400';
    case 'deleted':
      return 'text-red-400';
    case 'modified':
      return 'text-amber-400';
    case 'moved':
    case 'moved_modified':
      return 'text-blue-400';
    default:
      return 'text-zinc-400';
  }
}

export const FileTreeNode = memo(function FileTreeNode({ node, depth, onSelect }: FileTreeNodeProps) {
  const [expanded, setExpanded] = useState(depth < 2);

  if (node.isDirectory) {
    return (
      <div>
        <button onClick={() => setExpanded(!expanded)} className="flex items-center gap-1 w-full px-2 py-0.5 hover:bg-zinc-800/50 rounded text-left" style={{ paddingLeft: `${depth * 12 + 4}px` }}>
          <ChevronRight className={cn('w-3.5 h-3.5 text-zinc-500 transition-transform shrink-0', expanded && 'rotate-90')} />
          <Folder className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
          <span className="text-xs text-zinc-300 truncate">{node.name}</span>
        </button>
        {expanded && node.children.map(child => <FileTreeNode key={child.path} node={child} depth={depth + 1} onSelect={onSelect} />)}
      </div>
    );
  }

  return (
    <button onClick={() => onSelect?.(node.path)} className="flex items-center gap-1 w-full px-2 py-0.5 hover:bg-zinc-800/50 rounded text-left" style={{ paddingLeft: `${depth * 12 + 4}px` }}>
      <span className="w-3.5" />
      <File className={cn('w-3.5 h-3.5 shrink-0', getColor(node.changeType))} />
      <span className={cn('text-xs truncate', getColor(node.changeType))}>{node.name}</span>
    </button>
  );
});
