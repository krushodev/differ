import { useCallback } from 'react';
import { shouldExclude } from '@/core/filters.ts';
import { hashContent } from '@/core/fileHash.ts';
import type { FileNode } from '@/core/types.ts';

async function readDirectoryRecursive(
  dirHandle: FileSystemDirectoryHandle,
  basePath: string = '',
): Promise<FileNode[]> {
  const nodes: FileNode[] = [];

  for await (const [name, handle] of dirHandle.entries()) {
    const fullPath = basePath ? `${basePath}/${name}` : name;

    if (shouldExclude(fullPath)) continue;

    if (handle.kind === 'directory') {
      nodes.push({
        path: fullPath,
        name,
        content: '',
        hash: '',
        size: 0,
        isDirectory: true,
      });
      const children = await readDirectoryRecursive(
        handle as FileSystemDirectoryHandle,
        fullPath,
      );
      nodes.push(...children);
    } else {
      const file = await (handle as FileSystemFileHandle).getFile();
      const content = await file.text();
      const hash = await hashContent(content);
      nodes.push({
        path: fullPath,
        name,
        content,
        hash,
        size: file.size,
        isDirectory: false,
      });
    }
  }

  return nodes;
}

export function useFileLoader() {
  const pickDirectory = useCallback(async (): Promise<{ name: string; files: FileNode[] } | null> => {
    try {
      const dirHandle = await window.showDirectoryPicker();
      const files = await readDirectoryRecursive(dirHandle);
      return { name: dirHandle.name, files };
    } catch {
      return null;
    }
  }, []);

  return { pickDirectory };
}
