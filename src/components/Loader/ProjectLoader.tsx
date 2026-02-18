import { useCallback, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { FolderOpen, Upload, CheckCircle2, Loader2 } from 'lucide-react';
import { useFileLoader } from '@/hooks/useFileLoader.ts';
import { useArchiveLoader } from '@/hooks/useArchiveLoader.ts';
import { useProjectStore } from '@/store/useProjectStore.ts';
import { cn } from '@/lib/utils.ts';

interface DropZoneProps {
  label: string;
  projectData: { name: string; files: { length: number }[] | { path: string }[] } | null;
  onPickDirectory: () => Promise<void>;
  onFileUpload: (file: File) => Promise<void>;
}

function DropZone({ label, projectData, onPickDirectory, onFileUpload }: DropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const withLoading = useCallback(async (fn: () => Promise<void>) => {
    setLoading(true);
    try {
      await fn();
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file && /\.(zip|war|jar)$/i.test(file.name)) {
        withLoading(() => onFileUpload(file));
      }
    },
    [onFileUpload, withLoading]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) withLoading(() => onFileUpload(file));
    },
    [onFileUpload, withLoading]
  );

  const fileCount = projectData ? (projectData.files as { path: string }[]).filter((f: { path: string }) => f.path).length : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'flex flex-col items-center justify-center gap-4 p-8 rounded-xl border-2 border-dashed transition-colors min-h-[220px]',
        loading
          ? 'border-zinc-500 bg-zinc-900/50'
          : projectData
            ? 'border-emerald-500/50 bg-emerald-500/5'
            : dragOver
              ? 'border-emerald-400 bg-emerald-500/5'
              : 'border-zinc-700 bg-zinc-900/50 hover:border-zinc-500'
      )}
      onDragOver={e => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
    >
      {loading ? (
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
          <p className="text-xs text-zinc-400">Reading files...</p>
        </div>
      ) : projectData ? (
        <>
          <CheckCircle2 className="w-8 h-8 text-emerald-400" />
          <p className="text-sm text-emerald-300 font-medium">{projectData.name}</p>
          <p className="text-xs text-zinc-500">
            {label} loaded — {fileCount} files
          </p>
          <button onClick={() => withLoading(onPickDirectory)} className="text-[11px] text-zinc-500 hover:text-zinc-300 underline underline-offset-2 transition-colors">
            Replace
          </button>
        </>
      ) : (
        <>
          <FolderOpen className="w-8 h-8 text-zinc-500" />
          <p className="text-sm font-medium text-zinc-300">{label}</p>
          <p className="text-xs text-zinc-500">Drop a .zip/.war/.jar or pick a folder</p>
          <div className="flex gap-2 mt-2">
            <button onClick={() => withLoading(onPickDirectory)} className="px-3 py-1.5 text-xs rounded-md bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 transition-colors">
              <FolderOpen className="w-3.5 h-3.5 inline mr-1.5" />
              Browse Folder
            </button>
            <button onClick={() => inputRef.current?.click()} className="px-3 py-1.5 text-xs rounded-md bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 transition-colors">
              <Upload className="w-3.5 h-3.5 inline mr-1.5" />
              Upload Archive
            </button>
          </div>
          <input ref={inputRef} type="file" accept=".zip,.war,.jar" onChange={handleFileChange} className="hidden" />
        </>
      )}
    </motion.div>
  );
}

interface ProjectLoaderProps {
  onAnalyze: () => void;
}

export function ProjectLoader({ onAnalyze }: ProjectLoaderProps) {
  const { pickDirectory } = useFileLoader();
  const { loadArchive } = useArchiveLoader();
  const { projectA, projectB, setProjectA, setProjectB, isProcessing } = useProjectStore();

  const handlePickA = useCallback(async () => {
    const result = await pickDirectory();
    if (result) setProjectA(result.name, result.files);
  }, [pickDirectory, setProjectA]);

  const handlePickB = useCallback(async () => {
    const result = await pickDirectory();
    if (result) setProjectB(result.name, result.files);
  }, [pickDirectory, setProjectB]);

  const handleArchiveA = useCallback(
    async (file: File) => {
      const result = await loadArchive(file);
      if (result) setProjectA(result.name, result.files);
    },
    [loadArchive, setProjectA]
  );

  const handleArchiveB = useCallback(
    async (file: File) => {
      const result = await loadArchive(file);
      if (result) setProjectB(result.name, result.files);
    },
    [loadArchive, setProjectB]
  );

  const canAnalyze = projectA && projectB && !isProcessing;

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Differ</h1>
        <p className="text-sm text-zinc-400">Compare two project structures to detect changes, moves, and modifications.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
        <DropZone label="Project A — Base" projectData={projectA} onPickDirectory={handlePickA} onFileUpload={handleArchiveA} />
        <DropZone label="Project B — Updated" projectData={projectB} onPickDirectory={handlePickB} onFileUpload={handleArchiveB} />
      </div>

      <div className="flex justify-center">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={!canAnalyze}
          onClick={onAnalyze}
          className={cn(
            'px-6 py-2.5 rounded-lg font-medium text-sm transition-all',
            canAnalyze ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/30' : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
          )}
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 inline mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            'Analyze Differences'
          )}
        </motion.button>
      </div>
    </div>
  );
}
