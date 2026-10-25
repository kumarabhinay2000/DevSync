# DevSync AI — Low-Level System Design (LLD)

Date: 25 October 2026. Scope: modules, interfaces, entities, algorithms, transactions and error behavior. Names below are implementation design targets, not existing classes.

## 1. Module boundaries

Backend package root `com.devsync`: `identity`, `workspace`, `authorization`, `integration.github`, `project`, `indexing`, `jobs`, `conversation`, `analysis`, `proposal`, `approval`, `tools`, `budget`, `cleanup`, `audit`, `outbox`, `shared`. Each feature separates HTTP/RPC adapter, application service, domain model and persistence adapter. Controllers never call vector/model providers directly.

Python package root `devsync_ai`: `api`, `rpc`, `orchestration`, `retrieval`, `parsing`, `chunking`, `embeddings`, `vectors`, `tools`, `mcp`, `workers`, `sandbox`, `telemetry`, `config`. FastAPI health/admin and gRPC methods invoke shared application services rather than duplicating business rules.

Frontend: `app` shell/routes/providers, `features` for project/chat/jobs/findings/review/settings, `components/ui` shadcn primitives, `components/domain` reusable product components, `lib/api` typed clients and problem mapping, `lib/auth` in-memory identity, `styles` semantic tokens. Server resources are not copied into unrelated global mutable stores.

## 2. Core backend interfaces

| Interface / service | Main methods | Required invariant |
|---|---|---|
| AuthorizationService | requireProjectAction(principal, project, action), requireConversationOwner(...) | Current membership + explicit grant + nondeleted scope |
| GithubInstallationService | startSetup, verifySetup, connectInstallation, resolveCommit | Authenticated administrator controls installation; immutable SHA |
| IndexingService | requestIndex, completeIndex | Idempotent intent and validated nonregressing activation |
| JobLeaseService | claim, renew, reportProgress, requestCancel | Compare-and-set state and current attempt capability |
| ConversationService | create, ask, listMessages, delete | Owner-private conversation, pinned generation, durable result |
| BudgetService | reserve, reconcile, markUncertain | Atomic workspace/day limits including in-flight reservations |
| ProposalService | createImmutableProposal, submitTests, getDiff | Exact bytes/hash/base provenance |
| ApprovalService | decide, validateForAction, consume | Actor/action/repository/hash/base/expiry binding |
| PullRequestService | createOrReconcile | No duplicate external write after ambiguous timeout |
| OutboxRelay | claimBatch, publish, markPublished | At-least-once publication without losing committed intent |
| CleanupService | tombstoneAndSchedule, executeManifest | Immediate denial plus retryable tracked removal |

Dependencies are injected through interfaces; repository classes expose scoped queries rather than unrestricted `findAll`. DTOs do not serialize persistence entities or credential references.

## 3. Principal domain models

`PrincipalContext(userId, issuer, subject)` identifies the caller. `ProjectScope(workspaceId, projectId, authEpoch)` identifies current scope. `GenerationRef(generationId, commitSha, modelConfigHash, chunkerVersion)` fixes source/search configuration. `JobLease(jobId, attempt, tokenHash, expiresAt)` binds one attempt. `ApprovalBinding(repositoryId, proposalId, patchHash, baseSha, action, actorId, expiresAt)` fixes a write capability. Never infer permission from possession of an ID.

Database models include users/workspaces/grants, integrations/setup sessions, generations/files/chunks/vectors, jobs/events/outbox/deduplication, conversations/messages/citations, findings/artifacts/proposals/approvals/tests/PRs, MCP/audit/spend/cleanup. UUIDs map through explicit DTO fields; line ranges are 1-based inclusive; timestamps are UTC instants.

## 4. Python provider contracts

| Contract | Interface intent |
|---|---|
| Parser | parse(path, language, source) → syntax units + parse quality + source spans |
| Chunker | chunk(units, source, config) → deterministic bounded chunks |
| EmbeddingProvider | embedBatch(texts, modelConfig) → dimension-checked finite vectors + usage |
| VectorStore | upsertGeneration, searchScoped, deleteGeneration |
| RetrievalService | retrieve(question, validatedScope, generation, budget) → canonical evidence |
| LlmProvider | generate(messages, toolDeclarations, budget, deadline) → structured result + usage |
| ToolGateway | execute(toolName, arguments, trustedContext) → validated normalized output |
| McpAdapter | discoverApprovedSchema, invokeApprovedTool, normalizeResult |
| AnswerOrchestrator | answer(request, validatedExecutionContext) → text, citations, insufficiency |

pgvector and Pinecone implement the same VectorStore behavior. Search always accepts a mandatory scoped generation, never an optional tenant filter. MCP and native tools pass through the same gateway. The model never supplies trustedContext.

## 5. Index request transaction

```text
authorize maintainer; validate integration access and repository limits
resolve branch to immutable SHA outside the database transaction
begin transaction
  lock project; recheck authorization epoch and deletion state
  check idempotency key + canonical request hash
  reject conflicting active index job
  create BUILDING generation and QUEUED job
  set desired_generation_id
  insert outbox command and durable idempotency resource reference
commit
return 202 job DTO
```

External resolution can fail before intent creation. If access changes between resolution and commit, the epoch/revalidation rejects the request. Kafka relay publishes committed outbox only; a publish timeout may duplicate delivery and must not lose the event.

## 6. Worker claim, renewal and completion

Claim locks the job and accepts only eligible QUEUED or safely reclaimed work, checks project policy, increments attempt, creates a random capability with hash stored server-side and sets a 60-second lease. Renew every 20 seconds validates capability, lease and cancellation; issue refreshed signed execution context as needed. Maximum three attempts.

