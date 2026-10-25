import type { RepoIconKind } from './RepoIcons'

export type RepoStatus = 'ready' | 'indexing' | 'failed'

export type TreeNode = { name: string; children?: TreeNode[] }

export type Repo = {
  id: string
  name: string
  path: string
  stack: string
  stackFull: string
  icon: RepoIconKind
  description: string
  branch: string
  sha: string
  status: RepoStatus
  /** One line under the status badge. */
  statusNote: string
  attempt?: number
  /** Whether an earlier validated index can still answer questions. */
  hasUsableIndex: boolean
  /** Illustrative structure only; not analyzed dependencies. */
  tree: TreeNode[]
}

// Illustrative sample data.
export const repos: Repo[] = [
  {
    id: 'api-service',
    name: 'api-service',
    path: 'acme / api-service',
    stack: 'Java · Spring Boot',
    stackFull: 'Java / Spring Boot',
    icon: 'folder',
    description: 'Backend services and project access rules.',
    branch: 'main',
    sha: 'a3f82c1',
    status: 'ready',
    statusNote: 'Indexed 12 min ago',
    hasUsableIndex: true,
    tree: [
      {
        name: 'src',
        children: [
          {
            name: 'main',
            children: [
              {
                name: 'java',
                children: [{ name: 'auth' }, { name: 'projects' }, { name: 'indexing' }],
              },
            ],
          },
        ],
      },
      { name: 'tests' },
    ],
  },
  {
    id: 'web-client',
    name: 'web-client',
    path: 'acme / web-client',
    stack: 'React · TypeScript',
    stackFull: 'React / TypeScript',
    icon: 'react',
    description: 'Browser client for the workspace.',
    branch: 'main',
    sha: 'd9b41e2',
    status: 'indexing',
    statusNote: 'Creating embeddings',
    attempt: 1,
    hasUsableIndex: false,
    tree: [
      { name: 'src', children: [{ name: 'features' }, { name: 'components' }, { name: 'lib' }] },
      { name: 'tests' },
    ],
  },
  {
    id: 'ai-service',
    name: 'ai-service',
    path: 'acme / ai-service',
    stack: 'Python · FastAPI',
    stackFull: 'Python / FastAPI',
    icon: 'python',
    description: 'Retrieval and answer orchestration service.',
    branch: 'main',
    sha: '7c8d2a4',
    status: 'failed',
    statusNote: 'Previous index ready',
    hasUsableIndex: true,
    tree: [
      { name: 'src', children: [{ name: 'api' }, { name: 'retrieval' }, { name: 'workers' }] },
      { name: 'tests' },
    ],
  },
]
