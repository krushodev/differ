const DEFAULT_EXCLUSIONS = [
  'node_modules',
  '.git',
  'dist',
  'target',
  '.bin',
  '.venv',
  '.DS_Store',
  'Thumbs.db',
];

export function shouldExclude(path: string): boolean {
  const segments = path.split(/[/\\]/);
  return segments.some((seg) => DEFAULT_EXCLUSIONS.includes(seg));
}
