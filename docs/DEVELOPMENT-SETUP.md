# DevSync AI — Development Setup

Date: 25 October 2026. Scope: detailed development baseline covering the technology stack, repository structure, environment configuration, local workflow, quality checks and Git collaboration.

## 1. Working agreement and current state

Use this file as the development setup reference for subsequent implementation in this project. Keep service boundaries, directory naming, configuration and Git practices consistent with it. Explicit later user instructions take precedence; record deliberate architectural changes instead of silently diverging.

At preparation time, `C:\ABHINAY\DEVSYNC-AI` contains documentation, contracts and documentation-validation scripts. It has no application service manifests, Compose definition or initialized Git repository. Creating this document does not initialize Git, install application dependencies, scaffold services, configure a remote or deploy anything.

Commands are labelled below as prerequisite inspection, documentation validation, manual initialization, or **target commands after scaffolding**. Do not treat a target command as a working setup command before its referenced file exists.

## 2. Technology stack and development ownership

| Area | Technology | Development responsibility |
|---|---|---|
| Frontend | React + TypeScript | Routes, project dashboard, chat, source viewer, jobs, findings and review interactions |
| UI | Tailwind CSS + shadcn/ui | Shared semantic tokens, reusable controls, responsive layout, keyboard/focus behavior |
| Backend | Java + Spring Boot | Public API, authorization, durable workflows, grants, integration records, budgets and approvals |
| AI service | Python + FastAPI | Private health/admin HTTP and shared AI application services; gRPC for typed internal product calls |
| Generation | Configured LLM API | Grounded answer generation and structured tool requests through provider adapters |
| Retrieval | RAG | Scoped source retrieval, context budgets and citation provenance |
| Tool integration | Tool Calling + MCP | Schema-validated, permission-controlled native/MCP operations |
| Parsing | Tree-sitter | Language-aware syntax units, chunks, source ranges and parse-quality metadata |
| Static analysis | SonarQube | Revision-specific quality findings and configured CI gates |
| Canonical data | PostgreSQL | Users, projects, permissions, source metadata/content, jobs, messages, proposals, audit and spending |
| Vector search | pgvector + Pinecone adapter | pgvector default; Pinecone alternative per generation; no mandatory dual write |
| Cache | Redis | Scoped short-lived caches and transient rate counters |
| Background work | Apache Kafka | Durable index/analysis/test/PR/cleanup dispatch with idempotent consumers |
| Identity | Spring Security + OAuth 2.0/OIDC | Access-token validation, browser identity integration and action/resource checks |
| Communication | REST + gRPC | Browser/public APIs and authenticated private Java/Python contracts |
| Java tests | JUnit + Mockito | Business rules, permission checks, transitions and dependency isolation |
| Frontend tests | React Testing Library | Observable component/user behavior; Playwright complements browser end-to-end verification |
| Python tests | Pytest | Parsing, retrieval, orchestration, tool policy and provider adapters |
| Telemetry | OpenTelemetry + Prometheus + Grafana | Correlated traces/metrics, dashboards and alerts; Tempo is the existing trace-backend baseline |
| Version control | Git + GitHub | Reviewed source history, contracts, issues, branches and PRs |
| CI/CD | GitHub Actions + Jenkins | Actions owns validation/image publication; Jenkins owns controlled environment promotion |
| Packaging/deployment | Docker + Kubernetes | Reproducible service images and target production workload management |

All listed technologies have a target role. Implement the repository-Q&A vertical slice first; optional adapters, analysis and approved writes follow documented phases. An interface abstraction is not evidence that the provider integration already works.

## 3. Runtime and dependency baseline

