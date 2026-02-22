import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { FilePlus2, FileX2, FileEdit, FileSymlink, File, Folder, FolderOpen, ChevronRight, ChevronDown } from 'lucide-react';
import { ChangeType } from '@/core/types.ts';
import type { DirStats } from '@/hooks/useGraphLayout.ts';
import { cn } from '@/lib/utils.ts';

// ── File node ──────────────────────────────────────────────

interface FileNodeData {
  label: string;
  changeType: string;
  path: string;
  side: 'A' | 'B';
  color: string;
}

function getIcon(changeType: string) {
  const cls = 'w-3.5 h-3.5 shrink-0';
  switch (changeType) {
    case ChangeType.Added:
      return <FilePlus2 className={cls} />;
    case ChangeType.Deleted:
      return <FileX2 className={cls} />;
    case ChangeType.Modified:
      return <FileEdit className={cls} />;
    case ChangeType.Moved:
    case ChangeType.MovedAndModified:
      return <FileSymlink className={cls} />;
    default:
      return <File className={cls} />;
  }
}

function getChangeLabel(ct: string): string {
  switch (ct) {
    case ChangeType.Added:
      return 'added';
    case ChangeType.Deleted:
      return 'deleted';
    case ChangeType.Modified:
      return 'modified';
    case ChangeType.Moved:
      return 'moved';
    case ChangeType.MovedAndModified:
      return 'moved+mod';
    default:
      return '';
  }
}

export const GraphFileNode = memo(function GraphFileNode({ data }: { data: FileNodeData }) {
  return (
    <>
      <Handle type="target" position={Position.Top} className="!bg-zinc-600 !w-2 !h-2 !border-zinc-800" />
      <div
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border bg-zinc-900/90 backdrop-blur-sm shadow-md cursor-pointer transition-all hover:shadow-lg hover:brightness-110 min-w-[160px] max-w-[200px]"
        style={{ borderColor: `${data.color}50` }}
      >
        <span style={{ color: data.color }}>{getIcon(data.changeType)}</span>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-medium truncate text-zinc-200">{data.label}</p>
          <p className="text-[9px] truncate" style={{ color: `${data.color}cc` }}>
            {getChangeLabel(data.changeType)}
          </p>
        </div>
      </div>
      <Handle type="source" position={Position.Right} className="!bg-zinc-600 !w-2 !h-2 !border-zinc-800" />
      <Handle type="target" id="cross-in" position={Position.Left} className="!bg-zinc-600 !w-2 !h-2 !border-zinc-800" />
    </>
  );
});

// ── Directory node ─────────────────────────────────────────

interface DirNodeData {
  label: string;
  path: string;
  side: 'A' | 'B';
  stats: DirStats;
  isRoot: boolean;
  isExpanded: boolean;
  hiddenCount: number;
  childDirCount: number;
  childFileCount: number;
}

function StatBadge({ count, color, label }: { count: number; color: string; label: string }) {
  if (count === 0) return null;
  return (
    <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold rounded px-1 py-[1px]" style={{ backgroundColor: `${color}20`, color }} title={`${count} ${label}`}>
      {label === 'added' ? '+' : label === 'deleted' ? '-' : label === 'moved' ? '→' : '~'}
      {count}
    </span>
  );
}

export const GraphDirNode = memo(function GraphDirNode({ data }: { data: DirNodeData }) {
  const FolderIcon = data.isExpanded ? FolderOpen : Folder;
  const ChevronIcon = data.isExpanded ? ChevronDown : ChevronRight;

  return (
    <>
      <Handle type="target" position={Position.Top} className="!bg-zinc-600 !w-2 !h-2 !border-zinc-800" />
      <div
        className={cn(
          'rounded-lg border backdrop-blur-sm shadow-md px-3 py-2 min-w-[180px] max-w-[240px] cursor-pointer transition-all hover:brightness-110',
          data.isRoot ? 'bg-zinc-800/90 border-zinc-600' : 'bg-zinc-900/80 border-zinc-700/60'
        )}
      >
        <div className="flex items-center gap-1.5">
          <ChevronIcon className="w-3 h-3 shrink-0 text-zinc-500" />
          <FolderIcon className={cn('w-4 h-4 shrink-0', data.isRoot ? 'text-zinc-300' : 'text-zinc-500')} />
          <p className={cn('text-[11px] font-semibold truncate', data.isRoot ? 'text-zinc-100' : 'text-zinc-300')}>{data.label}</p>
          <span className="ml-auto text-[9px] text-zinc-500 shrink-0">{data.stats.total}</span>
        </div>
        {data.stats.total > 0 && (
          <div className="flex items-center gap-1 mt-1 flex-wrap">
            <StatBadge count={data.stats.added} color="#10b981" label="added" />
            <StatBadge count={data.stats.modified} color="#f59e0b" label="modified" />
            <StatBadge count={data.stats.deleted} color="#ef4444" label="deleted" />
            <StatBadge count={data.stats.moved} color="#3b82f6" label="moved" />
          </div>
        )}
        {!data.isExpanded && data.hiddenCount > 0 && (
          <p className="text-[9px] text-zinc-500 mt-1">
            {data.childDirCount > 0 && `${data.childDirCount} dirs`}
            {data.childDirCount > 0 && data.childFileCount > 0 && ', '}
            {data.childFileCount > 0 && `${data.childFileCount} files`} — click to expand
          </p>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-zinc-600 !w-2 !h-2 !border-zinc-800" />
    </>
  );
});
