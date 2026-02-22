import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { FilePlus2, FileX2, FileEdit, FileSymlink, File } from 'lucide-react';
import { ChangeType } from '@/core/types.ts';

interface FileNodeData {
  label: string;
  changeType: string;
  path: string;
  side: 'A' | 'B' | 'both';
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

function getSideLabel(side: string): string {
  switch (side) {
    case 'A':
      return 'Base';
    case 'B':
      return 'Updated';
    default:
      return '';
  }
}

export const GraphFileNode = memo(function GraphFileNode({ data }: { data: FileNodeData }) {
  return (
    <>
      <Handle type="target" position={Position.Left} className="!bg-zinc-600 !w-2 !h-2 !border-zinc-800" />
      <div
        className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-zinc-900/90 backdrop-blur-sm shadow-lg min-w-[140px] max-w-[200px] transition-all hover:shadow-xl"
        style={{ borderColor: `${data.color}40`, color: data.color }}
      >
        {getIcon(data.changeType)}
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium truncate text-zinc-200">{data.label}</p>
          <p className="text-[10px] truncate text-zinc-500">
            {data.side !== 'both' ? `${getSideLabel(data.side)} · ` : ''}{data.path}
          </p>
        </div>
      </div>
      <Handle type="source" position={Position.Right} className="!bg-zinc-600 !w-2 !h-2 !border-zinc-800" />
    </>
  );
});