| Tool/runtime | Target | Reproducibility rule |
|---|---|---|
| Java | JDK 21 | Compiler/runtime target in Maven; same family in CI and images |
| Java build | Maven Wrapper | Commit wrapper scripts/config/checksums; do not require a developer's global Maven |
| Node.js | Node 22, at least 22.12 for the documented frontend baseline | Record actual tested patch in toolchain configuration/images |
| Frontend package manager | npm | Commit package-lock.json; use npm ci for clean reproducible installs |
| Python application | Python 3.12 | Project metadata and exact dependency lock; isolated virtual environment |
| PostgreSQL | PostgreSQL 16 reference target | Approved pgvector extension, explicit roles and Flyway migrations |
| Protobuf | Versioned proto3 contracts | Pin compiler/runtime/plugins compatibly and generate both language clients from the same source |
| Containers | Docker with Compose support | Pin application/dependency images; production uses immutable digests |
| Kubernetes tools | kubectl configured for the actual target cluster | Local application development does not require production cluster access |

These are project target families, not a claim that the newest dependency versions were installed or that a full compatibility build passed. Follow the [configuration/toolchain reference](27-configuration-and-toolchain.md) for the existing compatibility sources. Pin actual application patches/plugins/lockfiles during scaffolding and validate them together before accepting a dependency baseline.

Do not mix npm/yarn/pnpm lockfiles. Do not share Python environments between the AI service and documentation validators. Do not upgrade protocol compiler/runtime independently without generated-client tests. Database/vector model changes require reviewed migrations/generations.

## 4. Recommended developer environment

Use an editor with Java, Python, TypeScript, Docker and Markdown support; the repository must remain usable without one specific editor. Enable formatting on save only after repository formatter settings exist. Prefer PowerShell instructions on this Windows workspace and provide equivalent CI/Linux scripts when implementation begins.

Initial sizing guidance: 16 GiB RAM can run a minimal dependency/service profile; 32 GiB is more comfortable when Kafka, SonarQube and observability run locally. Reserve disk for container images, database volumes, fixtures and dependency caches. These are planning estimates, not benchmarked requirements. Disable optional profiles if memory is constrained.

Prerequisite inspection commands, which do not create or deploy application services:

```powershell
Set-Location -LiteralPath 'C:\ABHINAY\DEVSYNC-AI'
git --version
java -version
node --version
npm --version
py -0p
docker --version
docker compose version
```

Use `python --version` where the Windows Python launcher is unavailable. Docker version output alone does not prove the daemon is running; inspect `docker info` separately. Keep private daemon/registry configuration out of pasted diagnostics.

## 5. Target monorepo folder structure

The following is the intended structure, not a claim that every path already exists. Existing documentation filenames remain separate.

