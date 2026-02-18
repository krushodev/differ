import type { FileNode } from './types.ts';

export interface MoveMatch {
  fileA: FileNode;
  fileB: FileNode;
  contentChanged: boolean;
}

export function detectMoves(
  onlyInA: FileNode[],
  onlyInB: FileNode[],
): MoveMatch[] {
  const moves: MoveMatch[] = [];
  const matchedA = new Set<string>();
  const matchedB = new Set<string>();

  for (const a of onlyInA) {
    for (const b of onlyInB) {
      if (matchedB.has(b.path)) continue;
      if (a.name === b.name && a.hash === b.hash && a.path !== b.path) {
        moves.push({ fileA: a, fileB: b, contentChanged: false });
        matchedA.add(a.path);
        matchedB.add(b.path);
        break;
      }
    }
  }

  for (const a of onlyInA) {
    if (matchedA.has(a.path)) continue;
    for (const b of onlyInB) {
      if (matchedB.has(b.path)) continue;
      if (a.name === b.name && a.hash !== b.hash && a.path !== b.path) {
        moves.push({ fileA: a, fileB: b, contentChanged: true });
        matchedA.add(a.path);
        matchedB.add(b.path);
        break;
      }
    }
  }

  return moves;
}
