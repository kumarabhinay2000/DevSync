# Engineering Governance and Implementation Backlog

## Development and change process

Use a monorepo with protected `main`, short-lived feature branches and reviewed pull requests. Require one qualified reviewer, passing required checks and no committed secrets; privileged/security changes require security-owner review. Author self-approval does not count for repository policy. Record product decisions in ADRs, operational incidents in postmortems and defects in issues with reproducible evidence.

Commit messages describe an observable change. PRs include problem/outcome, scope, tests/evaluation, migration/API impact and operational risk. Avoid mixing unrelated refactors with feature delivery. Keep contracts, docs, code and tests aligned in one PR. Dependency updates pin immutable versions and require compatibility/scanning checks.

## Compatibility policy

Public API base is `/api/v1`; additive optional response fields are compatible only when clients ignore unknown fields. Do not add required request fields or change enum meaning silently. Protobuf field numbers are never reused; reserve removed numbers/names. Event version changes when semantics or required fields break consumers. During rollout, consumers support the documented transition window; default two releases before retiring an older compatible endpoint/event, with explicit usage evidence.

Database changes use expand/backfill/switch/contract; deploy readers tolerant of both shapes before dropping old columns. Vector model changes use new generations rather than mutating an active index. An API version bump does not replace a data migration strategy.

## Prioritized implementation backlog

| ID | Deliverable | Dependencies | Completion evidence |
|---|---|---|---|
| ENG-01 | Runtime locks, build wrappers, service skeletons, local health | None | Clean-checkout build report |
| ENG-02 | OIDC flow, users, workspace and explicit grants | ENG-01 | AUTH-01–04 and login demo |
| ENG-03 | GitHub App installation and repository listing | ENG-02 | Signed webhook and access tests |
| ENG-04 | Database migration implementation from reference schema | ENG-01 | Fresh/upgrade migration tests |
| ENG-05 | Durable jobs, leases, outbox, Kafka retry/dead-letter | ENG-02,04 | Crash/duplicate/lease tests |
| ENG-06 | Tree-sitter chunks, exclusions, generation validation | ENG-03,05 | IDX-01–06 |
| ENG-07 | pgvector adapter and provider contract | ENG-04,06 | Scope/dimension/exact-search tests |
| ENG-08 | Private gRPC, retrieval, cited answers, cost ledger | ENG-02,07 | RAG/OPS-02 and benchmark |
| ENG-09 | Dashboard/chat/source view and accessibility | ENG-02,08 | RTL + Playwright evidence |
| ENG-10 | Read-only tools and MCP registry/gateway | ENG-08 | TOOL/MCP suite |
| ENG-11 | SonarQube results normalization and UI | ENG-05,09 | Finding provenance and severity mapping |
| ENG-12 | Isolated tests and immutable patch proposals | ENG-10,11 | EXEC suite and diff validation |
| ENG-13 | Approval-bound GitHub branch/PR workflow | ENG-12 | PR-01–02 |
| ENG-14 | Pinecone adapter and provider equivalence tests | ENG-07,08 | Scoped retrieval/evaluation parity |
| ENG-15 | Actions builds and Jenkins promotions | ENG-01,04 | Immutable artifact and staging record |
| ENG-16 | Kubernetes, metrics, alerts, backup/restore | ENG-15 | Rollout/restore/incident drills |
| ENG-17 | Deletion, retention, private-data policy enforcement | ENG-05,07,08 | DATA suite and cleanup report |

Assign actual engineers and estimates when work begins; owner roles do not fabricate team members. Phases 1–4 plus ENG-17 form the repository-Q&A release. Tools, analysis and write automation remain sequenced capabilities, not omissions from the target design.

## Operating responsibilities

Product owner accepts scope/evaluation. Technical lead owns boundaries/contracts/migrations. Security owner reviews access and data processors. Release lead approves environment promotion. Incident lead coordinates outages. Data recovery owner verifies restores. For a solo project one person can hold multiple roles, but the release record must identify them.

## Required templates

Feature issue: user outcome, requirement IDs, contract changes, permissions, failure cases, acceptance examples, tests, telemetry, rollout and owner. ADR: context, alternatives, decision, consequences, date, supersedes. Release record: source commit, image digests, config/schema revision, evidence links, owner, rollback target. Incident record: timeline, impact, detection, containment, recovery, contributing factors, corrective action owner/date.