```text
DEVSYNC-AI/
├── README.md
├── .gitignore
├── .gitattributes                         # planned UTF-8/LF policy
├── .editorconfig                         # planned shared whitespace settings
├── .env.example                          # planned root non-secret configuration
├── .github/
│   ├── workflows/                        # PR checks, contracts, image publication
│   ├── ISSUE_TEMPLATE/
│   ├── pull_request_template.md
│   └── CODEOWNERS                        # real owners, never invented identities
├── frontend/
│   ├── package.json
│   ├── package-lock.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── public/
│   ├── src/
│   │   ├── app/                          # router, shell and providers
│   │   ├── features/
│   │   │   ├── auth/
│   │   │   ├── workspaces/
│   │   │   ├── projects/
│   │   │   ├── chat/
│   │   │   ├── jobs/
│   │   │   ├── findings/
│   │   │   ├── proposals/
│   │   │   └── settings/
│   │   ├── components/ui/                # shadcn primitives
│   │   ├── components/domain/            # shared product components
│   │   ├── lib/api/                      # typed API client/problem mapping
│   │   ├── lib/auth/                     # in-memory identity and callback handling
│   │   ├── styles/                       # semantic colors/fonts/layout tokens
│   │   └── test/                         # RTL utilities and fixtures
│   └── e2e/                              # browser workflows
├── backend/
│   ├── pom.xml
│   ├── mvnw
│   ├── mvnw.cmd
│   ├── .mvn/wrapper/
│   ├── src/main/java/com/devsync/
│   │   ├── identity/                     # feature packages shown below
│   │   ├── authorization/
│   │   ├── workspace/
│   │   ├── integration/github/
│   │   ├── project/
│   │   ├── indexing/
│   │   ├── jobs/
│   │   ├── conversation/
│   │   ├── analysis/
│   │   ├── proposal/
│   │   ├── approval/
│   │   ├── tools/
│   │   ├── budget/
│   │   ├── cleanup/
│   │   ├── audit/
│   │   ├── outbox/
│   │   └── shared/
│   ├── src/main/resources/
│   │   ├── application.yml
│   │   └── db/migration/
│   └── src/test/
├── ai-service/
│   ├── pyproject.toml
│   ├── requirements.in                   # target dependency declarations
│   ├── requirements.lock                 # target exact resolved runtime/dev lock
│   ├── src/devsync_ai/
│   │   ├── api/
│   │   ├── rpc/
│   │   ├── orchestration/
│   │   ├── retrieval/
│   │   ├── parsing/
│   │   ├── chunking/
│   │   ├── embeddings/
│   │   ├── vectors/
│   │   ├── tools/
│   │   ├── mcp/
│   │   ├── workers/
│   │   ├── sandbox/
│   │   ├── telemetry/
│   │   └── config/
│   └── tests/
│       ├── unit/
│       ├── integration/
│       ├── contracts/
│       └── evaluation/
├── contracts/
│   ├── openapi.json                      # existing public REST contract
│   ├── proto/devsync/ai/v1/ai.proto       # existing private RPC contract
│   ├── events/                           # existing Kafka schemas
│   ├── tools/                            # existing argument/result schemas
│   └── examples/                         # existing synthetic event examples
├── infra/
│   ├── compose/compose.yml
│   ├── docker/                           # per-service Dockerfiles
│   ├── keycloak/                         # local realm/client configuration
│   ├── kafka/                            # topics/ACL/bootstrap configuration
│   ├── observability/                    # collector, metrics, traces, dashboards
│   ├── kubernetes/base/
│   ├── kubernetes/overlays/staging/
│   ├── kubernetes/overlays/production/
│   └── jenkins/Jenkinsfile
├── scripts/
│   ├── validate_documentation.py         # existing validator; writes its report
│   ├── requirements-docs.txt             # existing validator pins
│   ├── dev/                              # planned start/status/stop/seed wrappers
│   ├── ci/                               # planned shared check/build/generate scripts
│   └── release/                          # planned promotion/smoke/recovery helpers
├── fixtures/                             # planned public/synthetic source/evaluation fixtures
└── docs/                                 # existing separate project specifications
```

Keep generated protobuf/client outputs in declared generated-source/build paths, not handwritten domain folders. Commit generated output only when the chosen build policy explicitly requires it and regeneration is verified. Keep uploaded repositories, private artifacts, database files, virtual environments and build output outside tracked source paths.

## 6. Code organization and dependency direction

Frontend features own routes, domain interactions and feature-specific components. Shared UI primitives do not call project APIs. Typed API client handles bearer headers, problem responses and cancellation; route changes invalidate/ignore stale scoped responses. Theme uses existing slate/blue system and system UI/monospace fonts.

Backend uses package-by-feature. Within a feature, separate API/RPC adapters, application services, domain rules and persistence/integration adapters. Controllers validate transport inputs and invoke application services; repositories do not decide user permissions. Backend owns job transitions, approval, spend and active-index state.

Python separates orchestration from provider adapters. HTTP/gRPC entrypoints call shared services. VectorStore, EmbeddingProvider, LlmProvider and ToolGateway interfaces isolate external systems. Workers cannot receive broad backend or PR-writing credentials merely because they share a codebase.

Contracts are the cross-service boundary. Generate clients from the same versioned sources and test Java/Python compatibility. Do not import backend implementation internals into frontend or duplicate authorization rules as independent authoritative Python logic.

## 7. Configuration and secret handling

The existing [environment reference](reference/environment.example) contains canonical baseline variable names. It is documentation, not an active production .env. During actual scaffolding, introduce a root .env.example and service loaders consistent with that reference; do not create two drifting configuration definitions.

