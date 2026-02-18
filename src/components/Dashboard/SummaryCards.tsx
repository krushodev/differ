import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { FilePlus2, FileX2, FileEdit, FileSymlink } from 'lucide-react';
import { ChangeType } from '@/core/types.ts';
import type { DiffResult } from '@/core/types.ts';
import { useProjectStore } from '@/store/useProjectStore.ts';
import { cn } from '@/lib/utils.ts';

interface CardData {
  label: string;
  count: number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  filterType: string;
}

export function SummaryCards() {
  const { results, filterType, setFilterType } = useProjectStore();

  const cards = useMemo((): CardData[] => {
    const count = (types: string[]) =>
      results.filter((r: DiffResult) => types.includes(r.changeType)).length;

    return [
      {
        label: 'Added',
        count: count([ChangeType.Added]),
        icon: <FilePlus2 className="w-5 h-5" />,
        color: 'text-emerald-400',
        bgColor: 'bg-emerald-500/10 border-emerald-500/20',
        filterType: ChangeType.Added,
      },
      {
        label: 'Modified',
        count: count([ChangeType.Modified]),
        icon: <FileEdit className="w-5 h-5" />,
        color: 'text-amber-400',
        bgColor: 'bg-amber-500/10 border-amber-500/20',
        filterType: ChangeType.Modified,
      },
      {
        label: 'Deleted',
        count: count([ChangeType.Deleted]),
        icon: <FileX2 className="w-5 h-5" />,
        color: 'text-red-400',
        bgColor: 'bg-red-500/10 border-red-500/20',
        filterType: ChangeType.Deleted,
      },
      {
        label: 'Moved',
        count: count([ChangeType.Moved, ChangeType.MovedAndModified]),
        icon: <FileSymlink className="w-5 h-5" />,
        color: 'text-blue-400',
        bgColor: 'bg-blue-500/10 border-blue-500/20',
        filterType: ChangeType.Moved,
      },
    ];
  }, [results]);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map((card, i) => (
        <motion.button
          key={card.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          onClick={() => setFilterType(filterType === card.filterType ? null : card.filterType)}
          className={cn(
            'flex items-center gap-3 p-4 rounded-lg border transition-all text-left',
            filterType === card.filterType
              ? card.bgColor
              : 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700',
          )}
        >
          <div className={card.color}>{card.icon}</div>
          <div>
            <p className="text-2xl font-bold tabular-nums">{card.count}</p>
            <p className="text-xs text-zinc-400">{card.label}</p>
          </div>
        </motion.button>
      ))}
    </div>
  );
}
