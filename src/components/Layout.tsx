import type { ReactNode } from 'react';
import { GitCompareArrows } from 'lucide-react';
import { Link } from 'wouter';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="border-b border-zinc-800 bg-zinc-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-6 h-14 flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <GitCompareArrows className="w-5 h-5 text-emerald-400" />
            <span className="font-semibold text-sm tracking-tight">Differ</span>
          </Link>
        </div>
      </header>
      <main className="max-w-[1600px] mx-auto px-6 py-6">{children}</main>
    </div>
  );
}
