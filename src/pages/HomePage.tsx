import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import { ProjectLoader } from '@/components/Loader/ProjectLoader.tsx';
import { useProjectStore } from '@/store/useProjectStore.ts';
import { useDiffWorker } from '@/hooks/useDiffWorker.ts';

export function HomePage() {
  const [, navigate] = useLocation();
  const { projectA, projectB, progress, isProcessing, error } = useProjectStore();
  const { analyze } = useDiffWorker();

  const handleAnalyze = async () => {
    if (!projectA || !projectB) return;
    await analyze(projectA.files, projectB.files);
    const { error: err } = useProjectStore.getState();
    if (!err) {
      navigate('/results');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)]">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="w-full max-w-3xl">
        <ProjectLoader onAnalyze={handleAnalyze} />

        {isProcessing && progress && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 text-center space-y-2">
            <div className="w-full max-w-md mx-auto bg-zinc-800 rounded-full h-2 overflow-hidden">
              <motion.div
                className="h-full bg-emerald-500 rounded-full"
                initial={{ width: '0%' }}
                animate={{
                  width: progress.total > 0 ? `${Math.round((progress.current / progress.total) * 100)}%` : '50%'
                }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <p className="text-xs text-zinc-500">
              {progress.phase} {progress.total > 0 && `(${progress.current}/${progress.total})`}
            </p>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 flex items-center gap-2 justify-center text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 max-w-md mx-auto"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <p className="text-sm">{error}</p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