| Group | Key inputs | Rule |
|---|---|---|
| Public origins | APP_PUBLIC_ORIGIN, API_PUBLIC_ORIGIN | Match actual frontend origin/CORS configuration |
| Database | DATABASE_URL, DATABASE_USER, DATABASE_PASSWORD, PYTHON_DATABASE_DSN | Java JDBC URL and Python DSN differ; use separate least-privilege roles |
| Cache/events | REDIS_URL, KAFKA_BOOTSTRAP_SERVERS | Distinguish host ports from container-network addresses |
| Identity | OIDC_ISSUER_URI, OIDC_CLIENT_ID, OIDC_API_AUDIENCE, OIDC_REDIRECT_URI | Exact issuer/audience/redirect validation; baseline local Keycloak |
| Internal RPC | AI_GRPC_TARGET, BACKEND_JOB_GRPC_TARGET and TLS/context key references | Authenticate service identity and signed scope |
| GitHub | App ID, private-key/webhook/OAuth references and callback URL | Server-side only; installation ID knowledge is not authority |
| Models | LLM/embedding endpoint, model ID, key reference, EMBEDDING_DIMENSION | Match generation model/dimension and approved processor policy |
| Vector provider | VECTOR_PROVIDER, PINECONE_INDEX/key reference | PGVECTOR default; no silent alternative provider fallback |
| Controls | PRIVATE_SOURCE_ENABLED, MCP_ENABLED, WRITE_TOOLS_ENABLED | Disabled by default until policy and implementation permit |
| Artifacts/telemetry | Storage configuration and OTEL endpoint/service name | Restrict access; do not export source/prompts/secrets |

Environment variables are not loaded automatically by every runtime: implement explicit Compose/service configuration mapping. Do not assume a root .env is read by Java/Python/Node uniformly. Frontend receives only intentionally public configuration, such as API origin and OIDC public client settings; never expose provider keys or confidential client secrets through Vite-prefixed variables.

Before initial staging, ensure ignore rules cover all local virtual environments, private keys/certificates, .env variants, coverage/test output, repository worktrees, artifact downloads and local volumes. Existing .gitignore is not assumed to cover every future directory already. Use synthetic secrets for tests; no real private repository fixtures in source control.

## 8. Services, ports and local profiles

| Service | Baseline local port | Exposure |
|---|---|---|
| Frontend development server | 5173 | Loopback browser development |
| Spring Boot public API | 8080 | Loopback; /api/v1 public application path |
| FastAPI health/admin | 8000 | Private/local inspection only |
| AI gRPC | 50051 | Private service-to-service |
| Backend job-control gRPC | 50052 | Private worker-to-backend |
| PostgreSQL | 5432 | Local dependency; production private |
| Redis | 6379 | Local dependency; production private |
| Kafka | 9092 internal baseline | Configure distinct advertised host listener if exposing locally |
| Keycloak | 8081 | Local identity reference |
| SonarQube | 9000 | Optional analysis profile |
| Grafana / Prometheus | 3000 / 9090 | Optional observability profile |
| Tempo / OTLP gRPC | 3200 / 4317 | Private/local telemetry |

Core local profile: database/pgvector, Redis, Kafka, Keycloak and the developing service slice. Optional analysis profile adds SonarQube; observability profile adds collector, Prometheus, Grafana and Tempo. Cloud/vector providers remain optional configured integrations. Containers use service DNS names, not localhost to address another container. A browser must use an issuer hostname reachable by the browser; internal identity metadata must still present the configured issuer consistently.

## 9. First-run procedure after application scaffolding

1. Inspect actual runtime/tool versions and ensure locked dependencies/images match the selected build.
2. Create untracked local configuration from a reviewed example; set local credentials and public origins.
3. Start dependency services; verify readiness, advertised Kafka listeners and local OIDC client/realm.
4. Run backend-owned Flyway migrations against a disposable/local database with the intended migration role.
5. Configure reviewed broker topics/consumer groups and least-privilege database/service identities.
6. Seed synthetic users/workspace/project fixtures using a development-only seed path; do not enable that path in production.
7. Start API, private AI/gRPC service and relevant workers, then frontend.
8. Verify sign-in, /me, project access, integration selection and immutable index job lifecycle.
9. Run synthetic retrieval/answer checks first; enable approved live providers only with pricing/budget and private-data policy configured.
10. Run meaningful unit/integration/contract/browser checks; record versions and results.
11. Stop workloads gracefully and restart to verify durable jobs/index state survives.

