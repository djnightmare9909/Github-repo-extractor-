import { useState, useCallback } from 'react';
import { 
  fetchRepoInfo, 
  fetchRecursiveTree, 
  fetchBlobContent, 
  GitTreeItem 
} from '../utils/github';
import { 
  parseGitHubUrl, 
  isTextFile, 
  chunkArray, 
  buildOutput, 
  triggerDownload 
} from '../utils/helpers';

export type DownloadState = 'idle' | 'fetching_meta' | 'fetching_tree' | 'fetching_blobs' | 'assembling' | 'ready' | 'error';

export interface Progress {
  fetched: number;
  total: number;
}

export function useRepoDownloader() {
  const [status, setStatus] = useState<DownloadState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<Progress>({ fetched: 0, total: 0 });
  const [output, setOutput] = useState<string | null>(null);
  const [repoName, setRepoName] = useState<string>('');

  const start = useCallback(async (url: string, token: string) => {
    setStatus('fetching_meta');
    setError(null);
    setProgress({ fetched: 0, total: 0 });
    setOutput(null);

    const parsed = parseGitHubUrl(url);
    if (!parsed) {
      setError('Invalid GitHub URL. Please use format: https://github.com/owner/repo');
      setStatus('error');
      return;
    }

    try {
      // 1. Fetch Repo Info
      const info = await fetchRepoInfo(parsed.owner, parsed.repo, token);
      setRepoName(`${info.owner}/${info.repo}`);
      
      // 2. Fetch Tree
      setStatus('fetching_tree');
      const tree = await fetchRecursiveTree(info.owner, info.repo, info.defaultBranch, token);
      
      const textFiles = tree.filter(item => item.type === 'blob' && isTextFile(item.path));
      setProgress({ fetched: 0, total: textFiles.length });
      
      // 3. Fetch Blobs in batches to stay within rate limits and avoid timeout
      setStatus('fetching_blobs');
      const contents = new Map<string, string>();
      const batches = chunkArray(textFiles, 5); // 5 concurrent requests at a time
      
      let fetchedCount = 0;
      for (const batch of batches) {
        await Promise.all(
          batch.map(async (item) => {
            try {
              const text = await fetchBlobContent(info.owner, info.repo, item.sha, token);
              contents.set(item.path, text);
            } catch (err) {
              console.error(`Failed to fetch ${item.path}:`, err);
              contents.set(item.path, '[Error fetching file content]');
            } finally {
              fetchedCount++;
              setProgress(prev => ({ ...prev, fetched: fetchedCount }));
            }
          })
        );
        // Small pause to be nice to the API
        await new Promise(r => setTimeout(r, 100));
      }

      // 4. Assemble
      setStatus('assembling');
      const finalOutput = buildOutput(`${info.owner}/${info.repo}`, tree, contents);
      setOutput(finalOutput);
      setStatus('ready');

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An unexpected error occurred');
      setStatus('error');
    }
  }, []);

  const download = useCallback(() => {
    if (output && repoName) {
      const filename = `${repoName.replace('/', '-')}-digest.txt`;
      triggerDownload(output, filename);
    }
  }, [output, repoName]);

  const reset = useCallback(() => {
    setStatus('idle');
    setError(null);
    setProgress({ fetched: 0, total: 0 });
    setOutput(null);
  }, []);

  return {
    status,
    error,
    progress,
    output,
    repoName,
    start,
    download,
    reset
  };
}
