import { create } from 'zustand';
import type { FileNode, FileNodeMeta, DiffResult, AnalysisProgress } from '@/core/types.ts';
import { ChangeType } from '@/core/types.ts';

interface ProjectStore {
  projectA: { name: string; files: FileNode[] } | null;
  projectB: { name: string; files: FileNode[] } | null;
  projectAMeta: { name: string; files: FileNodeMeta[] } | null;
  projectBMeta: { name: string; files: FileNodeMeta[] } | null;
  contentMap: Map<string, string>;
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
  releaseContent: () => void;
  getFileContent: (path: string) => string;
  reset: () => void;
}

export const useProjectStore = create<ProjectStore>((set, get) => ({
  projectA: null,
  projectB: null,
  projectAMeta: null,
  projectBMeta: null,
  contentMap: new Map(),
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

  releaseContent: () => {
    const { projectA, projectB, results } = get();
    if (!projectA || !projectB) return;

    const neededPaths = new Set<string>();
    for (const r of results) {
      if (r.changeType === ChangeType.Added && r.pathB) neededPaths.add(r.pathB);
      if (r.changeType === ChangeType.Deleted && r.pathA) neededPaths.add(r.pathA);
    }

    const contentMap = new Map<string, string>();
    for (const f of projectA.files) {
      if (neededPaths.has(f.path)) contentMap.set(f.path, f.content);
    }
    for (const f of projectB.files) {
      if (neededPaths.has(f.path)) contentMap.set(f.path, f.content);
    }

    const toMeta = (files: FileNode[]): FileNodeMeta[] => files.map(({ path, name, hash, size, isDirectory }) => ({ path, name, hash, size, isDirectory }));

    set({
      projectAMeta: { name: projectA.name, files: toMeta(projectA.files) },
      projectBMeta: { name: projectB.name, files: toMeta(projectB.files) },
      projectA: null,
      projectB: null,
      contentMap
    });
  },

  getFileContent: (path: string) => {
    const state = get();
    if (state.contentMap.has(path)) return state.contentMap.get(path)!;
    const fileA = state.projectA?.files.find(f => f.path === path);
    if (fileA) return fileA.content;
    const fileB = state.projectB?.files.find(f => f.path === path);
    if (fileB) return fileB.content;
    return '';
  },

  reset: () =>
    set({
      projectA: null,
      projectB: null,
      projectAMeta: null,
      projectBMeta: null,
      contentMap: new Map(),
      results: [],
      selectedResult: null,
      progress: null,
      isProcessing: false,
      filterType: null,
      error: null
    })
}));
