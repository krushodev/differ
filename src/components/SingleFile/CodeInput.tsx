import { useCallback, useRef, useState } from 'react';
import { Upload } from 'lucide-react';
import { cn } from '@/lib/utils.ts';

interface CodeInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

export function CodeInput({ label, value, onChange }: CodeInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const lineCount = value ? value.split('\n').length : 1;

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) {
        file.text().then(onChange);
      }
    },
    [onChange],
  );

  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        file.text().then(onChange);
      }
    },
    [onChange],
  );

  return (
    <div className="flex-1 min-w-0 flex flex-col">
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/10">
        <span className="text-xs font-medium text-zinc-400">{label}</span>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1 text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <Upload className="w-3 h-3" />
          Upload
        </button>
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>
      <div
        className={cn(
          'flex flex-1 min-h-[300px] transition-colors',
          dragOver && 'bg-emerald-500/5',
        )}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <div className="select-none text-right pr-2 pt-2 text-zinc-600 text-xs font-mono leading-5 min-w-[40px] border-r border-zinc-800/50">
          {Array.from({ length: lineCount }, (_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Paste code here or drop a file..."
          spellCheck={false}
          className="flex-1 bg-transparent text-xs font-mono leading-5 p-2 resize-none outline-none placeholder:text-zinc-600 text-zinc-200 min-h-full"
        />
      </div>
    </div>
  );
}
