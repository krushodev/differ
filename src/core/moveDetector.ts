import type { FileNode } from './types.ts';

export interface MoveMatch {
  fileA: FileNode;
  fileB: FileNode;
  contentChanged: boolean;
}

export function detectMoves(onlyInA: FileNode[], onlyInB: FileNode[]): MoveMatch[] {
  const moves: MoveMatch[] = [];
  const matchedA = new Set<string>();
  const matchedB = new Set<string>();

  const bByName = new Map<string, FileNode[]>();
  for (const b of onlyInB) {
    const arr = bByName.get(b.name);
    if (arr) {
      arr.push(b);
    } else {
      bByName.set(b.name, [b]);
    }
  }

  for (const a of onlyInA) {
    const candidates = bByName.get(a.name);
    if (!candidates) continue;
    for (const b of candidates) {
      if (matchedB.has(b.path)) continue;
      if (a.hash === b.hash && a.path !== b.path) {
        moves.push({ fileA: a, fileB: b, contentChanged: false });
        matchedA.add(a.path);
        matchedB.add(b.path);
        break;
      }
    }
  }

  for (const a of onlyInA) {
    if (matchedA.has(a.path)) continue;
    const candidates = bByName.get(a.name);
    if (!candidates) continue;
    for (const b of candidates) {
      if (matchedB.has(b.path)) continue;
      if (a.hash !== b.hash && a.path !== b.path) {
        moves.push({ fileA: a, fileB: b, contentChanged: true });
        matchedA.add(a.path);
        matchedB.add(b.path);
        break;
      }
    }
  }

  return moves;
}
