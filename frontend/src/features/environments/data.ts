export type EnvId = 'development' | 'staging' | 'production'

export type Environment = {
  id: EnvId
  name: string
  short: string
  tagline: string
  repo: string
  /** Illustrative mapping; `release/*` is a branch pattern, not a resolved commit. */
  branch: string
}

// Example mappings only. No runtime is connected to any of them.
export const environments: Environment[] = [
  {
    id: 'development',
    name: 'Development',
    short: 'Build & debug',
    tagline: 'Build and explore changes',
    repo: 'api-service',
    branch: 'develop',
  },
  {
    id: 'staging',
    name: 'Staging',
    short: 'Test & validate',
    tagline: 'Validate before release',
    repo: 'api-service',
    branch: 'release/*',
  },
  {
    id: 'production',
    name: 'Production',
    short: 'Live-service context',
    tagline: 'Your live-service context',
    repo: 'api-service',
    branch: 'main',
  },
]
