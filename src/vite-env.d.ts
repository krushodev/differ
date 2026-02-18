/// <reference types="vite/client" />

interface FileSystemDirectoryHandle {
  entries(): AsyncIterableIterator<[string, FileSystemDirectoryHandle | FileSystemFileHandle]>;
  values(): AsyncIterableIterator<FileSystemDirectoryHandle | FileSystemFileHandle>;
  keys(): AsyncIterableIterator<string>;
  readonly name: string;
  readonly kind: 'directory';
}

interface FileSystemFileHandle {
  getFile(): Promise<File>;
  readonly name: string;
  readonly kind: 'file';
}

interface Window {
  showDirectoryPicker(): Promise<FileSystemDirectoryHandle>;
}
