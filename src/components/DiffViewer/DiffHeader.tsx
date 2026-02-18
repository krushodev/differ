import { memo } from 'react';
import { FileEdit, FilePlus2, FileX2, FileSymlink, X } from 'lucide-react';
import { ChangeType } from '@/core/types.ts';
import type { DiffResult } from '@/core/types.ts';
import { useProjectStore } from '@/store/useProjectStore.ts';

function getIcon(type: string) {
  switch (type) {
    case ChangeType.Added:
      return <FilePlus2 className="w-4 h-4 text-emerald-400" />;
    case ChangeType.Deleted:
      return <FileX2 className="w-4 h-4 text-red-400" />;
    case ChangeType.Modified:
      return <FileEdit className="w-4 h-4 text-amber-400" />;
    default:
      return <FileSymlink className="w-4 h-4 text-blue-400" />;
  }
}

interface DiffHeaderProps {
  result: DiffResult;
}

export const DiffHeader = memo(function DiffHeader({ result }: DiffHeaderProps) {
  const { setSelectedResult } = useProjectStore();

  return (
    <div className="flex items-center justify-between px-4 py-2 bg-zinc-900 border-b border-zinc-800 rounded-t-lg">
      <div className="flex items-center gap-2 min-w-0">
        {getIcon(result.changeType)}
        <span className="text-sm font-medium truncate">{result.fileName}</span>
        <span className="text-xs text-zinc-500 truncate">{result.pathA && result.pathB ? `${result.pathA} → ${result.pathB}` : (result.pathA ?? result.pathB)}</span>
      </div>
      <button onClick={() => setSelectedResult(null)} className="p-1 rounded hover:bg-zinc-800 transition-colors">
        <X className="w-4 h-4 text-zinc-400" />
      </button>
    </div>
  );
});