Do not run the reference schema file as a substitute for Flyway migrations. Do not fetch/execute arbitrary repository code during indexing; test execution belongs in the isolated executor.

## 10. Target application command contract

These commands are examples for the intended manifests, not tested commands for today's documentation-only repository. Run from the stated directory only after those files/scripts exist. Scaffolding must implement/document these scripts or update this guide in the same change.

| Working directory | Target command | Purpose |
|---|---|---|
| Project root | docker compose -f infra/compose/compose.yml up -d | Start defined dependency/core services; must have reviewed local configuration |
| frontend | npm ci | Install exact lockfile dependencies |
| frontend | npm run dev | Run development UI |
| frontend | npm run lint | Lint UI source |
| frontend | npm run typecheck | TypeScript validation |
| frontend | npm run test -- --run | Noninteractive RTL/unit run through selected test runner |
| frontend | npm run build | Production UI build |
| frontend | npm run test:e2e | Playwright workflows against configured test services |
| backend (PowerShell) | .\mvnw.cmd verify | Compile and configured unit/integration/contract verification |
| backend (PowerShell) | .\mvnw.cmd spring-boot:run "-Dspring-boot.run.profiles=local" | Run local Spring application after configuring plugin/profile |
| backend (Linux CI) | ./mvnw verify | Same wrapper-owned verification on Linux |
| ai-service | py -3.12 -m venv .venv | Create isolated application environment on Windows |
| ai-service (PowerShell) | .\.venv\Scripts\python.exe -m pip install -r requirements.lock | Install exact locked Python dependencies |
| ai-service (PowerShell) | .\.venv\Scripts\python.exe -m pip install --no-deps -e . | Install project package using the lock's build/runtime prerequisites |
| ai-service (PowerShell) | .\.venv\Scripts\python.exe -m pytest | Run configured Python tests |
| Project root | docker compose -f infra/compose/compose.yml down | Stop defined containers without intentionally removing named volumes |

AI HTTP/gRPC/worker start commands must be exposed by reviewed scripts in scripts/dev once actual module entrypoints are defined. Do not assume a sample module path launches both FastAPI and gRPC. Build/test dependencies and packaging backend must be locked; the editable-install step must not fetch an unreviewed alternate dependency set through uncontrolled build isolation.

Database reset, volume removal, cluster apply and production promotion are separate workflows; they are never an implicit step in normal local start/stop. Test environment configuration must never point at production.

## 11. Documentation validation available now

The existing documentation validator can run independently of application scaffolding. From project root:

```powershell
python -m venv .venv-docs
& .\.venv-docs\Scripts\python.exe -m pip install -r scripts/requirements-docs.txt
& .\.venv-docs\Scripts\python.exe scripts/validate_documentation.py
```

It checks Markdown links/fences, OpenAPI, event/tool schemas/examples, protobuf compilation, SQL syntax and SVG XML. It writes report/inventory artifacts under docs/reference, so running it intentionally changes those generated files. It does not apply migrations, run frontend/backend tests, provision a cluster or prove application correctness.

## 12. Git initialization and remote setup

This project path was not a Git repository when inspected. No initialization/commit/push has been executed as part of creating this guide. When starting version control, choose either local initialization or an existing remote clone; do not mix both blindly or overwrite unrelated history.

Manual local initialization example, only after confirming this folder is the intended repository root:

```powershell
Set-Location -LiteralPath 'C:\ABHINAY\DEVSYNC-AI'
git init -b main
git config --local user.name 'YOUR_NAME'
git config --local user.email 'YOUR_COMMIT_EMAIL'
git status --short
```

Use actual values rather than the example identity. Inspect ignore rules and stage explicit safe paths. Review staged content before committing:

```powershell
git add README.md .gitignore docs contracts scripts
git diff --cached --stat
git diff --cached --check
git diff --cached
git commit -m "docs: establish DevSync AI project design baseline"
```

