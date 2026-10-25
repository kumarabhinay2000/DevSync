# Product Requirements Document

## Product purpose

DevSync AI helps developers understand an unfamiliar GitHub repository through AI answers grounded in source code. Later releases add static analysis, proposed changes, test execution, and pull-request workflows.

The baseline user segment is individual developers and small development teams; customer validation is a separate delivery activity. Concrete defaults are recorded in [Baseline Decisions](18-baseline-decisions-and-limits.md).

## Problem and intended outcome

Developers spend time locating relevant files, following code relationships, and checking whether an explanation applies to the current revision. DevSync AI should shorten that investigation by retrieving authorized repository context and presenting answers with verifiable file references.

## MVP scope

- OIDC login and workspace membership.
- Connect an authorized GitHub repository and select a branch.
- Index a specific commit; display queued, running, completed, failed, and cancelled states.
- Parse supported source files, generate embeddings, and retrieve relevant chunks.
- Ask repository questions in a chat interface.
- Return source references containing path, commit SHA, and line range.
- Display insufficient-context responses when retrieval cannot support an answer.
- View indexing history and trigger a controlled reindex.
- Enforce workspace and project access on APIs, retrieval, and background processing.

Initial parsing targets: Java, Python, TypeScript, and TSX. Markdown documentation is indexed as text. Other source formats may be indexed as text if allowed by policy; structural parsing is not promised for them.

## Later releases

Read-only tool calling and MCP integrations; SonarQube findings; proposed diffs; isolated tests; approved branch/PR creation; Pinecone provider support; expanded enterprise operations using Jenkins and Kubernetes.

Autonomous merges, arbitrary production commands, and automatic production deployments are outside the initial product scope.

## Primary workflow

1. User signs in and enters a workspace.
2. User installs or selects the GitHub integration and chooses a repository.
3. Backend verifies membership and repository access, then records an indexing job.
4. Worker indexes an immutable commit and reports progress.
5. User opens the indexed project and submits a question.
6. Retrieval filters by workspace, project, and indexed revision.
7. AI responds with source references or explains that available context is insufficient.

## Functional acceptance criteria

| ID | Requirement and acceptance |
|---|---|
| FR-01 | Unauthenticated requests to protected project APIs are rejected. |
| FR-02 | A user without project access cannot read project metadata, chat, chunks, or job status. |
| FR-03 | Duplicate indexing requests with the same idempotency key return the original job. |
| FR-04 | A completed index identifies its exact repository commit and embedding configuration. |
| FR-05 | Every returned source reference resolves to the indexed revision and valid source lines. |
| FR-06 | Answers distinguish repository evidence from suggestions or uncertainty. |
| FR-07 | An indexing failure provides a useful sanitized error and retry option. |
| FR-08 | Reindexing builds a replacement index before switching the active index. |
| FR-09 | Removing a project revokes reads immediately and initiates tracked data cleanup. |

## Proposed nonfunctional goals

These are initial targets to validate against a benchmark repository and selected LLM provider, not measured performance claims.

- Cached project/job status: p95 response time under 500 ms in a controlled load test.
- First useful answer content: p95 under 10 seconds for the agreed evaluation workload; external provider latency is recorded separately.
- Repository size, concurrency, indexing and availability targets are specified in the baseline decisions and must be benchmarked before release.
- Never expose repository secrets in logs, telemetry labels, or user-visible errors.
- Support keyboard access, readable loading/error states, and accessible component labels.

## Success measurement

Maintain an evaluation set of repository questions with expected supporting files. Measure retrieval relevance, citation correctness, unsupported claims, answer latency, and cost per answer. Compare developer task-completion time with and without the tool before claiming productivity gains.

## Dependencies and unresolved inputs

Use the selected defaults in [Baseline Decisions](18-baseline-decisions-and-limits.md) and the [Configuration Handoff](27-configuration-and-toolchain.md). Real credentials, endpoints and processor approval are deployment inputs. Validate user needs and measured outcomes before release; documentation does not fabricate customer acceptance.
