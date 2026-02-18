export const ChangeType = {
  Added: 'added',
  Deleted: 'deleted',
  Modified: 'modified',
  Moved: 'moved',
  MovedAndModified: 'moved_modified',
  Unchanged: 'unchanged'
} as const;

export type ChangeType = (typeof ChangeType)[keyof typeof ChangeType];

export interface FileNode {
  path: string;
  name: string;
  content: string;
  hash: string;
  size: number;
  isDirectory: boolean;
}

export interface LineDiff {
  type: 'add' | 'remove' | 'equal';
  value: string;
}

export interface DiffResult {
  changeType: ChangeType;
  pathA?: string;
  pathB?: string;
  fileName: string;
  lineDiffs: LineDiff[];
  changeCount: number;
}

export interface ProjectData {
  name: string;
  files: FileNode[];
}

export interface AnalysisProgress {
  phase: string;
  current: number;
  total: number;
}

export type WorkerRequest = {
  type: 'analyze';
  projectA: FileNode[];
  projectB: FileNode[];
};

export type WorkerResponse = { type: 'progress'; data: AnalysisProgress } | { type: 'result'; data: DiffResult[] } | { type: 'error'; message: string };
