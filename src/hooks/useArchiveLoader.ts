import { useCallback } from 'react';
import JSZip from 'jszip';
import { shouldExclude } from '@/core/filters.ts';
import { hashContent } from '@/core/fileHash.ts';
import type { FileNode } from '@/core/types.ts';

export function useArchiveLoader() {
  const loadArchive = useCallback(async (file: File): Promise<{ name: string; files: FileNode[] } | null> => {
    try {
      const zip = await JSZip.loadAsync(file);
      const nodes: FileNode[] = [];

      const entries = Object.entries(zip.files);
      for (const [path, zipEntry] of entries) {
        if (shouldExclude(path)) continue;

        const cleanPath = path.replace(/\/$/, '');
        if (!cleanPath) continue;

        const name = cleanPath.split('/').pop() ?? cleanPath;

        if (zipEntry.dir) {
          nodes.push({
            path: cleanPath,
            name,
            content: '',
            hash: '',
            size: 0,
            isDirectory: true,
          });
        } else {
          const content = await zipEntry.async('string');
          const hash = await hashContent(content);
          nodes.push({
            path: cleanPath,
            name,
            content,
            hash,
            size: content.length,
            isDirectory: false,
          });
        }
      }

      const archiveName = file.name.replace(/\.(zip|war|jar)$/i, '');
      return { name: archiveName, files: nodes };
    } catch {
      return null;
    }
  }, []);

  return { loadArchive };
}
