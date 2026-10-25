# API Semantics, Visibility, and Error Catalog

Canonical machine-readable definition: [OpenAPI](../contracts/openapi.json). It contains MVP and later-phase endpoints so implementation scope is explicit. Narrative endpoint examples in older documents are illustrative; schemas and this document govern field names and behavior.

## Common rules

- Base `/api/v1`; TLS required outside loopback development. Bearer access tokens only; identity-token substitution is rejected.
- All JSON uses UTF-8, camelCase fields, UUID identifiers and RFC3339 UTC timestamps. Do not expose credential references through ordinary read schemas.
- Resolve workspace/project/resource ownership before returning data. Return 404 for hidden resources; use 403 only for a known authorized resource with a forbidden action.
- Validate unknown request fields strictly for tool/schema-defined mutations. An empty project PATCH returns 400. Enforce `endLine >= startLine` and a maximum 500-line source response plus 64 KiB content cap; return explicit truncation or a smaller requested range, never silently falsify line ranges.
- Request/response IDs are server-issued or validated correlation values, not authorization. Sanitize header lengths and never reflect arbitrary header text into logs.
- Max JSON body 256 KiB; question 16,000 characters; pagination limit 1â€“100, default 20.
- POST creates return 201; asynchronous jobs return 202; successful deletion of a conversation/grant/integration returns 204. Project deletion returns a cleanup job with immediately revoked project reads; its status URL is a deletion-receipt route accessible only to the initiating authorized administrator.

## Endpoint access groups

Workspace list/create/me: authenticated identity; creation subject to configured quota. Membership/integration/settings/MCP/audit: workspace administrator, with owner-only promotion/removal of other owners and prevention of removing the last active owner. GitHub installation connection verifies callback state and authenticated ownership of the installation before trusting a supplied installation ID; never accept ID knowledge as proof.

Project/source/findings/job reads: explicit project grant plus current workspace membership. Conversation list/get/messages/delete: conversation owner plus project grant; no cross-user history by default. Index/analysis/proposal: maintainer. Test execution: maintainer plus TEST_RUN. Approval: PATCH_APPROVE plus current project access; PR creation additionally PR_WRITE and the action-bound unexpired approval. Project deletion requires workspace administrator plus PROJECT_DELETE. Each grant mutation is audited; users cannot grant themselves permissions beyond the grantor's authority.

Job types/results must match requested operations. Artifacts inherit project and artifact-type permissions, and test/patch output remains private repository data. Revoked/tombstoned projects deny all ordinary reads, including stale artifact links. Signed object URLs are short-lived (60 seconds) and not returned in the baseline inline artifact API; content is bounded/redacted through the backend.

## Idempotency and concurrency

Scope keys by actor, workspace/project, method and route. Store SHA-256 of validated canonical request JSON and the durable result/resource reference for 24 hours. Same key/body returns original result; different body returns IDEMPOTENCY_CONFLICT. Concurrent in-progress question requests with the same key return 409 REQUEST_IN_PROGRESS and Retry-After; persisted completed result is returned on retry. Creation retries never re-run model calls when a durable answer already exists.

PUT settings uses an ETag/If-Match revision check; missing precondition returns 428 and stale revision 412. Membership replacement follows the same revision discipline. A PATCH to project settings cannot change repository identity; reconnect through an explicitly authorized project lifecycle operation instead. Multiple index requests return INDEX_ALREADY_RUNNING unless the earlier job is terminal; desired-generation updates are transactionally ordered.

## Pagination and filtering

Cursors encode stable `(created_at,id)` boundaries, resource scope, filters and expiration, signed by backend. They expire after 15 minutes, cannot cross users/workspaces/projects, and do not grant access. List ordering is newest first unless explicitly documented; message history is ascending by creation/id for display. Snapshot pagination avoids duplicate entries during concurrent writes but does not promise a frozen database snapshot. Do not implement authorization by filtering an unbounded client-visible page.

## Stable error codes

| HTTP | Codes | Retry behavior |
|---|---|---|
| 400 | VALIDATION_FAILED, INVALID_CURSOR, INVALID_RANGE, WEBHOOK_MALFORMED | Correct request |
| 401 | UNAUTHENTICATED, TOKEN_INVALID, WEBHOOK_SIGNATURE_INVALID | Reauthenticate / correct signed delivery |
| 403 | ACTION_FORBIDDEN, PROCESSOR_NOT_APPROVED, TOOL_NOT_ALLOWED | No automatic retry |
| 404 | RESOURCE_NOT_FOUND | No automatic retry; hidden and absent indistinguishable |
| 409 | IDEMPOTENCY_CONFLICT, REQUEST_IN_PROGRESS, INDEX_ALREADY_RUNNING, STALE_BASE, APPROVAL_INVALID, GENERATION_UNAVAILABLE | Read state; only in-progress permits bounded retry |
| 412 / 428 | REVISION_MISMATCH / PRECONDITION_REQUIRED | Refresh settings and submit conditional update |
| 413 | PAYLOAD_TOO_LARGE, REPOSITORY_LIMIT_EXCEEDED | Reduce input |
| 422 | MODEL_OUTPUT_INVALID, EMBEDDING_INCOMPATIBLE | Investigate configuration/output; do not bill retry invisibly |
| 429 | RATE_LIMITED, TOKEN_BUDGET_EXCEEDED, COST_BUDGET_EXCEEDED | Retry-After where appropriate; spend limits require reset/change |
| 503 / 504 | DEPENDENCY_UNAVAILABLE / DEPENDENCY_TIMEOUT | Bounded retry with idempotency for mutations |

Problem body: `type`, `title`, `status`, stable `code`, sanitized `detail`, `requestId`. `type` uses a stable application-controlled URI/URN, not a stack-trace URL. Include no SQL, secrets, raw provider response or private source in errors. Return 500 INTERNAL_ERROR with request ID for unexpected faults and alert; do not mislabel programming errors as user validation failures.

## GitHub webhook and deletion receipts

Webhook security validates raw bytes/HMAC before parsing; maximum body size still applies. Deduplicate delivery ID for at least the Kafka retention window (7 days). Durably accept supported events; acknowledge unsupported signed events without side effects. Installation revocation blocks pending use. Push triggers only configured branches, collapses superseded queued generations, and respects project quotas.

Deletion receipt is a random UUID bound to the initiating actor/workspace and cleanup job. `/workspaces/{workspaceId}/deletion-receipts/{receiptId}` exposes only cleanup status and sanitized counts; requires current workspace admin authorization, with no source content. Keep receipts 30 days. This avoids requiring ordinary access to a tombstoned project to monitor its cleanup.

## GitHub setup proof sequence

Administrator creates a scoped setup session (10-minute expiry), browser follows the returned GitHub authorization/install flow, and SPA posts callback code/state/session/installation ID to the authenticated backend callback endpoint. Backend checks state, exchanges code server-side using the configured GitHub client, verifies that the linked GitHub user can administer the installation, and issues a single-use setup proof (5-minute expiry). The connect endpoint consumes this proof atomically. Never treat an installation ID, forged browser callback or shared state as ownership. Setup sessions store hashes, not reusable credentials. The administrator performing this flow must remain authenticated in the original workspace.
