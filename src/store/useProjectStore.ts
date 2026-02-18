import { create } from 'zustand';
import type { FileNode, DiffResult, AnalysisProgress } from '@/core/types.ts';

interface ProjectStore {
  projectA: { name: string; files: FileNode[] } | null;
  projectB: { name: string; files: FileNode[] } | null;
  results: DiffResult[];
  selectedResult: DiffResult | null;
  progress: AnalysisProgress | null;
  isProcessing: boolean;
  filterType: string | null;
  error: string | null;

  setProjectA: (name: string, files: FileNode[]) => void;
  setProjectB: (name: string, files: FileNode[]) => void;
  setResults: (results: DiffResult[]) => void;
  setSelectedResult: (result: DiffResult | null) => void;
  setProgress: (progress: AnalysisProgress | null) => void;
  setIsProcessing: (v: boolean) => void;
  setFilterType: (type: string | null) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useProjectStore = create<ProjectStore>(set => ({
  projectA: null,
  projectB: null,
  results: [],
  selectedResult: null,
  progress: null,
  isProcessing: false,
  filterType: null,
  error: null,

  setProjectA: (name, files) => set({ projectA: { name, files } }),
  setProjectB: (name, files) => set({ projectB: { name, files } }),
  setResults: results => set({ results }),
  setSelectedResult: result => set({ selectedResult: result }),
  setProgress: progress => set({ progress }),
  setIsProcessing: v => set({ isProcessing: v }),
  setFilterType: type => set({ filterType: type }),
  setError: error => set({ error }),
  reset: () =>
    set({
      projectA: null,
      projectB: null,
      results: [],
      selectedResult: null,
      progress: null,
      isProcessing: false,
      filterType: null,
      error: null
    })
}));
