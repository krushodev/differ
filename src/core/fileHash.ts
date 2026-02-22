import xxhash from 'xxhash-wasm';

let hasherInstance: Awaited<ReturnType<typeof xxhash>> | null = null;

async function getHasher() {
  if (!hasherInstance) {
    hasherInstance = await xxhash();
  }
  return hasherInstance;
}

export async function hashContent(content: string): Promise<string> {
  try {
    const hasher = await getHasher();
    return hasher.h64ToString(content);
  } catch {
    const encoder = new TextEncoder();
    const data = encoder.encode(content);
    const buffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(buffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
}

export function hashContentSync(content: string): string {
  if (hasherInstance) {
    return hasherInstance.h64ToString(content);
  }
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0;
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
}
