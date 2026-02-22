import { useMemo, useRef, useCallback } from 'react';
import type { DiffLine } from './diffUtils.ts';
import { cn } from '@/lib/utils.ts';

interface DiffMinimapProps {
  diffLines: DiffLine[];
  scrollTop: number;
  viewportHeight: number;
  totalHeight: number;
  onSeek: (ratio: number) => void;
}

interface MinimapBlock {
  startRatio: number;
  endRatio: number;
  type: 'add' | 'remove' | 'equal' | 'modify';
}

function buildBlocks(diffLines: DiffLine[]): MinimapBlock[] {
  if (diffLines.length === 0) return [];

  const blocks: MinimapBlock[] = [];
  let currentType = diffLines[0].type;
  let start = 0;

  for (let i = 1; i <= diffLines.length; i++) {
    const type = i < diffLines.length ? diffLines[i].type : null;
    if (type !== currentType) {
      blocks.push({
        startRatio: start / diffLines.length,
        endRatio: i / diffLines.length,
        type: currentType,
      });
      if (type !== null) {
        currentType = type;
        start = i;
      }
    }
  }

  return blocks;
}

function getBlockColor(type: string): string {
  switch (type) {
    case 'add':
      return 'bg-emerald-500/60';
    case 'remove':
      return 'bg-red-500/60';
    case 'modify':
      return 'bg-amber-500/60';
    default:
      return 'bg-zinc-700/30';
  }
}

export function DiffMinimap({ diffLines, scrollTop, viewportHeight, totalHeight, onSeek }: DiffMinimapProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const blocks = useMemo(() => buildBlocks(diffLines), [diffLines]);

  const viewportRatio = totalHeight > 0 ? viewportHeight / totalHeight : 1;
  const scrollRatio = totalHeight > 0 ? scrollTop / totalHeight : 0;

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const y = e.clientY - rect.top;
      const ratio = y / rect.height;
      onSeek(Math.max(0, Math.min(1, ratio)));
    },
    [onSeek],
  );

  if (diffLines.length === 0) return null;

  return (
    <div
      ref={containerRef}
      className="w-10 shrink-0 relative cursor-pointer bg-zinc-900/50 border-l border-zinc-800/50"
      onClick={handleClick}
    >
      {blocks.map((block, i) =>
        block.type === 'equal' ? null : (
          <div
            key={i}
            className={cn('absolute left-1 right-1 rounded-sm min-h-[2px]', getBlockColor(block.type))}
            style={{
              top: `${block.startRatio * 100}%`,
              height: `${Math.max(0.5, (block.endRatio - block.startRatio) * 100)}%`,
            }}
          />
        ),
      )}
      <div
        className="absolute left-0 right-0 border border-white/20 bg-white/5 rounded-sm pointer-events-none transition-transform duration-75"
        style={{
          top: `${scrollRatio * 100}%`,
          height: `${Math.max(5, viewportRatio * 100)}%`,
        }}
      />
    </div>
  );
}
