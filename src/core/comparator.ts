import type { FileNode, DiffResult, AnalysisProgress } from './types.ts';
import { ChangeType } from './types.ts';
import { detectMoves } from './moveDetector.ts';
import { computeLineDiffs, hasContentChanged } from './diffEngine.ts';

type ProgressCallback = (progress: AnalysisProgress) => void;

export function compareProjects(
  filesA: FileNode[],
  filesB: FileNode[],
  onProgress?: ProgressCallback,
): DiffResult[] {
  const results: DiffResult[] = [];

  const mapA = new Map<string, FileNode>();
  const mapB = new Map<string, FileNode>();

  for (const f of filesA) if (!f.isDirectory) mapA.set(f.path, f);
  for (const f of filesB) if (!f.isDirectory) mapB.set(f.path, f);

  onProgress?.({ phase: 'Detecting changes', current: 0, total: mapA.size + mapB.size });

  const onlyInA: FileNode[] = [];
  const onlyInB: FileNode[] = [];
  let processed = 0;

  for (const [path, fileA] of mapA) {
    const fileB = mapB.get(path);
    if (fileB) {
      if (hasContentChanged(fileA.content, fileB.content)) {
        const lineDiffs = computeLineDiffs(fileA.content, fileB.content);
        const changeCount = lineDiffs.filter((d) => d.type !== 'equal').reduce((s, d) => s + d.value.length, 0);
        results.push({
          changeType: ChangeType.Modified,
          pathA: fileA.path,
          pathB: fileB.path,
          fileName: fileA.name,
          lineDiffs,
          changeCount,
        });
      }
    } else {
      onlyInA.push(fileA);
    }
    processed++;
    if (processed % 50 === 0) {
      onProgress?.({ phase: 'Comparing files', current: processed, total: mapA.size + mapB.size });
    }
  }

  for (const [path, fileB] of mapB) {
    if (!mapA.has(path)) {
      onlyInB.push(fileB);
    }
  }

  onProgress?.({ phase: 'Detecting moved files', current: 0, total: onlyInA.length });

  const moves = detectMoves(onlyInA, onlyInB);
  const movedPathsA = new Set(moves.map((m) => m.fileA.path));
  const movedPathsB = new Set(moves.map((m) => m.fileB.path));

  for (const move of moves) {
    const lineDiffs = move.contentChanged
      ? computeLineDiffs(move.fileA.content, move.fileB.content)
      : [];
    const changeCount = lineDiffs.filter((d) => d.type !== 'equal').reduce((s, d) => s + d.value.length, 0);

    results.push({
      changeType: move.contentChanged ? ChangeType.MovedAndModified : ChangeType.Moved,
      pathA: move.fileA.path,
      pathB: move.fileB.path,
      fileName: move.fileA.name,
      lineDiffs,
      changeCount,
    });
  }

  for (const file of onlyInA) {
    if (!movedPathsA.has(file.path)) {
      results.push({
        changeType: ChangeType.Deleted,
        pathA: file.path,
        fileName: file.name,
        lineDiffs: [],
        changeCount: file.content.length,
      });
    }
  }

  for (const file of onlyInB) {
    if (!movedPathsB.has(file.path)) {
      results.push({
        changeType: ChangeType.Added,
        pathB: file.path,
        fileName: file.name,
        lineDiffs: [],
        changeCount: file.content.length,
      });
    }
  }

  results.sort((a, b) => b.changeCount - a.changeCount);

  onProgress?.({ phase: 'Done', current: 1, total: 1 });

  return results;
}
