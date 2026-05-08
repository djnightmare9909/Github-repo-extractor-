/**
 * Helper functions for parsing URLs and processing file contents.
 */

import { GitTreeItem } from './github';

export const BINARY_EXTENSIONS = new Set([
  'png', 'jpg', 'jpeg', 'gif', 'ico', 'svg', 'bmp', 'webp',
  'mp4', 'mov', 'avi', 'mkv',
  'mp3', 'wav', 'ogg', 'flac',
  'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx',
  'zip', 'tar', 'gz', 'rar', '7z',
  'exe', 'dll', 'so', 'dylib',
  'ttf', 'otf', 'woff', 'woff2', 'eot',
  'class', 'jar', 'pyc', 'pyo',
  'db', 'sqlite', 'mdb',
  'DS_Store', 'lock', 'bin'
]);

export function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  const cleanUrl = url.trim().replace(/\/$/, '');
  const match = cleanUrl.match(/github\.com\/([^\/]+)\/([^\/]+?)(?:\.git)?(?:\/|$)/);
  if (!match) return null;
  return { owner: match[1], repo: match[2] };
}

export function isTextFile(path: string): boolean {
  const parts = path.split('/');
  const filename = parts[parts.length - 1];
  
  if (filename.startsWith('.')) {
    // Hidden files like .gitignore, .env are usually text
    // But check common binary patterns
    const hiddenExt = filename.split('.').pop()?.toLowerCase();
    if (hiddenExt && BINARY_EXTENSIONS.has(hiddenExt)) return false;
    return true;
  }

  const ext = filename.split('.').pop()?.toLowerCase();
  if (!ext) return true; // Files without extensions like README, Dockerfile are usually text
  return !BINARY_EXTENSIONS.has(ext);
}

export function chunkArray<T>(array: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
}

export function buildOutput(
  repoName: string,
  tree: GitTreeItem[],
  contents: Map<string, string>
): string {
  const lines: string[] = [];

  lines.push(`Repository: ${repoName}`);
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push('\n### REPOSITORY FILE TREE ###');
  lines.push('============================');

  const blobs = tree.filter(item => item.type === 'blob').sort((a, b) => a.path.localeCompare(b.path));
  
  blobs.forEach(item => {
    const icon = isTextFile(item.path) ? '📄' : '📦 (binary)';
    lines.push(`${icon} ${item.path}`);
  });

  lines.push('\n### FILE CONTENTS ###');
  lines.push('=====================');

  for (const item of blobs) {
    lines.push(`\n==== FILE: ${item.path} ====`);
    if (!isTextFile(item.path)) {
      lines.push('[Binary file content omitted]');
      continue;
    }
    
    const content = contents.get(item.path);
    if (content === undefined) {
      lines.push('[ERROR: Content not fetched]');
    } else {
      lines.push(content);
    }
    lines.push(`==== END OF FILE: ${item.path} ====`);
  }

  return lines.join('\n');
}

export function triggerDownload(text: string, filename: string) {
  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.id = 'download-trigger';
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
