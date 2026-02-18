import DiffMatchPatch from 'diff-match-patch';
import type { LineDiff } from './types.ts';

const dmp = new DiffMatchPatch();

function normalizeWhitespace(text: string): string {
  return text
    .split('\n')
    .map((line) => line.replace(/\s+$/g, '').replace(/\t/g, '  '))
    .join('\n');
}

export function computeLineDiffs(contentA: string, contentB: string): LineDiff[] {
  const normA = normalizeWhitespace(contentA);
  const normB = normalizeWhitespace(contentB);

  const diffs = dmp.diff_main(normA, normB);
  dmp.diff_cleanupSemantic(diffs);

  const lineDiffs: LineDiff[] = [];

  for (const [op, text] of diffs) {
    let type: LineDiff['type'];
    if (op === DiffMatchPatch.DIFF_INSERT) type = 'add';
    else if (op === DiffMatchPatch.DIFF_DELETE) type = 'remove';
    else type = 'equal';

    lineDiffs.push({ type, value: text });
  }

  return lineDiffs;
}

export function hasContentChanged(contentA: string, contentB: string): boolean {
  const normA = normalizeWhitespace(contentA);
  const normB = normalizeWhitespace(contentB);
  return normA !== normB;
}
