import { useMemo, useRef, useState, useCallback } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { motion } from 'framer-motion';
import type { LineDiff } from '@/core/types.ts';
import { ChangeType } from '@/core/types.ts';
import { useProjectStore } from '@/store/useProjectStore.ts';
import { DiffHeader } from './DiffHeader.tsx';
import { DiffMinimap } from './DiffMinimap.tsx';
import { cn } from '@/lib/utils.ts';
import type { DiffLine } from './diffUtils.ts';
import { buildSideBySideLines } from './diffUtils.ts';

function VirtualizedFileContent({ content, title, color }: { content: string; title: string; color: string }) {
  const lines = useMemo(() => content.split('\n'), [content]);
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: lines.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 20,
    overscan: 30
  });

  return (
    <div className="flex-1 min-w-0">
      <div className={cn('px-3 py-1.5 text-xs font-medium border-b border-zinc-800', color)}>{title}</div>
      <div ref={parentRef} className="overflow-auto max-h-[calc(100vh-380px)]">
        <div style={{ height: `${virtualizer.getTotalSize()}px`, position: 'relative', width: '100%' }}>
          {virtualizer.getVirtualItems().map(virtualRow => (
            <div
              key={virtualRow.index}
              className="flex items-start hover:bg-zinc-800/30 text-xs font-mono"
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: `${virtualRow.size}px`, transform: `translateY(${virtualRow.start}px)` }}
            >
              <span className="px-2 py-0.5 text-zinc-600 select-none text-right w-10 border-r border-zinc-800/50 shrink-0">{virtualRow.index + 1}</span>
              <span className="px-3 py-0.5 whitespace-pre-wrap break-all">{lines[virtualRow.index]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function VirtualizedDiffTable({ diffLines }: { diffLines: DiffLine[] }) {
  const parentRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);

  const virtualizer = useVirtualizer({
    count: diffLines.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 20,
    overscan: 30
  });

  const totalHeight = virtualizer.getTotalSize();
  const viewportHeight = parentRef.current?.clientHeight ?? 0;

  const handleScroll = useCallback(() => {
    if (parentRef.current) {
      setScrollTop(parentRef.current.scrollTop);
    }
  }, []);

  const handleMinimapSeek = useCallback(
    (ratio: number) => {
      if (parentRef.current) {
        parentRef.current.scrollTop = ratio * totalHeight;
      }
    },
    [totalHeight]
  );

  return (
    <div className="flex max-h-[calc(100vh-380px)]">
      <div ref={parentRef} className="overflow-auto flex-1 min-w-0" onScroll={handleScroll}>
        <div style={{ height: `${totalHeight}px`, position: 'relative', width: '100%' }}>
          {virtualizer.getVirtualItems().map(virtualRow => {
            const line = diffLines[virtualRow.index];
            return (
              <div
                key={virtualRow.index}
                className={cn('flex items-start border-b border-zinc-900 text-xs font-mono', line.type === 'add' && 'bg-emerald-500/8', line.type === 'remove' && 'bg-red-500/8')}
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: `${virtualRow.size}px`, transform: `translateY(${virtualRow.start}px)` }}
              >
                <span className="px-2 py-0.5 text-zinc-600 select-none text-right w-10 border-r border-zinc-800/50 shrink-0">{line.lineNumA ?? ''}</span>
                <span className={cn('px-3 py-0.5 whitespace-pre-wrap break-all w-[calc(50%-40px)] border-r border-zinc-800 shrink-0', line.type === 'remove' && 'bg-red-500/10 text-red-200')}>
                  {line.contentA}
                </span>
                <span className="px-2 py-0.5 text-zinc-600 select-none text-right w-10 border-r border-zinc-800/50 shrink-0">{line.lineNumB ?? ''}</span>
                <span className={cn('px-3 py-0.5 whitespace-pre-wrap break-all flex-1 min-w-0', line.type === 'add' && 'bg-emerald-500/10 text-emerald-200')}>{line.contentB}</span>
              </div>
            );
          })}
        </div>
      </div>
      <DiffMinimap diffLines={diffLines} scrollTop={scrollTop} viewportHeight={viewportHeight} totalHeight={totalHeight} onSeek={handleMinimapSeek} />
    </div>
  );
}

interface SideBySideDiffProps {
  lineDiffs?: LineDiff[];
  labelA?: string;
  labelB?: string;
  hideHeader?: boolean;
}

export function SideBySideDiff({ lineDiffs: externalDiffs, labelA = 'Project A (Base)', labelB = 'Project B (Updated)', hideHeader }: SideBySideDiffProps) {
  const { selectedResult, getFileContent } = useProjectStore();

  const activeDiffs = externalDiffs ?? selectedResult?.lineDiffs;
  const activeResult = externalDiffs ? null : selectedResult;

  const diffLines = useMemo(() => {
    if (!activeDiffs || activeDiffs.length === 0) return [];
    return buildSideBySideLines(activeDiffs);
  }, [activeDiffs]);

  if (!activeResult && !externalDiffs) {
    return <div className="flex items-center justify-center h-full text-sm text-zinc-500">Select a file from the change list to view its diff.</div>;
  }

  if (activeResult && (activeResult.changeType === ChangeType.Added || activeResult.changeType === ChangeType.Deleted)) {
    const isAdded = activeResult.changeType === ChangeType.Added;
    const filePath = isAdded ? activeResult.pathB : activeResult.pathA;
    const content = filePath ? getFileContent(filePath) : '';

    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border border-white/10 rounded-lg overflow-hidden ring-1 ring-white/5 shadow-xl shadow-black/20">
        {!hideHeader && activeResult && <DiffHeader result={activeResult} />}
        <VirtualizedFileContent
          content={content}
          title={isAdded ? 'New File (Project B)' : 'Deleted File (Project A)'}
          color={isAdded ? 'text-emerald-400 bg-emerald-500/5' : 'text-red-400 bg-red-500/5'}
        />
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border border-white/10 rounded-lg overflow-hidden ring-1 ring-white/5 shadow-xl shadow-black/20">
      {!hideHeader && activeResult && <DiffHeader result={activeResult} />}
      <div className="flex">
        <div className="flex-1 border-r border-zinc-800">
          <div className="px-3 py-1.5 text-xs font-medium text-zinc-400 bg-zinc-900/80 border-b border-zinc-800">{labelA}</div>
        </div>
        <div className="flex-1">
          <div className="px-3 py-1.5 text-xs font-medium text-zinc-400 bg-zinc-900/80 border-b border-zinc-800">{labelB}</div>
        </div>
      </div>
      <VirtualizedDiffTable diffLines={diffLines} />
    </motion.div>
  );
}
