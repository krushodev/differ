import { useLocation } from 'wouter';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, FolderTree, PackageOpen, List, Network } from 'lucide-react';
import { useState } from 'react';
import { SummaryCards } from '@/components/Dashboard/SummaryCards.tsx';
import { ChangeList } from '@/components/Dashboard/ChangeList.tsx';
import { SideBySideDiff } from '@/components/DiffViewer/SideBySideDiff.tsx';
import { FileTreePanel } from '@/components/FileTree/FileTreePanel.tsx';
import { GraphCanvas } from '@/components/GraphView/GraphCanvas.tsx';
import { useProjectStore } from '@/store/useProjectStore.ts';
import { cn } from '@/lib/utils.ts';

export function ResultsPage() {
  const [, navigate] = useLocation();
  const { results, projectA, projectB, projectAMeta, projectBMeta, reset } = useProjectStore();
  const [showTree, setShowTree] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'graph'>('list');

  const hasProjects = projectA || projectB || projectAMeta || projectBMeta;

  const handleBack = () => {
    reset();
    navigate('/');
  };

  if (!hasProjects) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)] gap-4">
        <PackageOpen className="w-12 h-12 text-zinc-600" />
        <p className="text-sm text-zinc-500">No projects loaded. Start a new comparison.</p>
        <button onClick={handleBack} className="px-4 py-2 text-sm rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 transition-colors">
          Go to Home
        </button>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <div className="flex items-center justify-between">
        <button onClick={handleBack} className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-200 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          New Comparison
        </button>
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-500">{results.length} changes found</span>
          <div className="flex items-center gap-0.5 bg-zinc-900 rounded-md border border-zinc-800 p-0.5">
            <button
              onClick={() => setViewMode('list')}
              className={cn('p-1.5 rounded transition-colors', viewMode === 'list' ? 'bg-zinc-800 text-zinc-200' : 'text-zinc-500 hover:text-zinc-300')}
              title="List view"
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('graph')}
              className={cn('p-1.5 rounded transition-colors', viewMode === 'graph' ? 'bg-zinc-800 text-zinc-200' : 'text-zinc-500 hover:text-zinc-300')}
              title="Graph view"
            >
              <Network className="w-3.5 h-3.5" />
            </button>
          </div>
          {viewMode === 'list' && (
            <button
              onClick={() => setShowTree(!showTree)}
              className={cn('p-1.5 rounded-md border transition-colors', showTree ? 'bg-zinc-800 border-zinc-600 text-zinc-200' : 'border-zinc-800 text-zinc-500 hover:text-zinc-300')}
              title="Toggle file tree"
            >
              <FolderTree className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <SummaryCards />

      {results.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-20 gap-3">
          <PackageOpen className="w-10 h-10 text-zinc-600" />
          <p className="text-sm text-zinc-400">Projects are identical — no differences found.</p>
        </motion.div>
      ) : viewMode === 'graph' ? (
        <GraphCanvas />
      ) : (
        <div className="flex flex-col lg:flex-row gap-4 items-start">
          <AnimatePresence>
            {showTree && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 260 }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                className="shrink-0 w-full lg:w-[260px] bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg p-3 overflow-hidden shadow-lg shadow-black/20 ring-1 ring-white/5"
              >
                <FileTreePanel />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="w-full lg:w-[320px] shrink-0">
            <ChangeList />
          </div>

          <div className="flex-1 min-w-0 w-full">
            <SideBySideDiff />
          </div>
        </div>
      )}
    </motion.div>
  );
}
