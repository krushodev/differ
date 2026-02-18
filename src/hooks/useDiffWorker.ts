import { useCallback, useRef } from 'react';
import { useProjectStore } from '@/store/useProjectStore.ts';
import type { FileNode, WorkerResponse } from '@/core/types.ts';

export function useDiffWorker() {
  const workerRef = useRef<Worker | null>(null);
  const { setResults, setProgress, setIsProcessing, setError } = useProjectStore();

  const analyze = useCallback(
    (filesA: FileNode[], filesB: FileNode[]): Promise<void> => {
      return new Promise(resolve => {
        if (workerRef.current) {
          workerRef.current.terminate();
        }

        setIsProcessing(true);
        setError(null);
        setProgress({ phase: 'Starting...', current: 0, total: 0 });

        const worker = new Worker(new URL('../workers/diff.worker.ts', import.meta.url), { type: 'module' });

        workerRef.current = worker;

        worker.onmessage = (e: MessageEvent<WorkerResponse>) => {
          const msg = e.data;
          switch (msg.type) {
            case 'progress':
              setProgress(msg.data);
              break;
            case 'result':
              setResults(msg.data);
              setIsProcessing(false);
              setProgress(null);
              worker.terminate();
              workerRef.current = null;
              resolve();
              break;
            case 'error':
              setError(msg.message);
              setIsProcessing(false);
              setProgress(null);
              worker.terminate();
              workerRef.current = null;
              resolve();
              break;
          }
        };

        worker.onerror = e => {
          setError(e.message || 'Worker failed unexpectedly');
          setIsProcessing(false);
          setProgress(null);
          worker.terminate();
          workerRef.current = null;
          resolve();
        };

        worker.postMessage({ type: 'analyze', projectA: filesA, projectB: filesB });
      });
    },
    [setResults, setProgress, setIsProcessing, setError]
  );

  return { analyze };
}
