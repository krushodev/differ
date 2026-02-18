import { useMemo, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { FilePlus2, FileX2, FileEdit, FileSymlink, ArrowRight } from 'lucide-react';
import { ChangeType } from '@/core/types.ts';
import type { DiffResult } from '@/core/types.ts';
import { useProjectStore } from '@/store/useProjectStore.ts';
import { cn } from '@/lib/utils.ts';

function getIcon(type: string) {
  switch (type) {
    case ChangeType.Added:
      return <FilePlus2 className="w-4 h-4 text-emerald-400 shrink-0" />;
    case ChangeType.Deleted:
      return <FileX2 className="w-4 h-4 text-red-400 shrink-0" />;
    case ChangeType.Modified:
      return <FileEdit className="w-4 h-4 text-amber-400 shrink-0" />;
    case ChangeType.Moved:
    case ChangeType.MovedAndModified:
      return <FileSymlink className="w-4 h-4 text-blue-400 shrink-0" />;
    default:
      return null;
  }
}

function getBadgeColor(type: string) {
  switch (type) {
    case ChangeType.Added:
      return 'bg-emerald-500/15 text-emerald-400';
    case ChangeType.Deleted:
      return 'bg-red-500/15 text-red-400';
    case ChangeType.Modified:
      return 'bg-amber-500/15 text-amber-400';
    case ChangeType.Moved:
      return 'bg-blue-500/15 text-blue-400';
    case ChangeType.MovedAndModified:
      return 'bg-violet-500/15 text-violet-400';
    default:
      return 'bg-zinc-500/15 text-zinc-400';
  }
}

function formatLabel(type: string): string {
  switch (type) {
    case ChangeType.MovedAndModified:
      return 'Moved+Mod';
    default:
      return type.charAt(0).toUpperCase() + type.slice(1);
  }
}

export function ChangeList() {
  const { results, filterType, selectedResult, setSelectedResult } = useProjectStore();
  const parentRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    if (!filterType) return results;
    if (filterType === ChangeType.Moved) {
      return results.filter(
        (r: DiffResult) =>
          r.changeType === ChangeType.Moved || r.changeType === ChangeType.MovedAndModified,
      );
    }
    return results.filter((r: DiffResult) => r.changeType === filterType);
  }, [results, filterType]);

  const virtualizer = useVirtualizer({
    count: filtered.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 64,
    overscan: 10,
  });

  if (results.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-sm text-zinc-500">
        No results yet.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
          Changes ({filtered.length})
        </h3>
      </div>

      <div ref={parentRef} className="h-[calc(100vh-320px)] overflow-auto">
        <div
          style={{ height: `${virtualizer.getTotalSize()}px`, position: 'relative', width: '100%' }}
        >
          {virtualizer.getVirtualItems().map((virtualRow) => {
            const item = filtered[virtualRow.index];
            const isSelected = selectedResult === item;
            const displayPath = item.pathB ?? item.pathA ?? item.fileName;

            return (
              <div
                key={virtualRow.key}
                data-index={virtualRow.index}
                ref={virtualizer.measureElement}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                <button
                  onClick={() => setSelectedResult(item)}
                  className={cn(
                    'w-full text-left px-3 py-2.5 rounded-lg border transition-all flex items-start gap-2.5',
                    isSelected
                      ? 'bg-zinc-800 border-zinc-600'
                      : 'bg-zinc-900/30 border-transparent hover:bg-zinc-900/60 hover:border-zinc-800',
                  )}
                >
                  {getIcon(item.changeType)}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium truncate">{item.fileName}</span>
                      <span
                        className={cn(
                          'text-[10px] px-1.5 py-0.5 rounded font-medium shrink-0',
                          getBadgeColor(item.changeType),
                        )}
                      >
                        {formatLabel(item.changeType)}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 truncate mt-0.5">{displayPath}</p>
                    {item.changeType === ChangeType.Moved ||
                    item.changeType === ChangeType.MovedAndModified ? (
                      <div className="flex items-center gap-1 text-xs text-zinc-600 mt-0.5">
                        <span className="truncate max-w-[120px]">{item.pathA}</span>
                        <ArrowRight className="w-3 h-3 shrink-0" />
                        <span className="truncate max-w-[120px]">{item.pathB}</span>
                      </div>
                    ) : null}
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
