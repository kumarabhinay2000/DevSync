export type Citation = {
  n: number
  file: string
  dir: string
  lines: string
  startLine: number
  highlight: [number, number]
  code: string
}

export type Statement = { text: string; cite: number }

export type Conversation = {
  id: string
  title: string
  question: string
  lead: string
  /** Show the illustrative request-path visual. */
  flow?: boolean
  statements: Statement[]
  citations: Citation[]
  /** Short explanation of why the highlighted lines support the answer. */
  evidenceNote: Record<number, string>
}

export const REPO = 'api-service'
export const BRANCH = 'main'
export const REVISION = 'a3f82c1'

// Illustrative mock content. None of this is real repository source.
export const conversations: Conversation[] = [
  {
    id: 'access',
    title: 'Project access checks',
    question: 'Where is project access checked before reading a repository?',
    lead: 'Project access is checked before repository reads reach the service.',
    flow: true,
    statements: [
      {
        text: '`ProjectAccessPolicy` checks the user’s membership and required project permission.',
        cite: 1,
      },
      { text: '`RepositoryService` performs the read only after that check succeeds.', cite: 2 },
    ],
    citations: [
      {
        n: 1,
        file: 'ProjectAccessPolicy.java',
        dir: 'src/main/java/com/devsync/auth/',
        lines: 'Lines 12–25',
        startLine: 12,
        highlight: [16, 20],
        code: `public void requireReadAccess(User user, Project project) {
    if (user == null) {
        throw new AccessDeniedException("Sign in required");
    }
    boolean member = memberships.isActive(user, project);
    boolean allowed = permissions.canRead(user, project);
    if (!member || !allowed) {
        throw new AccessDeniedException("Project access denied");
    }
}

// Other methods...

`,
      },
      {
        n: 2,
        file: 'RepositoryService.java',
        dir: 'src/main/java/com/devsync/projects/',
        lines: 'Lines 34–46',
        startLine: 34,
        highlight: [37, 38],
        code: `@Transactional(readOnly = true)
public Project read(User user, String projectId) {
    Project project = projects.findById(projectId);
    accessPolicy.requireReadAccess(user, project);
    return project;
}

public List<Project> list(User user) {
    return projects.findAllVisibleTo(user);
}

// Other methods...
`,
      },
    ],
    evidenceNote: {
      1: 'The highlighted check supports the access explanation.',
      2: 'The read runs only after the access check returns.',
    },
  },
  {
    id: 'retry',
    title: 'Indexing retry behavior',
    question: 'How many times is an indexing job attempted?',
    lead: 'An indexing job is attempted up to three times before it is marked failed.',
    statements: [
      { text: '`JobLeaseService` increments the attempt counter each time a job is claimed.', cite: 1 },
      { text: '`IndexingService` marks the job FAILED once the attempt limit is reached.', cite: 2 },
    ],
    citations: [
      {
        n: 1,
        file: 'JobLeaseService.java',
        dir: 'src/main/java/com/devsync/jobs/',
        lines: 'Lines 41–51',
        startLine: 41,
        highlight: [44, 44],
        code: `public Lease claim(UUID jobId, String worker) {
    Job job = jobs.lockById(jobId);
    requireClaimable(job);
    job.setAttempt(job.getAttempt() + 1);
    job.setLeaseExpiresAt(clock.now().plus(LEASE));
    return leases.issue(job, worker);
}

// Other methods...

`,
      },
      {
        n: 2,
        file: 'IndexingService.java',
        dir: 'src/main/java/com/devsync/indexing/',
        lines: 'Lines 88–98',
        startLine: 88,
        highlight: [89, 90],
        code: `void onLeaseExpired(Job job) {
    if (job.getAttempt() >= MAX_ATTEMPTS) {
        job.setStatus(JobStatus.FAILED);
        return;
    }
    job.setStatus(JobStatus.QUEUED);
}

// Other methods...

`,
      },
    ],
    evidenceNote: {
      1: 'The attempt counter is incremented on every claim.',
      2: 'The attempt limit check leads to the FAILED status.',
    },
  },
  {
    id: 'structure',
    title: 'Repository structure',
    question: 'How is the repository organized?',
    lead: 'The service is organized into feature packages.',
    statements: [
      { text: 'Authentication and access checks live in the `auth` package.', cite: 1 },
      { text: 'Index creation and validation live in the `indexing` package.', cite: 2 },
    ],
    citations: [
      {
        n: 1,
        file: 'SecurityConfig.java',
        dir: 'src/main/java/com/devsync/auth/',
        lines: 'Lines 18–29',
        startLine: 18,
        highlight: [23, 24],
        code: `@Configuration
public class SecurityConfig {

    @Bean
    SecurityFilterChain chain(HttpSecurity http) {
        return http
            .authorizeHttpRequests(a -> a.anyRequest().authenticated())
            .build();
    }
}

`,
      },
      {
        n: 2,
        file: 'IndexingService.java',
        dir: 'src/main/java/com/devsync/indexing/',
        lines: 'Lines 12–21',
        startLine: 12,
        highlight: [15, 17],
        code: `@Service
public class IndexingService {

    public Job requestIndex(UUID projectId, String branch) {
        // Resolve the branch to a commit, then create the job.
        return jobs.createIndexJob(projectId, branch);
    }
}

`,
      },
    ],
    evidenceNote: {
      1: 'The configuration lives in the auth package.',
      2: 'Index requests are handled in the indexing package.',
    },
  },
]
