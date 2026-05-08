/**
 * GitHub API Interaction Utilities
 */

export interface GitTreeItem {
  path: string;
  mode: string;
  type: 'blob' | 'tree';
  sha: string;
  size?: number;
}

export interface RepoInfo {
  owner: string;
  repo: string;
  defaultBranch: string;
}

const getHeaders = (token?: string) => {
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github.v3+json',
  };
  if (token && token.trim()) {
    headers['Authorization'] = `token ${token.trim()}`;
  }
  return headers;
};

export async function fetchRepoInfo(owner: string, repo: string, token?: string): Promise<RepoInfo> {
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
    headers: getHeaders(token),
  });
  
  if (!res.ok) {
    if (res.status === 404) throw new Error('Repository not found. Is it private?');
    if (res.status === 403) throw new Error('GitHub API rate limit exceeded. Provide a token for higher limits.');
    throw new Error(`Failed to fetch repo: ${res.statusText}`);
  }
  
  const data = await res.json();
  return {
    owner: data.owner.login,
    repo: data.name,
    defaultBranch: data.default_branch,
  };
}

export async function fetchRecursiveTree(owner: string, repo: string, branch: string, token?: string): Promise<GitTreeItem[]> {
  // 1. Get branch ref to get latest commit SHA
  const refRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/ref/heads/${branch}`, {
    headers: getHeaders(token),
  });
  if (!refRes.ok) throw new Error(`Failed to fetch branch ref: ${refRes.statusText}`);
  const refData = await refRes.json();
  const commitSha = refData.object.sha;

  // 2. Get commit to get tree SHA
  const commitRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/commits/${commitSha}`, {
    headers: getHeaders(token),
  });
  if (!commitRes.ok) throw new Error(`Failed to fetch commit: ${commitRes.statusText}`);
  const commitData = await commitRes.json();
  const treeSha = commitData.tree.sha;

  // 3. Get recursive tree
  const treeRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/${treeSha}?recursive=1`, {
    headers: getHeaders(token),
  });
  if (!treeRes.ok) throw new Error(`Failed to fetch tree: ${treeRes.statusText}`);
  const treeData = await treeRes.json();
  
  if (treeData.truncated) {
    console.warn('Tree truncated by GitHub API. Some files might be missing.');
  }

  return treeData.tree as GitTreeItem[];
}

export async function fetchBlobContent(owner: string, repo: string, sha: string, token?: string): Promise<string> {
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/blobs/${sha}`, {
    headers: getHeaders(token),
  });
  
  if (!res.ok) throw new Error(`Failed to fetch blob: ${res.statusText}`);
  const data = await res.json();
  
  // Decoding base64 content
  try {
    return atob(data.content.replace(/\s/g, ''));
  } catch (e) {
    return '[Error decoding file content - possibly binary or non-UTF8]';
  }
}
