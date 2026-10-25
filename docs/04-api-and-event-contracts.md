# API and Event Contracts

Complete target definitions are supplied in [contracts](../contracts/README.md), including OpenAPI, protobuf, events and tool schemas. These are validated design artifacts, not working endpoints; implementation conformance remains a release gate.

## REST conventions

Base path `/api/v1`. Protected routes require a validated access token. Apply workspace/project authorization on every resource lookup. Use cursor pagination, bounded page sizes, request IDs, and sanitized problem responses. Never put tokens or raw source content in URLs.

| Method and route | Purpose |
|---|---|
| GET /me | Current user and workspace memberships |
| GET /workspaces/{workspaceId}/projects | Authorized project list |
| POST /workspaces/{workspaceId}/projects | Connect repository after validating integration access |
| GET /projects/{projectId} | Project and active indexing summary |
| POST /projects/{projectId}/index-jobs | Start indexing; requires Idempotency-Key |
| GET /projects/{projectId}/jobs/{jobId} | Durable job status and sanitized error |
| POST /projects/{projectId}/jobs/{jobId}/cancel | Request cooperative cancellation |
| POST /projects/{projectId}/conversations | Create a conversation |
| POST /projects/{projectId}/conversations/{conversationId}/messages | Ask a repository question |
| GET /projects/{projectId}/conversations/{conversationId}/messages | Paginated message history |
| POST /integrations/github/webhooks | Signature-verified, replay-deduplicated GitHub webhook |
| DELETE /projects/{projectId} | Revoke project access and schedule cleanup |
| POST /projects/{projectId}/analysis-jobs | Later: run configured static analysis |
| POST /projects/{projectId}/proposals/{proposalId}/approvals | Later: approve an exact patch and base revision |
| POST /projects/{projectId}/proposals/{proposalId}/pull-request-jobs | Later: execute approved branch/PR workflow |

Index request example:

```json
{"branch":"main","reason":"manual"}
```

Return `202 Accepted` with the complete Job schema, including `jobId`, `status`, and a scoped status URL. Resolve and persist the commit SHA before processing. A repeated idempotency key with a different request body returns a conflict.

Answer response example:

```json
{
  "messageId": "uuid",
  "role": "ASSISTANT",
  "content": "The request is validated in the controller before the service runs.",
  "insufficientContext": false,
  "indexGenerationId": "uuid",
  "citations": [
    {"path":"src/ExampleController.java","commitSha":"full-sha","startLine":12,"endLine":25}
  ],
  "requestId": "uuid"
}
```

The citation is illustrative. Return only references verified against retrieved source. Treat generated Markdown as untrusted output in the frontend.

Errors include 400 invalid input, 401 missing/invalid identity, 403 forbidden actions, 404 absent or hidden resources, 409 state conflict, 429 quota exceeded, and 503 unavailable dependency. Apply a consistent resource-hiding policy to prevent identifier enumeration.

## Internal gRPC

Proposed `devsync.ai.v1` service methods:

- `AnswerQuestion`: scoped execution context, question, conversation context, generation ID â†’ answer and citations; streaming can be added with a deliberate contract.
- `ValidateIndex`: generation ID and expected counts â†’ validation outcome.
- `ReportJobProgress`: worker identity, job ID, attempt token, sequence, state â†’ accepted transition; implemented by the backend job service.

Use TLS and service authentication, deadlines, bounded payloads, cancellation propagation, and versioned protobuf packages. Do not retry a mutation blindly. Incoming internal context must be authenticated and validated, not trusted because it contains a workspace ID.

## Kafka

Versioned schemas cover index, analysis, test, pull-request and cleanup commands, job completion/failure, and retry/dead-letter envelopes. The [contract index](../contracts/README.md) lists authoritative sources. Partition commands by project ID when project ordering matters. Initial command topics use 3 partitions, replication factor 1 locally and 3 in production, with min in-sync replicas 2 for production. Validate sizing and broker count before deployment.

Every envelope includes `eventId`, `eventType`, `schemaVersion`, `occurredAt`, `workspaceId`, `projectId`, `jobId`, `traceparent`, and a bounded payload. Index payload includes generation ID and commit SHA. Events carry identifiers, not credentials or full repositories.

Consumers deduplicate event IDs, verify job state, use exponential backoff with a finite attempt budget, and record dead-letter outcomes. Publish lifecycle events from a transactional outbox when they follow a database state transition.

## Tools and MCP

Initial tool names: `search_code`, `read_source_range`, `get_index_status`. Later tools: `run_tests`, `get_quality_findings`, `propose_patch`, `create_pull_request`.

Each tool declares input/output schemas, scope, timeout, maximum result size, permission requirement, side-effect classification, and audit behavior. MCP server discovery does not automatically authorize all exposed tools. Pin server configuration and enforce the same tool gateway policy for native and MCP tools.
