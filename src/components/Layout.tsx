import type { ReactNode } from 'react';
import { GitCompareArrows, FileCode2 } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils.ts';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="border-b border-white/10 bg-zinc-900/60 backdrop-blur-xl sticky top-0 z-50 shadow-lg shadow-black/20">
        <div className="max-w-[1600px] mx-auto px-6 h-14 flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <GitCompareArrows className="w-5 h-5 text-emerald-400" />
            <span className="font-semibold text-sm tracking-tight">Differ</span>
          </Link>
          <nav className="flex items-center gap-1 ml-2">
            <Link
              href="/"
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
                location === '/' ? 'bg-white/10 text-zinc-100' : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
              )}
            >
              <GitCompareArrows className="w-3.5 h-3.5" />
              Projects
            </Link>
            <Link
              href="/single"
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
                location === '/single' ? 'bg-white/10 text-zinc-100' : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
              )}
            >
              <FileCode2 className="w-3.5 h-3.5" />
              Single File
            </Link>
          </nav>
        </div>
      </header>
      <main className="max-w-[1600px] mx-auto px-6 py-6">{children}</main>
    </div>
  );
}
