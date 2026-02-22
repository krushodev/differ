import type { LineDiff } from '@/core/types.ts';

export interface DiffLine {
  lineNumA: number | null;
  lineNumB: number | null;
  contentA: string;
  contentB: string;
  type: 'equal' | 'add' | 'remove' | 'modify';
}

export function buildSideBySideLines(diffs: LineDiff[]): DiffLine[] {
  const lines: DiffLine[] = [];
  let lineA = 1;
  let lineB = 1;

  for (const diff of diffs) {
    const parts = diff.value.split('\n');
    const segments = parts.length > 1 && parts[parts.length - 1] === '' ? parts.slice(0, -1) : parts;

    for (let i = 0; i < segments.length; i++) {
      const text = segments[i] + (i < parts.length - 1 ? '' : '');

      if (diff.type === 'equal') {
        lines.push({ lineNumA: lineA++, lineNumB: lineB++, contentA: text, contentB: text, type: 'equal' });
      } else if (diff.type === 'remove') {
        lines.push({ lineNumA: lineA++, lineNumB: null, contentA: text, contentB: '', type: 'remove' });
      } else if (diff.type === 'add') {
        lines.push({ lineNumA: null, lineNumB: lineB++, contentA: '', contentB: text, type: 'add' });
      }

      if (i < parts.length - 1 && diff.type !== 'equal') {
        // line continuation handled by loop
      }
    }
  }

  return lines;
}