Staging a directory is safe only after reviewing its contents for credentials/private artifacts. Do not blindly stage runtime downloads or broad working-directory output. Do not amend or rewrite a shared baseline without team agreement.

Connect a real chosen GitHub repository only when its URL and ownership are established. In the following example, replace the invalid sample URL with the verified repository URL; do not execute it literally:

```powershell
git remote add origin https://example.invalid/OWNER/DEVSYNC-AI.git
git remote -v
git push -u origin main
```

Remote creation and push are separate external actions, not performed by documenting commands. If origin already exists, inspect it; do not replace it silently. Existing remote history must be reviewed before joining a locally initialized repository.

## 13. Branch strategy and normal Git workflow

Use protected main and short-lived feature branches. A permanent develop branch is not part of the baseline. Suggested branch forms: `feat/<issue>-<description>`, `fix/<issue>-<description>`, `docs/<description>`, `chore/<description>`. Names are examples; never imply an issue number exists when it does not.

For an initialized repository with the verified origin and a clean working tree:

```powershell
git status --short
git switch main
git fetch origin
git pull --ff-only origin main
git switch -c feat/repository-indexing
```

Make one focused change. Run relevant checks, stage intended paths and inspect the diff. Example staging uses an existing documentation path; for feature work substitute the specific implementation paths actually changed:

```powershell
git diff --check
git add docs/DEVELOPMENT-SETUP.md
git diff --cached --check
git diff --cached
git commit -m "docs: define development setup and Git workflow"
git push -u origin feat/repository-indexing
```

Create a GitHub PR with problem/outcome, scope, test evidence, contract/schema/security impact and rollout notes. Prefer squash merge after required review/checks, leaving main with focused changes. After merge, switch to main and fast-forward from origin. Branch deletion is optional cleanup after confirming merge; do not delete unmerged work automatically.

Do not run `git pull` with unreviewed local modifications. Commit appropriate work or make a deliberate local backup/stash first; do not discard it. Do not force-push main or rewrite another developer's branch.

## 14. Synchronization and conflicts

For a shared feature branch prefer merging the updated origin/main so published history remains intact. For a private unpublished branch a deliberate rebase is acceptable; do not prescribe it automatically after collaborators have based work on it.

```powershell
git status --short
git fetch origin
git merge origin/main
```

If conflicts occur, inspect both intended changes, edit the affected files, run relevant checks and stage only resolved files. Complete the merge with a reviewed commit. `git merge --abort` returns to the pre-merge state when an in-progress merge cannot be completed safely; inspect state first. Never use blanket “ours/theirs”, hard reset or clean commands as default conflict resolution.

After synchronization rerun checks affected by incoming changes. Contract, migration and generated-code conflicts require semantic review, not just removing conflict markers. A private-branch rebase that rewrites already-pushed history requires explicit coordination; a force push is not part of the default daily workflow.

## 15. Commit, review and branch protection rules

Commit format: `type(scope): concrete change`, with optional scope. Types: feat, fix, docs, refactor, test, chore, ci, build. Examples: `feat(indexing): persist durable index requests`, `fix(auth): reject inactive workspace memberships`, `test(retrieval): verify generation scope filters`.

Protect main from direct/force pushes, require passing checks and at least one qualified reviewer; security-sensitive changes need the designated security owner. Author self-approval does not substitute for team review. For a solo project record self-review separately and do not claim independent reviewer approval.

Required PR evidence: actual tests executed and results; unexecuted checks labelled honestly; scope/requirement IDs; API/protobuf/event compatibility; migration/backfill impact; authorization/privacy; UI states/accessibility where relevant; telemetry; rollback/deployment considerations. Keep existing behavior unless the scoped change explicitly replaces it.

Never commit plaintext secrets, private-source fixtures, .env files, provider output dumps, virtual environments, node_modules, database volumes or build caches. If a real credential leaks, revoke/rotate it immediately; simply deleting the latest file is not sufficient to remove historical exposure.

## 16. Development and quality cycle

