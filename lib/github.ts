interface GitHubFile {
  path: string;
  content: string;
}

export async function fetchGitHubRepo(url: string): Promise<GitHubFile[]> {
  // Parse GitHub URL
  const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
  if (!match) {
    throw new Error('Invalid GitHub URL format. Expected: https://github.com/username/repo');
  }
  
  const [, owner, repo] = match;
  const cleanRepo = repo.replace(/\.git$/, ''); // Remove .git if present
  
  try {
    // Fetch repository tree
    const treeResponse = await fetch(
      `https://api.github.com/repos/${owner}/${cleanRepo}/git/trees/main?recursive=1`,
      {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          ...(process.env.GITHUB_TOKEN && {
            'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`
          })
        }
      }
    );
    
    if (!treeResponse.ok) {
      if (treeResponse.status === 404) {
        // Try 'master' branch if 'main' doesn't exist
        const masterResponse = await fetch(
          `https://api.github.com/repos/${owner}/${cleanRepo}/git/trees/master?recursive=1`,
          {
            headers: {
              'Accept': 'application/vnd.github.v3+json',
              ...(process.env.GITHUB_TOKEN && {
                'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`
              })
            }
          }
        );
        
        if (!masterResponse.ok) {
          throw new Error('Repository not found or is private. Make sure it\'s a public repository.');
        }
        
        return await processTreeResponse(masterResponse, owner, cleanRepo, 'master');
      }
      throw new Error(`GitHub API error: ${treeResponse.status}`);
    }
    
    return await processTreeResponse(treeResponse, owner, cleanRepo, 'main');
    
  } catch (error: any) {
    console.error('GitHub fetch error:', error);
    throw new Error(error.message || 'Failed to fetch repository from GitHub');
  }
}

async function processTreeResponse(
  response: Response,
  owner: string,
  repo: string,
  branch: string
): Promise<GitHubFile[]> {
  const tree = await response.json();
  
  // Filter code files only
  const codeFiles = tree.tree.filter((item: any) => 
    item.type === 'blob' &&
    isCodeFile(item.path) &&
    !shouldIgnore(item.path)
  ).slice(0, 100); // Limit to 100 files
  
  // Fetch file contents in parallel (with rate limiting)
  const files: GitHubFile[] = [];
  const batchSize = 10; // Fetch 10 files at a time
  
  for (let i = 0; i < codeFiles.length; i += batchSize) {
    const batch = codeFiles.slice(i, i + batchSize);
    const batchPromises = batch.map(async (file: any) => {
      try {
        const response = await fetch(
          `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${file.path}`
        );
        
        if (!response.ok) return null;
        
        const content = await response.text();
        
        // Limit content size (50KB per file)
        return {
          path: file.path,
          content: content.substring(0, 50000)
        };
      } catch (error) {
        console.error(`Failed to fetch ${file.path}:`, error);
        return null;
      }
    });
    
    const batchResults = await Promise.all(batchPromises);
    files.push(...batchResults.filter((f): f is GitHubFile => f !== null));
  }
  
  if (files.length === 0) {
    throw new Error('No code files found in repository');
  }
  
  return files;
}

function isCodeFile(path: string): boolean {
  const codeExtensions = [
    '.js', '.jsx', '.ts', '.tsx',
    '.py', '.go', '.java', '.cpp', '.c', '.h',
    '.cs', '.rb', '.php', '.swift', '.kt',
    '.rs', '.scala', '.sh', '.sql'
  ];
  
  return codeExtensions.some(ext => path.endsWith(ext));
}

function shouldIgnore(path: string): boolean {
  const ignorePaths = [
    'node_modules/',
    'dist/',
    'build/',
    '.next/',
    'coverage/',
    '.git/',
    'vendor/',
    '__pycache__/',
    '.pytest_cache/',
    'target/',
    'bin/',
    'obj/',
    'out/',
    'pkg/'
  ];
  
  return ignorePaths.some(ignore => path.includes(ignore));
}
