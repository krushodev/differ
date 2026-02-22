import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, GitCompareArrows, Eraser } from 'lucide-react';
import { useLocation } from 'wouter';
import { CodeInput } from '@/components/SingleFile/CodeInput.tsx';
import { SideBySideDiff } from '@/components/DiffViewer/SideBySideDiff.tsx';
import { computeLineDiffs } from '@/core/diffEngine.ts';
import type { LineDiff } from '@/core/types.ts';
import { cn } from '@/lib/utils.ts';

export function SingleFilePage() {
  const [, navigate] = useLocation();
  const [contentA, setContentA] = useState('');
  const [contentB, setContentB] = useState('');
  const [diffs, setDiffs] = useState<LineDiff[] | null>(null);

  const canCompare = contentA.length > 0 && contentB.length > 0;

  const handleCompare = () => {
    if (!canCompare) return;
    const result = computeLineDiffs(contentA, contentB);
    setDiffs(result);
  };

  const handleClear = () => {
    setContentA('');
    setContentB('');
    setDiffs(null);
  };

  const stats = useMemo(() => {
    if (!diffs) return null;
    const adds = diffs.filter((d) => d.type === 'add').reduce((s, d) => s + d.value.split('\n').length - 1, 0);
    const removes = diffs.filter((d) => d.type === 'remove').reduce((s, d) => s + d.value.split('\n').length - 1, 0);
    const isIdentical = diffs.every((d) => d.type === 'equal');
    return { adds, removes, isIdentical };
  }, [diffs]);

  return (
    <div className="flex flex-col gap-4 min-h-[calc(100vh-120px)]">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Projects
        </button>
        <h2 className="text-sm font-medium text-zinc-300">Single File Compare</h2>
        <button
          onClick={handleClear}
          className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <Eraser className="w-3.5 h-3.5" />
          Clear
        </button>
      </div>

      {!diffs ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-4 flex-1"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg overflow-hidden shadow-lg shadow-black/20 ring-1 ring-white/5 flex flex-col">
              <CodeInput label="File A — Original" value={contentA} onChange={setContentA} />
            </div>
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg overflow-hidden shadow-lg shadow-black/20 ring-1 ring-white/5 flex flex-col">
              <CodeInput label="File B — Modified" value={contentB} onChange={setContentB} />
            </div>
          </div>

          <div className="flex justify-center">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={!canCompare}
              onClick={handleCompare}
              className={cn(
                'px-6 py-2.5 rounded-lg font-medium text-sm transition-all',
                canCompare
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/30'
                  : 'bg-zinc-800 text-zinc-500 cursor-not-allowed',
              )}
            >
              <GitCompareArrows className="w-4 h-4 inline mr-2" />
              Compare Files
            </motion.button>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-4 flex-1"
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => setDiffs(null)}
              className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Edit inputs
            </button>
            {stats && !stats.isIdentical && (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-emerald-400">+{stats.adds} added</span>
                <span className="text-red-400">-{stats.removes} removed</span>
              </div>
            )}
            {stats?.isIdentical && (
              <span className="text-xs text-zinc-500">Files are identical</span>
            )}
          </div>

          <SideBySideDiff
            lineDiffs={diffs}
            labelA="File A — Original"
            labelB="File B — Modified"
            hideHeader
          />
        </motion.div>
      )}
    </div>
  );
}