| Change area | Appropriate checks |
|---|---|
| Frontend | Type-check/build, RTL behavior, keyboard/responsive states; browser tests for affected end-to-end flow |
| Java/backend | JUnit/Mockito for logic, real disposable DB/broker integrations for transactional behavior |
| Python/AI | Pytest unit/provider contracts, scoped retrieval, invalid-model-output and budget/tool policy cases |
| Public/internal contracts | OpenAPI/protobuf/event/tool validation, generated-client compatibility and matching examples |
| Database | Fresh/upgrade migrations, cross-scope integrity, concurrency/idempotency and retention cleanup |
| Infrastructure | Build/scan, staging smoke, configuration/secrets review and relevant rollback/restore verification |
| Docs only | Relevant links, example accuracy, contract coverage and documentation validation |

Use synthetic/public fixtures at immutable commits. Keep paid live-provider tests separate and budget-limited; routine CI uses deterministic doubles. A passing unit suite is not proof of grounded AI answers, safe code execution or recovery readiness. Record model/configuration and fixture versions for evaluations.

## 17. CI/CD workflow

GitHub Actions runs protected PR checks and publishes immutable images/evidence after reviewed changes. Jenkins consumes selected immutable digests and shared scripts for staging/production promotion with one deployment owner/lock per environment. Production deployment is not triggered merely by model-generated code, a test result or PR creation.

Contract changes and affected consumers ship together. Generated-source checks detect stale output. Migrations run through an approved job; runtime application credentials do not administer extensions. Dependency updates change lockfiles intentionally and receive compatibility/security review. Container/build secrets are unavailable to untrusted fork code.

## 18. Troubleshooting guide

| Symptom | Inspect | Safe next action |
|---|---|---|
| git status says not a repository | Current path and intended repository root | Initialize only under the reviewed first-time process |
| Build uses wrong Java/Node/Python | Shell executable resolution and recorded runtime versions | Fix local tool selection; do not casually change project target |
| npm ci fails | Lockfile/package manifest consistency and package access | Restore matching reviewed lock; do not delete lock to bypass failure |
| Python import/package errors | Intended virtual environment, locked dependencies and editable project install | Use correct interpreter; avoid global pip installs |
| Database startup/migration error | Readiness, role privileges, schema history and pgvector installation | Correct config or migration; do not wipe data as default fix |
| Kafka producer/consumer cannot connect | Advertised listeners, host/container DNS, ACL and topic setup | Use reachable configured listener; inspect job state before replay |
| OIDC redirects/token validation fail | Exact issuer, audience, public callback, clock and allowed origins | Align config; do not disable validation |
| gRPC call fails | Target port, TLS identity, deadline, signed context and proto versions | Correct service scope/config; do not expose private RPC publicly |
| Vector insert/search fails | Dimension, finite components, generation/model and provider filters | Reject incompatible generation; re-embed through reviewed flow |
| Model call blocked | Feature flag, processor approval, credential reference, pricing/budget | Fix permitted configuration; do not bypass budget/data policy |
| Port conflict or slow laptop | Actual listener owner, container resources and optional profiles | Use documented override/disable optional profile; no random process killing |

Include sanitized request/job IDs and reproduction steps in reports. Never paste access tokens, private keys, full prompts or private source into public issues.

## 19. Setup completion criteria and future consistency

A developer setup is implementation-ready only after a clean checkout can install locked dependencies, start configured dependencies/services, migrate disposable data, sign in, index the fixture, obtain a correctly cited answer and pass relevant checks using documented commands. Stopping/restarting must preserve intended state and no test credential must leak into source control.

For subsequent work, consult this file together with [System Architecture](SYSTEM-ARCHITECTURE.md), [LLD](SYSTEM-DESIGN-LLD.md), [Database Design](DATABASE-DESIGN.md), [API Documentation](API-DOCUMENTATION.md) and [UI/UX Design](UI-UX-DESIGN.md). Preserve the monorepo/module boundaries, separate credentials, explicit contracts, semantic UI system, short-lived Git branches and reviewed delivery process unless the user explicitly changes the direction.

This new setup document is the saved project reference. No other project file, Git setting, remote, application dependency or running environment is changed by its creation.
