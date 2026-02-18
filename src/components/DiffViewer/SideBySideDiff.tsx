import { useMemo } from 'react';
import { motion } from 'framer-motion';
import type { LineDiff } from '@/core/types.ts';
import { ChangeType } from '@/core/types.ts';
import { useProjectStore } from '@/store/useProjectStore.ts';
import { DiffHeader } from './DiffHeader.tsx';
import { cn } from '@/lib/utils.ts';

interface DiffLine {
  lineNumA: number | null;
  lineNumB: number | null;
  contentA: string;
  contentB: string;
  type: 'equal' | 'add' | 'remove' | 'modify';
}

function buildSideBySideLines(diffs: LineDiff[]): DiffLine[] {
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

function FileContentView({ content, title, color }: { content: string; title: string; color: string }) {
  const lines = content.split('\n');
  return (
    <div className="flex-1 min-w-0">
      <div className={cn('px-3 py-1.5 text-xs font-medium border-b border-zinc-800', color)}>{title}</div>
      <div className="overflow-auto max-h-[calc(100vh-380px)]">
        <table className="w-full text-xs font-mono">
          <tbody>
            {lines.map((line, i) => (
              <tr key={i} className="hover:bg-zinc-800/30">
                <td className="px-2 py-0.5 text-zinc-600 select-none text-right w-10 border-r border-zinc-800/50">{i + 1}</td>
                <td className="px-3 py-0.5 whitespace-pre-wrap break-all">{line}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function SideBySideDiff() {
  const { selectedResult, projectA, projectB } = useProjectStore();

  const diffLines = useMemo(() => {
    if (!selectedResult || selectedResult.lineDiffs.length === 0) return [];
    return buildSideBySideLines(selectedResult.lineDiffs);
  }, [selectedResult]);

  if (!selectedResult) {
    return <div className="flex items-center justify-center h-full text-sm text-zinc-500">Select a file from the change list to view its diff.</div>;
  }

  if (selectedResult.changeType === ChangeType.Added || selectedResult.changeType === ChangeType.Deleted) {
    const isAdded = selectedResult.changeType === ChangeType.Added;
    const filePath = isAdded ? selectedResult.pathB : selectedResult.pathA;
    const project = isAdded ? projectB : projectA;
    const file = project?.files.find(f => f.path === filePath);
    const content = file?.content ?? '';

    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border border-zinc-800 rounded-lg overflow-hidden">
        <DiffHeader result={selectedResult} />
        <FileContentView content={content} title={isAdded ? 'New File (Project B)' : 'Deleted File (Project A)'} color={isAdded ? 'text-emerald-400 bg-emerald-500/5' : 'text-red-400 bg-red-500/5'} />
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border border-zinc-800 rounded-lg overflow-hidden">
      <DiffHeader result={selectedResult} />
      <div className="flex">
        <div className="flex-1 border-r border-zinc-800">
          <div className="px-3 py-1.5 text-xs font-medium text-zinc-400 bg-zinc-900/80 border-b border-zinc-800">Project A (Base)</div>
        </div>
        <div className="flex-1">
          <div className="px-3 py-1.5 text-xs font-medium text-zinc-400 bg-zinc-900/80 border-b border-zinc-800">Project B (Updated)</div>
        </div>
      </div>
      <div className="overflow-auto max-h-[calc(100vh-380px)]">
        <table className="w-full text-xs font-mono">
          <tbody>
            {diffLines.map((line, i) => (
              <tr key={i} className={cn('border-b border-zinc-900', line.type === 'add' && 'bg-emerald-500/8', line.type === 'remove' && 'bg-red-500/8')}>
                <td className="px-2 py-0.5 text-zinc-600 select-none text-right w-10 border-r border-zinc-800/50">{line.lineNumA ?? ''}</td>
                <td className={cn('px-3 py-0.5 whitespace-pre-wrap break-all w-1/2 border-r border-zinc-800', line.type === 'remove' && 'bg-red-500/10 text-red-200')}>{line.contentA}</td>
                <td className="px-2 py-0.5 text-zinc-600 select-none text-right w-10 border-r border-zinc-800/50">{line.lineNumB ?? ''}</td>
                <td className={cn('px-3 py-0.5 whitespace-pre-wrap break-all w-1/2', line.type === 'add' && 'bg-emerald-500/10 text-emerald-200')}>{line.contentB}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
