export type FileNode = { name: string; children?: FileNode[] }

// Illustrative structures and snippets only; not analyzed repository data.
export const fileTrees: Record<string, FileNode> = {
  'api-service': {
    name: 'api-service',
    children: [
      {
        name: 'src',
        children: [
          {
            name: 'main',
            children: [
              {
                name: 'java',
                children: [
                  {
                    name: 'com / devsync',
                    children: [
                      { name: 'auth' },
                      {
                        name: 'projects',
                        children: [{ name: 'ProjectAccessPolicy.java' }, { name: 'ProjectService.java' }],
                      },
                      { name: 'indexing' },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
      { name: 'tests' },
      { name: 'docs' },
      { name: 'pom.xml' },
    ],
  },
  'web-client': {
    name: 'web-client',
    children: [
      {
        name: 'src',
        children: [
          { name: 'features', children: [{ name: 'projects', children: [{ name: 'ProjectList.tsx' }] }] },
          { name: 'lib', children: [{ name: 'api.ts' }] },
        ],
      },
      { name: 'tests' },
      { name: 'docs' },
      { name: 'package.json' },
    ],
  },
  'ai-service': {
    name: 'ai-service',
    children: [
      {
        name: 'src',
        children: [
          { name: 'retrieval', children: [{ name: 'retrieve.py' }] },
          { name: 'api' },
          { name: 'workers' },
        ],
      },
      { name: 'tests' },
      { name: 'docs' },
      { name: 'pyproject.toml' },
    ],
  },
}

export const defaultFile: Record<string, string> = {
  'api-service': 'ProjectAccessPolicy.java',
  'web-client': 'ProjectList.tsx',
  'ai-service': 'retrieve.py',
}

export const previews: Record<string, string> = {
  'ProjectAccessPolicy.java': `public Project readProject(User user, String projectId) {
    requireProjectAccess(user, projectId);
    return repositoryService.read(projectId);
}`,
  'ProjectService.java': `public Project getProject(User user, String projectId) {
    requireProjectAccess(user, projectId);
    return projectRepository.findById(projectId);
}`,
  'ProjectList.tsx': `export function ProjectList({ projects }: Props) {
  return projects.map((p) => <ProjectRow key={p.id} project={p} />)
}`,
  'retrieve.py': `def retrieve(scope: Scope, question: str):
    require_scope(scope)
    return vector_store.search(scope, question)`,
}