Completion verifies capability, job/generation ownership, SHA, actual canonical counts and embedding readiness. In one transaction lock project/job, reject stale scope/attempt, compare desired generation, switch old/new generation status and active pointer, mark job terminal and write outcome outbox. Generic progress cannot mark an INDEX job successful and bypass validation. Failed/cancelled work never activates a partial generation.

Deduplication records become final only alongside durable acceptance or terminal handling. A worker crash cannot permanently consume an event while leaving no claim/retry route. Manual retry creates a new job and request key linked to the original.

## 7. Retrieval and answer algorithm

Capture active generation under current grants. Persist user message/idempotency intent, reserve worst-case tokens/cost and call AI outside transaction. AI verifies service identity and signed context, embeds question using generation configuration, retrieves 20 filtered candidates, ownership-revalidates chunk IDs, deduplicates overlapping lines, selects up to 8 chunks within 12,000 context tokens and bounds history to 2,000 tokens.

Use structured prompt layers with untrusted code/tool evidence. Output budget starts at 2,000 tokens; provider adapter also enforces actual model capacity. Up to six tool calls, each within policy/deadline/result cap. Validate answer schema and every chunk/range; one format repair maximum. Backend persists the validated assistant message/citation snapshots before returning success and reconciles usage. Uncertain provider charge remains REVIEW_REQUIRED rather than assuming free failure.

Insufficient context is a valid explicit response. Invalid citations, scope leaks and provider errors are not converted into successful answers. If source generation expires while pinned by a live request, hold a bounded reference/lease or return a controlled generation error before deleting required content.

## 8. API and RPC mapping

| Boundary | Methods | Application service |
|---|---|---|
| REST /projects/{id}/index-jobs | POST | IndexingService.requestIndex |
| REST /projects/{id}/jobs/{jobId} | GET, cancel/retry subroutes | Job service with project checks |
| REST conversation messages | GET / POST | ConversationService with owner checks |
| REST source/findings | GET | Scoped source/analysis readers |
| REST proposals/approvals/PR jobs | POST/GET by route | Proposal, Approval and PullRequest services |
| Private AiService gRPC | AnswerQuestion, ValidateIndex | AnswerOrchestrator, index validation |
| Private JobProgressService gRPC | ClaimJob, RenewJobLease, ReportJobProgress, CompleteIndex | Lease and indexing services |

Existing contract files define detailed DTOs and statuses. Set RPC deadlines and cancellation propagation; authenticate both service and execution context. HTTP errors use stable code/detail/requestId, hidden resources use 404, permission-denied known actions 403, in-progress/state conflicts 409, quota 429 and dependency failures 503/504. Do not expose provider payloads or SQL errors.

## 9. Idempotency, events and cache

Idempotency key scope includes actor, workspace/project, method and route; validated canonical JSON hash distinguishes changed payloads. Retain records for 24 hours. Completed duplicates return the existing resource/result; in-progress answer duplicates return 409 with retry guidance. Conditional settings writes require current ETag.

Kafka envelope includes eventId/type/version/time, workspace/project/job IDs, trace context and bounded identifier-only payload. Commands: index, analysis, test, PR and cleanup. Outcomes: completed/failed. Use retry/dead-letter wrappers, finite backoff and permanent-error classification. Partition by project where ordering matters, but rely on database validation for correctness.

Redis caches are scoped/versioned and expiring. Authoritative authorization, budget reservations and durable job state are never replaced by cache results. Tombstone/epoch changes invalidate stale access; no unscoped vector or cache fallback.

## 10. Approval, tests and external writes

Proposal stores exact immutable diff bytes through a checksum-addressed artifact and base SHA. Tests execute only approved fixed profile entrypoints in isolated ephemeral runtimes: 2 vCPU, 2 GiB RAM, 1 GiB scratch, network denied by default and 10-minute deadline. Status distinguishes test failures from infrastructure errors.

Approval expires after 15 minutes and binds exact actor/action/repository/base/hash. Before GitHub write, recheck grants, tests, policy, base and approval; commit a single-use intent. Deterministic branch name uses proposal identity. If external response is uncertain, reconcile branch/PR metadata before retrying; an approval marked consumed for an in-flight intent cannot authorize unrelated work. No automatic merge or production deployment.

## 11. Frontend state and behavior

Route guards improve UX but API authorization remains authoritative. Key cached UI resources by workspace/project/generation/conversation identity. A route/workspace change cancels or ignores stale responses. Persist theme preference only; keep identity tokens in memory. Poll job state while active with bounded backoff and stop on terminal state; show actual server stage, not simulated percentage.

Composer keeps unsent text on recoverable failure and prevents duplicate submissions. Citation opens exact indexed source. Sanitize AI Markdown and links. Review UI shows exact patch/base/test status and requests explicit approval; updating a proposal clears local approval state immediately. All controls use semantic tokens and keyboard-accessible primitives.

## 12. Diagnostics and verification points

Propagate request/trace/job IDs through REST, gRPC, outbox and workers. Log sanitized outcome codes, timings and deployment revision; exclude source, raw prompts, bearer tokens, attempt capabilities and secrets. Export bounded operational metrics for errors, latency, backlog, lease expiry, spend and cleanup.

Verify transactional idempotency, expired lease rejection, duplicate delivery, nonregressing activation, scoped retrieval, owner-private messages, model-output validation, budget concurrency, stale approval rejection, ambiguous GitHub reconciliation and immediate post-deletion denial. These are design verification points; this file does not claim executed application tests.
