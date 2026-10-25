# DevSync AI — API Documentation

Date: 25 October 2026. Contract version: 1.0.0. Status: target API specification, not a running API. This standalone guide documents all 56 current REST operations, public schemas, six private gRPC methods, and related event/tool boundaries. No endpoint implementation or live HTTP test is claimed.

## 1. Sources and scope

The [OpenAPI definition](../contracts/openapi.json) is the machine-readable REST source. The [protobuf definition](../contracts/proto/devsync/ai/v1/ai.proto) defines internal RPCs. [API semantics](25-api-semantics-and-errors.md) defines authorization, visibility, idempotency and state rules. This guide reproduces the current contract and explicitly distinguishes delivery phases and illustrative examples.

Base path: `/api/v1`. Local target URL: `http://localhost:8080/api/v1`; it is not active simply because it is documented. Outside loopback development use the actual configured HTTPS origin. Relative routes below append to the base path. JSON is UTF-8 with camelCase fields; timestamps are RFC3339 UTC and identifiers are UUIDs except external repository/installation IDs and reviewed test-profile IDs.

## 2. Authentication and permissions

Protected REST calls use `Authorization: Bearer <access-token>`. The browser authenticates through the configured OIDC issuer using Authorization Code + PKCE; `/login`, `/token` and `/refresh` are not DevSync API routes in the current contract. Keep the baseline browser access token in memory. An identity token is not an API access token.

Backend validates signature, issuer, audience and expiry, then current membership and resource/action permissions. Knowing an ID is never authorization. Hidden and missing resources both return 404; use 403 for a forbidden action on a resource the caller can otherwise access.

| Access label | Meaning |
|---|---|
| Authenticated | Valid identity; workspace creation remains subject to service quota |
| Workspace admin | Active OWNER/ADMIN in the specified workspace; owner-role changes and last-owner protection have additional rules |
| Project reader | Active workspace membership plus explicit project READER/MAINTAINER grant |
| Project maintainer | Project access plus MAINTAINER role |
| Conversation owner | Project access plus ownership of that conversation; project administrators cannot read others' chats implicitly |
| Additional action grant | TEST_RUN, PATCH_APPROVE, PR_WRITE or PROJECT_DELETE as appropriate |
| Signed GitHub delivery | Raw-body HMAC verification and delivery deduplication; bearer exception for webhook only |

Project creation requires current GitHub repository access and workspace-admin or explicit PROJECT_CREATE permission. Project grant administration requires an authorized workspace administrator; it does not itself grant source access. Do not delegate permissions beyond the grantor's authority.

## 3. Common headers, limits and pagination

| Header | Use |
|---|---|
| Authorization | Bearer access token on protected calls |
| Content-Type | application/json for JSON bodies; response errors use application/problem+json |
| Accept | application/json for product responses |
| Idempotency-Key | Required only on operations marked in the endpoint reference; 1–200 characters |
| If-Match | Required current ETag for settings PUT and membership POST operations marked below |
| ETag | Returned by settings/member-list reads for conditional mutation |
| Retry-After | Seconds before permitted retry on rate limits and an in-progress duplicate where applicable |
| X-Hub-Signature-256 / X-GitHub-Delivery / X-GitHub-Event | GitHub webhook-specific required headers |

Maximum JSON body: 256 KiB. Question: 1–16,000 characters. Default list limit: 20; allowed 1–100. Source range: 1-based inclusive, end >= start, at most 500 lines and 64 KiB content. Returned bounds and truncated flag must describe actual returned content. Empty project PATCH is rejected. Reject malformed/unknown mutation fields according to each strict schema.

List responses contain `items` and nullable `nextCursor`. Cursors are opaque, signed, filter/scope-bound and expire after 15 minutes. Do not build, decode or reuse a cursor in another project/user scope. Use returned nextCursor until null. Message history is ascending for display; general history lists are newest first with stable timestamp/ID ordering.

Default chat rate: 20 requests/minute/user and 100/minute/workspace; concurrency: two/user and five/workspace. Indexing: one active/project and two/workspace. Daily workspace budget starts at one million provider tokens and USD 5 when reviewed model pricing is configured; missing provider/pricing approval disables live chargeable work. These are configurable baseline limits, not measured capacity claims.

## 4. Idempotency, concurrency and asynchronous results

Scope idempotency by actor, workspace/project, method and route. Retain validated canonical request hash and durable result for 24 hours. Same key/body returns the original result; changed body returns 409 IDEMPOTENCY_CONFLICT. In-progress duplicate questions return 409 REQUEST_IN_PROGRESS with retry guidance. Retry with the original key after connection loss; use a new key for a genuinely new operation.

Conditional settings/member writes require If-Match: missing precondition returns 428, stale revision 412. Refresh the ETag and review state before resubmitting. Do not confuse ETag revision with source commit SHA.

201 creates a resource, 202 accepts durable background work, and 204 has no body. Most asynchronous operations return Job; project deletion returns DeletionReceipt. A 202 response does not mean indexing/tests/PR creation completed. Follow the returned authorized status location. Poll with bounded backoff, initially two seconds and increasing to at most ten seconds; stop on terminal state, authorization failure or navigation away.

Job states: QUEUED, RUNNING, SUCCEEDED, FAILED, CANCELLED. `cancellationRequested` is an intent until terminal cancellation is confirmed. Manual retry creates a new linked job and requires a new operation key. PR_CREATE resultResourceId is a resource identity, not automatically a browser URL; the current public contract does not define a dedicated PR-result detail route. Do not invent one in a client.

## 5. Complete REST endpoint reference

Each operation below is reproduced from the current OpenAPI, including all declared parameters, request schema, success schema/status and documented failure statuses. `mvp` means repository-Q&A baseline; `automation` is later target functionality, not an endpoint availability claim. Schema names refer to the complete field catalog in section 7.

### 5.1. GET /me

Operation ID: `getMe` · Phase: `mvp`

Permission: Authenticated.

Parameters: none declared beyond common authentication.

Request body: none.

| Success | Body | Response headers |
|---|---|---|
| 200 | Me | — |

Declared failure statuses: 400, 401, 403, 404, 409, 429, 503, 422, 500, 504.

### 5.2. GET /workspaces/{workspaceId}/projects

Operation ID: `listProjects` · Phase: `mvp`

Permission: Project reader; resource scope and artifact/operation-specific restrictions apply.

| Parameter | Location | Required | Type | Rules |
|---|---|---|---|---|
| `workspaceId` | path | Yes | string | format: uuid |
| `cursor` | query | No | string | — |
| `limit` | query | No | integer | min: 1; max: 100; default: 20 |

Request body: none.

| Success | Body | Response headers |
|---|---|---|
| 200 | ProjectPage | — |

Declared failure statuses: 400, 401, 403, 404, 409, 429, 503, 422, 500, 504.

### 5.3. POST /workspaces/{workspaceId}/projects

Operation ID: `createProject` · Phase: `mvp`

Permission: Workspace admin or PROJECT_CREATE; current repository access required.

| Parameter | Location | Required | Type | Rules |
|---|---|---|---|---|
| `workspaceId` | path | Yes | string | format: uuid |
| `Idempotency-Key` | header | Yes | string | min chars: 1; max chars: 200 |

Request body: **CreateProject**, required; Content-Type application/json.

| Success | Body | Response headers |
|---|---|---|
| 201 | Project | — |

Declared failure statuses: 400, 401, 403, 404, 409, 413, 429, 503, 422, 500, 504.

### 5.4. GET /projects/{projectId}

Operation ID: `getProject` · Phase: `mvp`

Permission: Project reader; resource scope and artifact/operation-specific restrictions apply.

| Parameter | Location | Required | Type | Rules |
|---|---|---|---|---|
| `projectId` | path | Yes | string | format: uuid |

Request body: none.

| Success | Body | Response headers |
|---|---|---|
| 200 | Project | — |

Declared failure statuses: 400, 401, 403, 404, 409, 429, 503, 422, 500, 504.

### 5.5. DELETE /projects/{projectId}

Operation ID: `deleteProject` · Phase: `mvp`

Permission: Workspace admin plus PROJECT_DELETE; immediate source-read revocation.

| Parameter | Location | Required | Type | Rules |
|---|---|---|---|---|
| `projectId` | path | Yes | string | format: uuid |

Request body: none.

| Success | Body | Response headers |
|---|---|---|
| 202 | DeletionReceipt | — |

Declared failure statuses: 400, 401, 403, 404, 409, 429, 503, 422, 500, 504.

### 5.6. PATCH /projects/{projectId}

Operation ID: `updateProject` · Phase: `mvp`

Permission: Project maintainer; cancellation/retry additionally checks job type/action permissions.

| Parameter | Location | Required | Type | Rules |
|---|---|---|---|---|
| `projectId` | path | Yes | string | format: uuid |

Request body: **ProjectUpdate**, required; Content-Type application/json.

| Success | Body | Response headers |
|---|---|---|
| 200 | Project | — |

Declared failure statuses: 400, 401, 403, 404, 409, 413, 429, 503, 422, 500, 504.

### 5.7. POST /projects/{projectId}/index-jobs

Operation ID: `createIndexJob` · Phase: `mvp`

Permission: Project maintainer; cancellation/retry additionally checks job type/action permissions.

| Parameter | Location | Required | Type | Rules |
|---|---|---|---|---|
| `projectId` | path | Yes | string | format: uuid |
| `Idempotency-Key` | header | Yes | string | min chars: 1; max chars: 200 |

Request body: **IndexRequest**, required; Content-Type application/json.

| Success | Body | Response headers |
|---|---|---|
| 202 | Job | — |

Declared failure statuses: 400, 401, 403, 404, 409, 429, 503, 422, 500, 504.

### 5.8. GET /projects/{projectId}/jobs/{jobId}

Operation ID: `getJob` · Phase: `mvp`

Permission: Project reader; resource scope and artifact/operation-specific restrictions apply.

| Parameter | Location | Required | Type | Rules |
|---|---|---|---|---|
| `projectId` | path | Yes | string | format: uuid |
| `jobId` | path | Yes | string | format: uuid |

Request body: none.

| Success | Body | Response headers |
|---|---|---|
| 200 | Job | — |

Declared failure statuses: 400, 401, 403, 404, 409, 429, 503, 422, 500, 504.

### 5.9. POST /projects/{projectId}/jobs/{jobId}/cancel

Operation ID: `cancelJob` · Phase: `mvp`

Permission: Project maintainer; cancellation/retry additionally checks job type/action permissions.

| Parameter | Location | Required | Type | Rules |
|---|---|---|---|---|
| `projectId` | path | Yes | string | format: uuid |
| `jobId` | path | Yes | string | format: uuid |

Request body: none.

| Success | Body | Response headers |
|---|---|---|
| 202 | Job | — |

Declared failure statuses: 400, 401, 403, 404, 409, 429, 503, 422, 500, 504.

### 5.10. POST /projects/{projectId}/conversations

Operation ID: `createConversation` · Phase: `mvp`

Permission: Project reader; list only conversations owned by caller.

| Parameter | Location | Required | Type | Rules |
|---|---|---|---|---|
| `projectId` | path | Yes | string | format: uuid |

Request body: **CreateConversation**, required; Content-Type application/json.

| Success | Body | Response headers |
|---|---|---|
| 201 | Conversation | — |

Declared failure statuses: 400, 401, 403, 404, 409, 429, 503, 422, 500, 504.

### 5.11. GET /projects/{projectId}/conversations

Operation ID: `listConversations` · Phase: `mvp`

Permission: Project reader; list only conversations owned by caller.

| Parameter | Location | Required | Type | Rules |
|---|---|---|---|---|
| `projectId` | path | Yes | string | format: uuid |
| `cursor` | query | No | string | max chars: 2000 |
| `limit` | query | No | integer | min: 1; max: 100; default: 20 |

Request body: none.

| Success | Body | Response headers |
|---|---|---|
| 200 | ConversationPage | — |

Declared failure statuses: 400, 401, 403, 404, 409, 413, 429, 503, 422, 500, 504.

### 5.12. GET /projects/{projectId}/conversations/{conversationId}/messages

Operation ID: `listMessages` · Phase: `mvp`

Permission: Conversation owner plus current project access.

| Parameter | Location | Required | Type | Rules |
|---|---|---|---|---|
| `projectId` | path | Yes | string | format: uuid |
| `conversationId` | path | Yes | string | format: uuid |
| `cursor` | query | No | string | — |
| `limit` | query | No | integer | min: 1; max: 100; default: 20 |

Request body: none.

| Success | Body | Response headers |
|---|---|---|
| 200 | MessagePage | — |

Declared failure statuses: 400, 401, 403, 404, 409, 429, 503, 422, 500, 504.

### 5.13. POST /projects/{projectId}/conversations/{conversationId}/messages

Operation ID: `askQuestion` · Phase: `mvp`

Permission: Conversation owner plus current project access.

| Parameter | Location | Required | Type | Rules |
|---|---|---|---|---|
| `projectId` | path | Yes | string | format: uuid |
| `conversationId` | path | Yes | string | format: uuid |
| `Idempotency-Key` | header | Yes | string | min chars: 1; max chars: 200 |

Request body: **Question**, required; Content-Type application/json.

| Success | Body | Response headers |
|---|---|---|
| 200 | Message | — |

Declared failure statuses: 400, 401, 403, 404, 409, 429, 503, 422, 500, 504.

### 5.14. POST /integrations/github/webhooks

Operation ID: `receiveGithubWebhook` · Phase: `mvp`

Permission: Signed GitHub delivery; no bearer requirement.

| Parameter | Location | Required | Type | Rules |
|---|---|---|---|---|
| `X-Hub-Signature-256` | header | Yes | string | — |
| `X-GitHub-Delivery` | header | Yes | string | — |
| `X-GitHub-Event` | header | Yes | string | — |

Request body: **object**, required; Content-Type application/json.

| Success | Body | Response headers |
|---|---|---|
| 202 | No declared response body | — |

Declared failure statuses: 400, 401, 503.

Verify signature over exact raw bytes before parsing. Deduplicate delivery ID; supported events must be durably accepted before acknowledgment. Valid unsupported signed events can be acknowledged without side effects. Webhook error responses have no JSON body schema declared in current OpenAPI.

### 5.15. GET /workspaces

Operation ID: `listWorkspaces` · Phase: `mvp`

Permission: Authenticated.

| Parameter | Location | Required | Type | Rules |
|---|---|---|---|---|
| `cursor` | query | No | string | max chars: 2000 |
| `limit` | query | No | integer | min: 1; max: 100; default: 20 |

Request body: none.

| Success | Body | Response headers |
|---|---|---|
| 200 | WorkspacePage | — |

Declared failure statuses: 400, 401, 403, 404, 409, 413, 429, 503, 422, 500, 504.

### 5.16. POST /workspaces

Operation ID: `createWorkspace` · Phase: `mvp`

Permission: Authenticated.

| Parameter | Location | Required | Type | Rules |
|---|---|---|---|---|
| `Idempotency-Key` | header | Yes | string | min chars: 1; max chars: 200 |

Request body: **CreateWorkspace**, required; Content-Type application/json.

| Success | Body | Response headers |
|---|---|---|
| 201 | Workspace | — |

Declared failure statuses: 400, 401, 403, 404, 409, 413, 429, 503, 422, 500, 504.

### 5.17. GET /workspaces/{workspaceId}/members

Operation ID: `listWorkspaceMembers` · Phase: `mvp`

Permission: Workspace admin; enforce resource scope and action-specific policy.

| Parameter | Location | Required | Type | Rules |
|---|---|---|---|---|
| `workspaceId` | path | Yes | string | format: uuid |
| `cursor` | query | No | string | max chars: 2000 |
| `limit` | query | No | integer | min: 1; max: 100; default: 20 |

Request body: none.

| Success | Body | Response headers |
|---|---|---|
| 200 | MemberPage | ETag |

Declared failure statuses: 400, 401, 403, 404, 409, 413, 429, 503, 422, 500, 504.

### 5.18. POST /workspaces/{workspaceId}/members

Operation ID: `grantWorkspaceMember` · Phase: `mvp`

Permission: Workspace admin; enforce resource scope and action-specific policy.

| Parameter | Location | Required | Type | Rules |
|---|---|---|---|---|
| `workspaceId` | path | Yes | string | format: uuid |
| `Idempotency-Key` | header | Yes | string | min chars: 1; max chars: 200 |
| `If-Match` | header | Yes | string | — |

Request body: **WorkspaceMemberGrant**, required; Content-Type application/json.

| Success | Body | Response headers |
|---|---|---|
| 201 | Member | — |

Declared failure statuses: 400, 401, 403, 404, 409, 413, 429, 503, 422, 500, 504, 412, 428.

### 5.19. DELETE /workspaces/{workspaceId}/members/{userId}

Operation ID: `revokeWorkspaceMember` · Phase: `mvp`

Permission: Workspace admin; enforce resource scope and action-specific policy.

| Parameter | Location | Required | Type | Rules |
|---|---|---|---|---|
| `workspaceId` | path | Yes | string | format: uuid |
| `userId` | path | Yes | string | format: uuid |

Request body: none.

| Success | Body | Response headers |
|---|---|---|
| 204 | No declared response body | — |

Declared failure statuses: 400, 401, 403, 404, 409, 413, 429, 503, 422, 500, 504.

### 5.20. GET /workspaces/{workspaceId}/settings

Operation ID: `getWorkspaceSettings` · Phase: `mvp`

Permission: Workspace admin; enforce resource scope and action-specific policy.

| Parameter | Location | Required | Type | Rules |
|---|---|---|---|---|
| `workspaceId` | path | Yes | string | format: uuid |

Request body: none.

| Success | Body | Response headers |
|---|---|---|
| 200 | WorkspaceSettings | ETag |

Declared failure statuses: 400, 401, 403, 404, 409, 413, 429, 503, 422, 500, 504.

### 5.21. PUT /workspaces/{workspaceId}/settings

Operation ID: `updateWorkspaceSettings` · Phase: `mvp`

Permission: Workspace admin; enforce resource scope and action-specific policy.

| Parameter | Location | Required | Type | Rules |
|---|---|---|---|---|
| `workspaceId` | path | Yes | string | format: uuid |
| `If-Match` | header | Yes | string | — |

Request body: **WorkspaceSettings**, required; Content-Type application/json.

| Success | Body | Response headers |
|---|---|---|
| 200 | WorkspaceSettings | — |

Declared failure statuses: 400, 401, 403, 404, 409, 413, 429, 503, 422, 500, 504, 412, 428.

### 5.22. GET /workspaces/{workspaceId}/integrations

Operation ID: `listIntegrations` · Phase: `mvp`

Permission: Workspace admin; enforce resource scope and action-specific policy.

| Parameter | Location | Required | Type | Rules |
|---|---|---|---|---|
| `workspaceId` | path | Yes | string | format: uuid |
| `cursor` | query | No | string | max chars: 2000 |
| `limit` | query | No | integer | min: 1; max: 100; default: 20 |

Request body: none.

| Success | Body | Response headers |
|---|---|---|
| 200 | IntegrationPage | — |

Declared failure statuses: 400, 401, 403, 404, 409, 413, 429, 503, 422, 500, 504.

### 5.23. POST /workspaces/{workspaceId}/integrations/github

Operation ID: `connectGithubInstallation` · Phase: `mvp`

Permission: Workspace admin; enforce resource scope and action-specific policy.

| Parameter | Location | Required | Type | Rules |
|---|---|---|---|---|
| `workspaceId` | path | Yes | string | format: uuid |
| `Idempotency-Key` | header | Yes | string | min chars: 1; max chars: 200 |

Request body: **ConnectIntegration**, required; Content-Type application/json.

| Success | Body | Response headers |
|---|---|---|
| 201 | Integration | — |

Declared failure statuses: 400, 401, 403, 404, 409, 413, 429, 503, 422, 500, 504.

### 5.24. DELETE /workspaces/{workspaceId}/integrations/{integrationId}

Operation ID: `revokeIntegration` · Phase: `mvp`

Permission: Workspace admin; enforce resource scope and action-specific policy.

| Parameter | Location | Required | Type | Rules |
|---|---|---|---|---|
| `workspaceId` | path | Yes | string | format: uuid |
| `integrationId` | path | Yes | string | format: uuid |

Request body: none.

| Success | Body | Response headers |
|---|---|---|
| 204 | No declared response body | — |

Declared failure statuses: 400, 401, 403, 404, 409, 413, 429, 503, 422, 500, 504.

### 5.25. GET /workspaces/{workspaceId}/integrations/{integrationId}/repositories

Operation ID: `listIntegrationRepositories` · Phase: `mvp`

Permission: Workspace admin; enforce resource scope and action-specific policy.

| Parameter | Location | Required | Type | Rules |
|---|---|---|---|---|
| `workspaceId` | path | Yes | string | format: uuid |
| `integrationId` | path | Yes | string | format: uuid |
| `cursor` | query | No | string | max chars: 2000 |
| `limit` | query | No | integer | min: 1; max: 100; default: 20 |

Request body: none.

| Success | Body | Response headers |
|---|---|---|
| 200 | RepositoryPage | — |

Declared failure statuses: 400, 401, 403, 404, 409, 413, 429, 503, 422, 500, 504.

### 5.26. GET /projects/{projectId}/members

Operation ID: `listProjectMembers` · Phase: `mvp`

Permission: Workspace admin for the project workspace; no implicit source grant.

| Parameter | Location | Required | Type | Rules |
|---|---|---|---|---|
| `projectId` | path | Yes | string | format: uuid |
| `cursor` | query | No | string | max chars: 2000 |
| `limit` | query | No | integer | min: 1; max: 100; default: 20 |

Request body: none.

| Success | Body | Response headers |
|---|---|---|
| 200 | MemberPage | ETag |

Declared failure statuses: 400, 401, 403, 404, 409, 413, 429, 503, 422, 500, 504.

### 5.27. POST /projects/{projectId}/members

Operation ID: `grantProjectMember` · Phase: `mvp`

Permission: Workspace admin for the project workspace; no implicit source grant.

| Parameter | Location | Required | Type | Rules |
|---|---|---|---|---|
| `projectId` | path | Yes | string | format: uuid |
| `Idempotency-Key` | header | Yes | string | min chars: 1; max chars: 200 |
| `If-Match` | header | Yes | string | — |

Request body: **ProjectMemberGrant**, required; Content-Type application/json.

| Success | Body | Response headers |
|---|---|---|
| 201 | Member | — |

Declared failure statuses: 400, 401, 403, 404, 409, 413, 429, 503, 422, 500, 504, 412, 428.

### 5.28. DELETE /projects/{projectId}/members/{userId}

Operation ID: `revokeProjectMember` · Phase: `mvp`

Permission: Workspace admin for the project workspace; no implicit source grant.

| Parameter | Location | Required | Type | Rules |
|---|---|---|---|---|
| `projectId` | path | Yes | string | format: uuid |
| `userId` | path | Yes | string | format: uuid |

Request body: none.

| Success | Body | Response headers |
|---|---|---|
| 204 | No declared response body | — |

Declared failure statuses: 400, 401, 403, 404, 409, 413, 429, 503, 422, 500, 504.

### 5.29. GET /projects/{projectId}/branches

Operation ID: `listRepositoryBranches` · Phase: `mvp`

Permission: Project reader; resource scope and artifact/operation-specific restrictions apply.

| Parameter | Location | Required | Type | Rules |
|---|---|---|---|---|
| `projectId` | path | Yes | string | format: uuid |
| `cursor` | query | No | string | max chars: 2000 |
| `limit` | query | No | integer | min: 1; max: 100; default: 20 |

Request body: none.

| Success | Body | Response headers |
|---|---|---|
| 200 | BranchPage | — |

Declared failure statuses: 400, 401, 403, 404, 409, 413, 429, 503, 422, 500, 504.

### 5.30. GET /projects/{projectId}/jobs

Operation ID: `listJobs` · Phase: `mvp`

Permission: Project reader; resource scope and artifact/operation-specific restrictions apply.

| Parameter | Location | Required | Type | Rules |
|---|---|---|---|---|
| `projectId` | path | Yes | string | format: uuid |
| `cursor` | query | No | string | max chars: 2000 |
| `limit` | query | No | integer | min: 1; max: 100; default: 20 |

Request body: none.

| Success | Body | Response headers |
|---|---|---|
| 200 | JobPage | — |

Declared failure statuses: 400, 401, 403, 404, 409, 413, 429, 503, 422, 500, 504.

### 5.31. GET /projects/{projectId}/jobs/{jobId}/events

Operation ID: `listJobEvents` · Phase: `mvp`

Permission: Project reader; resource scope and artifact/operation-specific restrictions apply.

| Parameter | Location | Required | Type | Rules |
|---|---|---|---|---|
| `projectId` | path | Yes | string | format: uuid |
| `jobId` | path | Yes | string | format: uuid |
| `cursor` | query | No | string | max chars: 2000 |
| `limit` | query | No | integer | min: 1; max: 100; default: 20 |

Request body: none.

| Success | Body | Response headers |
|---|---|---|
| 200 | JobEventPage | — |

Declared failure statuses: 400, 401, 403, 404, 409, 413, 429, 503, 422, 500, 504.

### 5.32. POST /projects/{projectId}/jobs/{jobId}/retry

Operation ID: `retryJob` · Phase: `mvp`

Permission: Project maintainer; cancellation/retry additionally checks job type/action permissions.

| Parameter | Location | Required | Type | Rules |
|---|---|---|---|---|
| `projectId` | path | Yes | string | format: uuid |
| `jobId` | path | Yes | string | format: uuid |
| `Idempotency-Key` | header | Yes | string | min chars: 1; max chars: 200 |

Request body: none.

| Success | Body | Response headers |
|---|---|---|
| 202 | Job | — |

Declared failure statuses: 400, 401, 403, 404, 409, 413, 429, 503, 422, 500, 504.

### 5.33. DELETE /projects/{projectId}/conversations/{conversationId}

Operation ID: `deleteConversation` · Phase: `mvp`

Permission: Conversation owner plus current project access.

| Parameter | Location | Required | Type | Rules |
|---|---|---|---|---|
| `projectId` | path | Yes | string | format: uuid |
| `conversationId` | path | Yes | string | format: uuid |

Request body: none.

| Success | Body | Response headers |
|---|---|---|
| 204 | No declared response body | — |

Declared failure statuses: 400, 401, 403, 404, 409, 413, 429, 503, 422, 500, 504.

### 5.34. GET /projects/{projectId}/source

Operation ID: `readSourceRange` · Phase: `mvp`

Permission: Project reader; resource scope and artifact/operation-specific restrictions apply.

| Parameter | Location | Required | Type | Rules |
|---|---|---|---|---|
| `projectId` | path | Yes | string | format: uuid |
| `generationId` | query | Yes | string | format: uuid |
| `path` | query | Yes | string | min chars: 1; max chars: 1000 |
| `startLine` | query | Yes | integer | min: 1 |
| `endLine` | query | Yes | integer | min: 1 |

Request body: none.

| Success | Body | Response headers |
|---|---|---|
| 200 | Source | — |

Declared failure statuses: 400, 401, 403, 404, 409, 413, 429, 503, 422, 500, 504.

Additional checks: path must remain inside indexed repository; generation must be authorized; validate range and byte caps; do not change revisions implicitly.

### 5.35. POST /projects/{projectId}/analysis-jobs

Operation ID: `createAnalysisJob` · Phase: `automation`

Permission: Project maintainer; cancellation/retry additionally checks job type/action permissions.

| Parameter | Location | Required | Type | Rules |
|---|---|---|---|---|
| `projectId` | path | Yes | string | format: uuid |
| `Idempotency-Key` | header | Yes | string | min chars: 1; max chars: 200 |

Request body: **AnalysisRequest**, required; Content-Type application/json.

| Success | Body | Response headers |
|---|---|---|
| 202 | Job | — |

Declared failure statuses: 400, 401, 403, 404, 409, 413, 429, 503, 422, 500, 504.

### 5.36. GET /projects/{projectId}/findings

Operation ID: `listFindings` · Phase: `automation`

Permission: Project reader; resource scope and artifact/operation-specific restrictions apply.

| Parameter | Location | Required | Type | Rules |
|---|---|---|---|---|
| `projectId` | path | Yes | string | format: uuid |
| `cursor` | query | No | string | max chars: 2000 |
| `limit` | query | No | integer | min: 1; max: 100; default: 20 |
| `severity` | query | No | string | allowed: INFO, LOW, MEDIUM, HIGH, CRITICAL |

Request body: none.

| Success | Body | Response headers |
|---|---|---|
| 200 | FindingPage | — |

Declared failure statuses: 400, 401, 403, 404, 409, 413, 429, 503, 422, 500, 504.

### 5.37. GET /projects/{projectId}/proposals

Operation ID: `listProposals` · Phase: `automation`

Permission: Project reader; resource scope and artifact/operation-specific restrictions apply.

| Parameter | Location | Required | Type | Rules |
|---|---|---|---|---|
| `projectId` | path | Yes | string | format: uuid |
| `cursor` | query | No | string | max chars: 2000 |
| `limit` | query | No | integer | min: 1; max: 100; default: 20 |

Request body: none.

| Success | Body | Response headers |
|---|---|---|
| 200 | ProposalPage | — |

Declared failure statuses: 400, 401, 403, 404, 409, 413, 429, 503, 422, 500, 504.

### 5.38. POST /projects/{projectId}/proposals

Operation ID: `createProposal` · Phase: `automation`

Permission: Project maintainer; cancellation/retry additionally checks job type/action permissions.

| Parameter | Location | Required | Type | Rules |
|---|---|---|---|---|
| `projectId` | path | Yes | string | format: uuid |
| `Idempotency-Key` | header | Yes | string | min chars: 1; max chars: 200 |

Request body: **ProposalInput**, required; Content-Type application/json.

| Success | Body | Response headers |
|---|---|---|
| 201 | Proposal | — |

Declared failure statuses: 400, 401, 403, 404, 409, 413, 429, 503, 422, 500, 504.

### 5.39. GET /projects/{projectId}/proposals/{proposalId}

Operation ID: `getProposal` · Phase: `automation`

Permission: Project reader; resource scope and artifact/operation-specific restrictions apply.

| Parameter | Location | Required | Type | Rules |
|---|---|---|---|---|
| `projectId` | path | Yes | string | format: uuid |
| `proposalId` | path | Yes | string | format: uuid |

Request body: none.

| Success | Body | Response headers |
|---|---|---|
| 200 | Proposal | — |

Declared failure statuses: 400, 401, 403, 404, 409, 413, 429, 503, 422, 500, 504.

### 5.40. GET /projects/{projectId}/proposals/{proposalId}/diff

Operation ID: `getProposalDiff` · Phase: `automation`

Permission: Project reader; resource scope and artifact/operation-specific restrictions apply.

| Parameter | Location | Required | Type | Rules |
|---|---|---|---|---|
| `projectId` | path | Yes | string | format: uuid |
| `proposalId` | path | Yes | string | format: uuid |

Request body: none.

| Success | Body | Response headers |
|---|---|---|
| 200 | ProposalDiff | — |

Declared failure statuses: 400, 401, 403, 404, 409, 413, 429, 503, 422, 500, 504.

### 5.41. GET /projects/{projectId}/proposals/{proposalId}/approvals

Operation ID: `listApprovals` · Phase: `automation`

Permission: Project reader; resource scope and artifact/operation-specific restrictions apply.

| Parameter | Location | Required | Type | Rules |
|---|---|---|---|---|
| `projectId` | path | Yes | string | format: uuid |
| `proposalId` | path | Yes | string | format: uuid |
| `cursor` | query | No | string | max chars: 2000 |
| `limit` | query | No | integer | min: 1; max: 100; default: 20 |

Request body: none.

| Success | Body | Response headers |
|---|---|---|
| 200 | ApprovalPage | — |

Declared failure statuses: 400, 401, 403, 404, 409, 413, 429, 503, 422, 500, 504.

### 5.42. POST /projects/{projectId}/proposals/{proposalId}/approvals

Operation ID: `decideApproval` · Phase: `automation`

Permission: Current project access plus PATCH_APPROVE; exact proposal/base/hash/action binding.

| Parameter | Location | Required | Type | Rules |
|---|---|---|---|---|
| `projectId` | path | Yes | string | format: uuid |
| `proposalId` | path | Yes | string | format: uuid |
| `Idempotency-Key` | header | Yes | string | min chars: 1; max chars: 200 |

Request body: **ApprovalInput**, required; Content-Type application/json.

| Success | Body | Response headers |
|---|---|---|
| 201 | Approval | — |

Declared failure statuses: 400, 401, 403, 404, 409, 413, 429, 503, 422, 500, 504.

### 5.43. POST /projects/{projectId}/proposals/{proposalId}/pull-request-jobs

Operation ID: `createPullRequestJob` · Phase: `automation`

Permission: Current project access plus PR_WRITE and valid action-bound approval.

| Parameter | Location | Required | Type | Rules |
|---|---|---|---|---|
| `projectId` | path | Yes | string | format: uuid |
| `proposalId` | path | Yes | string | format: uuid |
| `Idempotency-Key` | header | Yes | string | min chars: 1; max chars: 200 |

Request body: **PullRequestInput**, required; Content-Type application/json.

| Success | Body | Response headers |
|---|---|---|
| 202 | Job | — |

Declared failure statuses: 400, 401, 403, 404, 409, 413, 429, 503, 422, 500, 504.

### 5.44. GET /projects/{projectId}/test-profiles

Operation ID: `listTestProfiles` · Phase: `automation`

Permission: Project reader; resource scope and artifact/operation-specific restrictions apply.

| Parameter | Location | Required | Type | Rules |
|---|---|---|---|---|
| `projectId` | path | Yes | string | format: uuid |
| `cursor` | query | No | string | max chars: 2000 |
| `limit` | query | No | integer | min: 1; max: 100; default: 20 |

Request body: none.

| Success | Body | Response headers |
|---|---|---|
| 200 | TestProfilePage | — |

Declared failure statuses: 400, 401, 403, 404, 409, 413, 429, 503, 422, 500, 504.

### 5.45. POST /projects/{projectId}/test-jobs

Operation ID: `createTestJob` · Phase: `automation`

Permission: Project maintainer plus TEST_RUN.

| Parameter | Location | Required | Type | Rules |
|---|---|---|---|---|
| `projectId` | path | Yes | string | format: uuid |
| `Idempotency-Key` | header | Yes | string | min chars: 1; max chars: 200 |

Request body: **TestInput**, required; Content-Type application/json.

| Success | Body | Response headers |
|---|---|---|
| 202 | Job | — |

Declared failure statuses: 400, 401, 403, 404, 409, 413, 429, 503, 422, 500, 504.

### 5.46. GET /projects/{projectId}/jobs/{jobId}/test-result

Operation ID: `getTestResult` · Phase: `automation`

Permission: Project reader; resource scope and artifact/operation-specific restrictions apply.

| Parameter | Location | Required | Type | Rules |
|---|---|---|---|---|
| `projectId` | path | Yes | string | format: uuid |
| `jobId` | path | Yes | string | format: uuid |

Request body: none.

| Success | Body | Response headers |
|---|---|---|
| 200 | TestResult | — |

Declared failure statuses: 400, 401, 403, 404, 409, 413, 429, 503, 422, 500, 504.

### 5.47. GET /projects/{projectId}/artifacts/{artifactId}

Operation ID: `getArtifact` · Phase: `automation`

Permission: Project reader; resource scope and artifact/operation-specific restrictions apply.

| Parameter | Location | Required | Type | Rules |
|---|---|---|---|---|
| `projectId` | path | Yes | string | format: uuid |
| `artifactId` | path | Yes | string | format: uuid |

Request body: none.

| Success | Body | Response headers |
|---|---|---|
| 200 | Artifact | — |

Declared failure statuses: 400, 401, 403, 404, 409, 413, 429, 503, 422, 500, 504.

### 5.48. GET /projects/{projectId}/tool-executions

Operation ID: `listToolExecutions` · Phase: `automation`

Permission: Project reader; resource scope and artifact/operation-specific restrictions apply.

| Parameter | Location | Required | Type | Rules |
|---|---|---|---|---|
| `projectId` | path | Yes | string | format: uuid |
| `cursor` | query | No | string | max chars: 2000 |
| `limit` | query | No | integer | min: 1; max: 100; default: 20 |

Request body: none.

| Success | Body | Response headers |
|---|---|---|
| 200 | ToolExecutionPage | — |

Declared failure statuses: 400, 401, 403, 404, 409, 413, 429, 503, 422, 500, 504.

### 5.49. GET /workspaces/{workspaceId}/mcp-servers

Operation ID: `listMcpServers` · Phase: `automation`

Permission: Workspace admin; enforce resource scope and action-specific policy.

| Parameter | Location | Required | Type | Rules |
|---|---|---|---|---|
| `workspaceId` | path | Yes | string | format: uuid |
| `cursor` | query | No | string | max chars: 2000 |
| `limit` | query | No | integer | min: 1; max: 100; default: 20 |

Request body: none.

| Success | Body | Response headers |
|---|---|---|
| 200 | McpServerPage | — |

Declared failure statuses: 400, 401, 403, 404, 409, 413, 429, 503, 422, 500, 504.

### 5.50. POST /workspaces/{workspaceId}/mcp-servers

Operation ID: `registerMcpServer` · Phase: `automation`

Permission: Workspace admin; enforce resource scope and action-specific policy.

| Parameter | Location | Required | Type | Rules |
|---|---|---|---|---|
| `workspaceId` | path | Yes | string | format: uuid |
| `Idempotency-Key` | header | Yes | string | min chars: 1; max chars: 200 |

Request body: **McpServerInput**, required; Content-Type application/json.

| Success | Body | Response headers |
|---|---|---|
| 201 | McpServer | — |

Declared failure statuses: 400, 401, 403, 404, 409, 413, 429, 503, 422, 500, 504.

### 5.51. PUT /workspaces/{workspaceId}/mcp-servers/{serverId}/status

Operation ID: `setMcpServerStatus` · Phase: `automation`

Permission: Workspace admin; enforce resource scope and action-specific policy.

| Parameter | Location | Required | Type | Rules |
|---|---|---|---|---|
| `workspaceId` | path | Yes | string | format: uuid |
| `serverId` | path | Yes | string | format: uuid |

Request body: **McpStatusInput**, required; Content-Type application/json.

| Success | Body | Response headers |
|---|---|---|
| 200 | McpServer | — |

Declared failure statuses: 400, 401, 403, 404, 409, 413, 429, 503, 422, 500, 504.

### 5.52. DELETE /workspaces/{workspaceId}/mcp-servers/{serverId}

Operation ID: `removeMcpServer` · Phase: `automation`

Permission: Workspace admin; enforce resource scope and action-specific policy.

| Parameter | Location | Required | Type | Rules |
|---|---|---|---|---|
| `workspaceId` | path | Yes | string | format: uuid |
| `serverId` | path | Yes | string | format: uuid |

Request body: none.

| Success | Body | Response headers |
|---|---|---|
| 204 | No declared response body | — |

Declared failure statuses: 400, 401, 403, 404, 409, 413, 429, 503, 422, 500, 504.

### 5.53. GET /workspaces/{workspaceId}/audit-events

Operation ID: `listAuditEvents` · Phase: `automation`

Permission: Workspace admin; enforce resource scope and action-specific policy.

| Parameter | Location | Required | Type | Rules |
|---|---|---|---|---|
| `workspaceId` | path | Yes | string | format: uuid |
| `cursor` | query | No | string | max chars: 2000 |
| `limit` | query | No | integer | min: 1; max: 100; default: 20 |

Request body: none.

| Success | Body | Response headers |
|---|---|---|
| 200 | AuditPage | — |

Declared failure statuses: 400, 401, 403, 404, 409, 413, 429, 503, 422, 500, 504.

### 5.54. GET /workspaces/{workspaceId}/deletion-receipts/{receiptId}

Operation ID: `getDeletionReceipt` · Phase: `mvp`

Permission: Workspace admin; enforce resource scope and action-specific policy.

| Parameter | Location | Required | Type | Rules |
|---|---|---|---|---|
| `workspaceId` | path | Yes | string | format: uuid |
| `receiptId` | path | Yes | string | format: uuid |

Request body: none.

| Success | Body | Response headers |
|---|---|---|
| 200 | DeletionReceipt | — |

Declared failure statuses: 400, 401, 403, 404, 409, 429, 503, 422, 500, 504.

Receipt is bound to initiating actor/workspace and remains admin-only after source access is revoked; return sanitized cleanup counts only.

### 5.55. POST /workspaces/{workspaceId}/integrations/github/setup-sessions

Operation ID: `createGithubSetupSession` · Phase: `mvp`

Permission: Workspace admin; enforce resource scope and action-specific policy.

| Parameter | Location | Required | Type | Rules |
|---|---|---|---|---|
| `workspaceId` | path | Yes | string | format: uuid |

Request body: **object**, optional; Content-Type application/json.

| Success | Body | Response headers |
|---|---|---|
| 201 | GithubSetupSession | — |

Declared failure statuses: 400, 401, 403, 404, 409, 413, 429, 503, 422, 500, 504.

### 5.56. POST /workspaces/{workspaceId}/integrations/github/setup-callback

Operation ID: `verifyGithubSetupCallback` · Phase: `mvp`

Permission: Workspace admin; enforce resource scope and action-specific policy.

| Parameter | Location | Required | Type | Rules |
|---|---|---|---|---|
| `workspaceId` | path | Yes | string | format: uuid |

Request body: **GithubSetupCallback**, required; Content-Type application/json.

| Success | Body | Response headers |
|---|---|---|
| 201 | GithubSetupProof | — |

Declared failure statuses: 400, 401, 403, 404, 409, 413, 429, 503, 422, 500, 504.

## 6. Request and response examples

Examples below use synthetic IDs/content and are not live data. Schema labels identify what to validate. IDs are illustrative and must be replaced with real authorized resources. No credentials are embedded.

### Create a workspace request

Schema: `CreateWorkspace`.

```json
{
  "name": "DevSync team"
}
```

### Created workspace response

Schema: `Workspace`.

```json
{
  "id": "11111111-1111-4111-8111-111111111111",
  "name": "DevSync team"
}
```

### Connect a repository request

Schema: `CreateProject`.

```json
{
  "name": "Example service",
  "integrationId": "11111111-1111-4111-8111-111111111111",
  "repositoryExternalId": "123456789",
  "branch": "main"
}
```

### Project response

Schema: `Project`.

```json
{
  "id": "22222222-2222-4222-8222-222222222222",
  "workspaceId": "11111111-1111-4111-8111-111111111111",
  "name": "Example service",
  "repositoryExternalId": "123456789",
  "defaultBranch": "main",
  "activeGenerationId": "33333333-3333-4333-8333-333333333333",
  "desiredGenerationId": "33333333-3333-4333-8333-333333333333"
}
```

### Start indexing request

Schema: `IndexRequest`.

```json
{
  "branch": "main",
  "reason": "manual"
}
```

### Index accepted response

Schema: `Job`.

```json
{
  "jobId": "44444444-4444-4444-8444-444444444444",
  "status": "QUEUED",
  "statusUrl": "/api/v1/projects/22222222-2222-4222-8222-222222222222/jobs/44444444-4444-4444-8444-444444444444",
  "errorCode": null,
  "type": "INDEX",
  "attempt": 0,
  "cancellationRequested": false,
  "resultResourceId": null
}
```

### Create conversation request

Schema: `CreateConversation`.

```json
{
  "title": "Understand repository access"
}
```

### Ask a question request

Schema: `Question`.

```json
{
  "question": "Where is repository access checked?"
}
```

### Illustrative cited answer response

Schema: `Message`.

```json
{
  "messageId": "11111111-1111-4111-8111-111111111111",
  "role": "ASSISTANT",
  "content": "The example access policy checks membership before allowing repository reads.",
  "indexGenerationId": "33333333-3333-4333-8333-333333333333",
  "citations": [
    {
      "path": "src/ExampleAccessPolicy.java",
      "commitSha": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      "startLine": 12,
      "endLine": 25
    }
  ],
  "insufficientContext": false,
  "requestId": "11111111-1111-4111-8111-111111111111"
}
```

### Insufficient context response

Schema: `Message`.

```json
{
  "messageId": "11111111-1111-4111-8111-111111111111",
  "role": "ASSISTANT",
  "content": "The indexed context does not establish that behavior.",
  "indexGenerationId": "33333333-3333-4333-8333-333333333333",
  "citations": [],
  "insufficientContext": true,
  "requestId": "11111111-1111-4111-8111-111111111111"
}
```

### Source range response

Schema: `Source`.

```json
{
  "path": "src/ExampleAccessPolicy.java",
  "commitSha": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
  "generationId": "33333333-3333-4333-8333-333333333333",
  "startLine": 12,
  "endLine": 12,
  "content": "// Illustrative source only",
  "truncated": false
}
```

### Approve exact patch request

Schema: `ApprovalInput`.

```json
{
  "decision": "APPROVE",
  "patchHash": "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
  "baseCommitSha": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
  "action": "CREATE_PULL_REQUEST"
}
```

### Create PR job request

Schema: `PullRequestInput`.

```json
{
  "approvalId": "11111111-1111-4111-8111-111111111111",
  "title": "Improve access validation",
  "body": "Reviewed immutable proposal with required tests."
}
```

### Project deletion accepted response

Schema: `DeletionReceipt`.

```json
{
  "receiptId": "11111111-1111-4111-8111-111111111111",
  "jobId": "44444444-4444-4444-8444-444444444444",
  "status": "QUEUED",
  "cleanupCounts": {}
}
```

### Rate-limit problem response

Schema: `Problem`.

```json
{
  "type": "urn:devsync:problem:rate-limited",
  "title": "Request limit exceeded",
  "status": 429,
  "code": "RATE_LIMITED",
  "detail": "Retry after the supplied Retry-After interval.",
  "requestId": "11111111-1111-4111-8111-111111111111"
}
```

### Paginated list response

Schema: `WorkspacePage`.

```json
{
  "items": [
    {
      "id": "11111111-1111-4111-8111-111111111111",
      "name": "DevSync team"
    }
  ],
  "nextCursor": null
}
```

### Illustrative HTTP calls

These HTTP request examples are documentation, not commands that provision or run the system. Replace placeholders with authorized values; never paste real bearer tokens into committed files.

```http
GET /api/v1/me HTTP/1.1
Host: localhost:8080
Authorization: Bearer <access-token>
Accept: application/json
```

```http
POST /api/v1/projects/<projectId>/index-jobs HTTP/1.1
Host: localhost:8080
Authorization: Bearer <access-token>
Content-Type: application/json
Idempotency-Key: index-main-request-001

{"branch":"main","reason":"manual"}
```

```http
PUT /api/v1/workspaces/<workspaceId>/settings HTTP/1.1
Host: localhost:8080
Authorization: Bearer <access-token>
Content-Type: application/json
If-Match: "<etag-from-settings-read>"

{"allowPrivateSource":false,"approvedProcessorIds":[],"dailyTokenLimit":1000000,"dailyCostLimitUsd":5}
```

## 7. Complete REST schema catalog

Every schema in current OpenAPI is included below. Required means field presence, not non-null: nullable fields still appear when required. Arrays and reference objects use the named schema recursively. Unless shown as an open map, objects reject undeclared fields. Enum values are exact/case-sensitive. Field-level schemas do not replace cross-field rules such as endLine >= startLine or approval hash/base matching.

### Problem

| Field | Type | Required | Constraints |
|---|---|---|---|
| `type` | string | Yes | — |
| `title` | string | Yes | — |
| `status` | integer | Yes | min: 400; max: 599 |
| `code` | string | Yes | — |
| `detail` | string | Yes | — |
| `requestId` | string | Yes | format: uuid |

### Project

| Field | Type | Required | Constraints |
|---|---|---|---|
| `id` | string | Yes | format: uuid |
| `workspaceId` | string | Yes | format: uuid |
| `name` | string | Yes | — |
| `repositoryExternalId` | string | Yes | — |
| `defaultBranch` | string | Yes | — |
| `activeGenerationId` | string or null | Yes | format: uuid |
| `desiredGenerationId` | string or null | Yes | format: uuid |

### ProjectPage

| Field | Type | Required | Constraints |
|---|---|---|---|
| `items` | array<Project> | Yes | — |
| `nextCursor` | string or null | Yes | — |

### Membership

| Field | Type | Required | Constraints |
|---|---|---|---|
| `workspaceId` | string | Yes | format: uuid |
| `role` | string | Yes | allowed: OWNER, ADMIN, MEMBER |

### Me

| Field | Type | Required | Constraints |
|---|---|---|---|
| `id` | string | Yes | format: uuid |
| `displayName` | string | Yes | — |
| `memberships` | array<Membership> | Yes | — |

### CreateProject

| Field | Type | Required | Constraints |
|---|---|---|---|
| `name` | string | Yes | min chars: 1; max chars: 120 |
| `integrationId` | string | Yes | format: uuid |
| `repositoryExternalId` | string | Yes | — |
| `branch` | string | Yes | min chars: 1; max chars: 255 |

### IndexRequest

| Field | Type | Required | Constraints |
|---|---|---|---|
| `branch` | string | Yes | min chars: 1; max chars: 255 |
| `reason` | string | No | allowed: manual |

### Job

| Field | Type | Required | Constraints |
|---|---|---|---|
| `jobId` | string | Yes | format: uuid |
| `status` | string | Yes | allowed: QUEUED, RUNNING, SUCCEEDED, FAILED, CANCELLED |
| `statusUrl` | string | Yes | — |
| `errorCode` | string or null | Yes | — |
| `type` | string | Yes | allowed: INDEX, ANALYSIS, TEST, PR_CREATE, CLEANUP |
| `attempt` | integer | Yes | min: 0 |
| `cancellationRequested` | boolean | Yes | — |
| `resultResourceId` | string or null | Yes | — |

### Conversation

| Field | Type | Required | Constraints |
|---|---|---|---|
| `id` | string | Yes | format: uuid |
| `projectId` | string | Yes | format: uuid |
| `ownerId` | string | Yes | format: uuid |
| `title` | string | Yes | — |
| `createdAt` | string | Yes | format: date-time |

### CreateConversation

| Field | Type | Required | Constraints |
|---|---|---|---|
| `title` | string | No | max chars: 200 |

### Question

| Field | Type | Required | Constraints |
|---|---|---|---|
| `question` | string | Yes | min chars: 1; max chars: 16000 |

### Citation

| Field | Type | Required | Constraints |
|---|---|---|---|
| `path` | string | Yes | — |
| `commitSha` | string | Yes | — |
| `startLine` | integer | Yes | min: 1 |
| `endLine` | integer | Yes | min: 1 |

### Message

| Field | Type | Required | Constraints |
|---|---|---|---|
| `messageId` | string | Yes | format: uuid |
| `role` | string | Yes | allowed: USER, ASSISTANT |
| `content` | string | Yes | — |
| `indexGenerationId` | string or null | Yes | format: uuid |
| `citations` | array<Citation> | Yes | — |
| `insufficientContext` | boolean | Yes | — |
| `requestId` | string | Yes | format: uuid |

### MessagePage

| Field | Type | Required | Constraints |
|---|---|---|---|
| `items` | array<Message> | Yes | — |
| `nextCursor` | string or null | Yes | — |

### Workspace

| Field | Type | Required | Constraints |
|---|---|---|---|
| `id` | string | Yes | format: uuid |
| `name` | string | Yes | — |

### WorkspacePage

| Field | Type | Required | Constraints |
|---|---|---|---|
| `items` | array<Workspace> | Yes | — |
| `nextCursor` | string or null | Yes | — |

### CreateWorkspace

| Field | Type | Required | Constraints |
|---|---|---|---|
| `name` | string | Yes | min chars: 1; max chars: 120 |

### Member

| Field | Type | Required | Constraints |
|---|---|---|---|
| `userId` | string | Yes | format: uuid |
| `role` | string | Yes | allowed: OWNER, ADMIN, MEMBER, MAINTAINER, READER |
| `permissions` | array<string> | Yes | — |

### MemberPage

| Field | Type | Required | Constraints |
|---|---|---|---|
| `items` | array<Member> | Yes | — |
| `nextCursor` | string or null | Yes | — |

### WorkspaceMemberGrant

| Field | Type | Required | Constraints |
|---|---|---|---|
| `userId` | string | Yes | format: uuid |
| `role` | string | Yes | allowed: OWNER, ADMIN, MEMBER |
| `permissions` | array<string> | Yes | — |

### ProjectMemberGrant

| Field | Type | Required | Constraints |
|---|---|---|---|
| `userId` | string | Yes | format: uuid |
| `role` | string | Yes | allowed: MAINTAINER, READER |
| `permissions` | array<string> | Yes | — |

### Integration

| Field | Type | Required | Constraints |
|---|---|---|---|
| `id` | string | Yes | format: uuid |
| `provider` | string | Yes | allowed: GITHUB |
| `installationId` | string | Yes | — |
| `status` | string | Yes | allowed: ACTIVE, REVOKED, ERROR |

### IntegrationPage

| Field | Type | Required | Constraints |
|---|---|---|---|
| `items` | array<Integration> | Yes | — |
| `nextCursor` | string or null | Yes | — |

### ConnectIntegration

| Field | Type | Required | Constraints |
|---|---|---|---|
| `installationId` | string | Yes | pattern: ^[0-9]+$ |
| `setupToken` | string | Yes | min chars: 1; max chars: 4096; write-only; redact from logs |

### Repository

| Field | Type | Required | Constraints |
|---|---|---|---|
| `externalId` | string | Yes | — |
| `name` | string | Yes | — |
| `private` | boolean | Yes | — |
| `defaultBranch` | string | Yes | — |

### RepositoryPage

| Field | Type | Required | Constraints |
|---|---|---|---|
| `items` | array<Repository> | Yes | — |
| `nextCursor` | string or null | Yes | — |

### Branch

| Field | Type | Required | Constraints |
|---|---|---|---|
| `name` | string | Yes | — |
| `commitSha` | string | Yes | — |

### BranchPage

| Field | Type | Required | Constraints |
|---|---|---|---|
| `items` | array<Branch> | Yes | — |
| `nextCursor` | string or null | Yes | — |

### ProjectUpdate

| Field | Type | Required | Constraints |
|---|---|---|---|
| `name` | string | No | min chars: 1; max chars: 120 |
| `defaultBranch` | string | No | min chars: 1; max chars: 255 |

### JobPage

| Field | Type | Required | Constraints |
|---|---|---|---|
| `items` | array<Job> | Yes | — |
| `nextCursor` | string or null | Yes | — |

### JobEvent

| Field | Type | Required | Constraints |
|---|---|---|---|
| `sequence` | integer | Yes | min: 1 |
| `attempt` | integer | Yes | min: 1 |
| `stage` | string | Yes | — |
| `occurredAt` | string | Yes | format: date-time |
| `errorCode` | string or null | Yes | — |

### JobEventPage

| Field | Type | Required | Constraints |
|---|---|---|---|
| `items` | array<JobEvent> | Yes | — |
| `nextCursor` | string or null | Yes | — |

### ConversationPage

| Field | Type | Required | Constraints |
|---|---|---|---|
| `items` | array<Conversation> | Yes | — |
| `nextCursor` | string or null | Yes | — |

### Source

| Field | Type | Required | Constraints |
|---|---|---|---|
| `path` | string | Yes | — |
| `commitSha` | string | Yes | — |
| `generationId` | string | Yes | format: uuid |
| `startLine` | integer | Yes | min: 1 |
| `endLine` | integer | Yes | min: 1 |
| `content` | string | Yes | — |
| `truncated` | boolean | Yes | — |

### Finding

| Field | Type | Required | Constraints |
|---|---|---|---|
| `id` | string | Yes | format: uuid |
| `jobId` | string | Yes | format: uuid |
| `tool` | string | Yes | allowed: SONARQUBE |
| `ruleId` | string | Yes | — |
| `severity` | string | Yes | allowed: INFO, LOW, MEDIUM, HIGH, CRITICAL |
| `path` | string | Yes | — |
| `line` | integer | Yes | min: 1 |
| `message` | string | Yes | — |
| `commitSha` | string | Yes | — |

### FindingPage

| Field | Type | Required | Constraints |
|---|---|---|---|
| `items` | array<Finding> | Yes | — |
| `nextCursor` | string or null | Yes | — |

### AnalysisRequest

| Field | Type | Required | Constraints |
|---|---|---|---|
| `generationId` | string | Yes | format: uuid |
| `profile` | string | Yes | allowed: DEFAULT |

### ProposalInput

| Field | Type | Required | Constraints |
|---|---|---|---|
| `baseCommitSha` | string | Yes | pattern: ^[0-9a-f]{40,64}$ |
| `diff` | string | Yes | min chars: 1; max chars: 200000 |
| `summary` | string | Yes | min chars: 1; max chars: 2000 |

### Proposal

| Field | Type | Required | Constraints |
|---|---|---|---|
| `id` | string | Yes | format: uuid |
| `projectId` | string | Yes | format: uuid |
| `baseCommitSha` | string | Yes | — |
| `patchHash` | string | Yes | — |
| `status` | string | Yes | allowed: DRAFT, TESTING, TEST_FAILED, READY_FOR_REVIEW, APPROVED, PR_CREATING, PR_CREATED, REJECTED, CANCELLED |
| `summary` | string | Yes | — |

### ProposalPage

| Field | Type | Required | Constraints |
|---|---|---|---|
| `items` | array<Proposal> | Yes | — |
| `nextCursor` | string or null | Yes | — |

### ProposalDiff

| Field | Type | Required | Constraints |
|---|---|---|---|
| `proposalId` | string | Yes | format: uuid |
| `patchHash` | string | Yes | — |
| `baseCommitSha` | string | Yes | — |
| `diff` | string | Yes | — |

### ApprovalInput

| Field | Type | Required | Constraints |
|---|---|---|---|
| `decision` | string | Yes | allowed: APPROVE, REJECT |
| `patchHash` | string | Yes | pattern: ^[0-9a-f]{64}$ |
| `baseCommitSha` | string | Yes | — |
| `action` | string | Yes | allowed: CREATE_PULL_REQUEST |

### Approval

| Field | Type | Required | Constraints |
|---|---|---|---|
| `id` | string | Yes | format: uuid |
| `proposalId` | string | Yes | format: uuid |
| `actorId` | string | Yes | format: uuid |
| `decision` | string | Yes | allowed: APPROVE, REJECT |
| `expiresAt` | string | Yes | format: date-time |
| `patchHash` | string | Yes | — |
| `baseCommitSha` | string | Yes | — |

### ApprovalPage

| Field | Type | Required | Constraints |
|---|---|---|---|
| `items` | array<Approval> | Yes | — |
| `nextCursor` | string or null | Yes | — |

### PullRequestInput

| Field | Type | Required | Constraints |
|---|---|---|---|
| `approvalId` | string | Yes | format: uuid |
| `title` | string | Yes | min chars: 1; max chars: 200 |
| `body` | string | Yes | max chars: 10000 |

### TestProfile

| Field | Type | Required | Constraints |
|---|---|---|---|
| `id` | string | Yes | — |
| `description` | string | Yes | — |
| `imageDigest` | string | Yes | — |
| `timeoutSeconds` | integer | Yes | max: 600 |

### TestProfilePage

| Field | Type | Required | Constraints |
|---|---|---|---|
| `items` | array<TestProfile> | Yes | — |
| `nextCursor` | string or null | Yes | — |

### TestInput

| Field | Type | Required | Constraints |
|---|---|---|---|
| `proposalId` | string | Yes | format: uuid |
| `testProfileId` | string | Yes | — |

### TestResult

| Field | Type | Required | Constraints |
|---|---|---|---|
| `jobId` | string | Yes | format: uuid |
| `outcome` | string | Yes | allowed: PENDING, PASS, FAIL, ERROR, TIMEOUT, CANCELLED |
| `summary` | string | Yes | — |
| `artifactId` | string or null | Yes | format: uuid |

### Artifact

| Field | Type | Required | Constraints |
|---|---|---|---|
| `id` | string | Yes | format: uuid |
| `kind` | string | Yes | allowed: TEST_LOG, PATCH, REPORT |
| `contentType` | string | Yes | — |
| `content` | string | Yes | — |
| `truncated` | boolean | Yes | — |

### AuditEvent

| Field | Type | Required | Constraints |
|---|---|---|---|
| `id` | string | Yes | format: uuid |
| `actorId` | string or null | Yes | format: uuid |
| `action` | string | Yes | — |
| `resourceId` | string | Yes | — |
| `occurredAt` | string | Yes | format: date-time |
| `outcome` | string | Yes | — |

### AuditPage

| Field | Type | Required | Constraints |
|---|---|---|---|
| `items` | array<AuditEvent> | Yes | — |
| `nextCursor` | string or null | Yes | — |

### WorkspaceSettings

| Field | Type | Required | Constraints |
|---|---|---|---|
| `allowPrivateSource` | boolean | Yes | — |
| `approvedProcessorIds` | array<string> | Yes | — |
| `dailyTokenLimit` | integer | Yes | min: 1; max: 100000000 |
| `dailyCostLimitUsd` | number | Yes | min: 0; max: 10000; minimum exclusive |

### McpServerInput

| Field | Type | Required | Constraints |
|---|---|---|---|
| `name` | string | Yes | min chars: 1; max chars: 120 |
| `endpoint` | string | Yes | format: uri |
| `credentialRef` | string | Yes | — |
| `allowedTools` | array<string> | Yes | max items: 50 |
| `schemaFingerprint` | string | Yes | pattern: ^[0-9a-f]{64}$ |

### McpServer

| Field | Type | Required | Constraints |
|---|---|---|---|
| `id` | string | Yes | format: uuid |
| `name` | string | Yes | — |
| `status` | string | Yes | allowed: DISABLED, PENDING_REVIEW, ENABLED, ERROR |
| `allowedTools` | array<string> | Yes | — |
| `schemaFingerprint` | string | Yes | — |

### McpServerPage

| Field | Type | Required | Constraints |
|---|---|---|---|
| `items` | array<McpServer> | Yes | — |
| `nextCursor` | string or null | Yes | — |

### McpStatusInput

| Field | Type | Required | Constraints |
|---|---|---|---|
| `status` | string | Yes | allowed: DISABLED, ENABLED |
| `approvedSchemaFingerprint` | string | Yes | pattern: ^[0-9a-f]{64}$ |

### ToolExecution

| Field | Type | Required | Constraints |
|---|---|---|---|
| `id` | string | Yes | format: uuid |
| `toolName` | string | Yes | — |
| `outcome` | string | Yes | — |
| `durationMs` | integer | Yes | min: 0 |
| `occurredAt` | string | Yes | format: date-time |

### ToolExecutionPage

| Field | Type | Required | Constraints |
|---|---|---|---|
| `items` | array<ToolExecution> | Yes | — |
| `nextCursor` | string or null | Yes | — |

### DeletionReceipt

| Field | Type | Required | Constraints |
|---|---|---|---|
| `receiptId` | string | Yes | format: uuid |
| `jobId` | string | Yes | format: uuid |
| `status` | string | Yes | allowed: QUEUED, RUNNING, SUCCEEDED, FAILED, CANCELLED |
| `cleanupCounts` | object | Yes | Map values: integer; min: 0 |

### GithubSetupSession

| Field | Type | Required | Constraints |
|---|---|---|---|
| `id` | string | Yes | format: uuid |
| `authorizationUrl` | string | Yes | format: uri |
| `expiresAt` | string | Yes | format: date-time |

### GithubSetupCallback

| Field | Type | Required | Constraints |
|---|---|---|---|
| `setupSessionId` | string | Yes | format: uuid |
| `code` | string | Yes | min chars: 1; max chars: 4096; write-only; redact from logs |
| `state` | string | Yes | min chars: 1; max chars: 4096; write-only; redact from logs |
| `installationId` | string | Yes | pattern: ^[0-9]+$ |

### GithubSetupProof

| Field | Type | Required | Constraints |
|---|---|---|---|
| `setupToken` | string | Yes | — |
| `expiresAt` | string | Yes | format: date-time |

## 8. Error handling and retry policy

Normal product errors use Problem with Content-Type application/problem+json. Never expose SQL, stack traces, raw provider messages, secrets or private source. Stable requestId connects a user-visible error to authorized diagnostics.

| HTTP | Stable codes | Client behavior |
|---|---|---|
| 400 | VALIDATION_FAILED, INVALID_CURSOR, INVALID_RANGE, WEBHOOK_MALFORMED | Correct request; do not repeat unchanged |
| 401 | UNAUTHENTICATED, TOKEN_INVALID, WEBHOOK_SIGNATURE_INVALID | Reauthenticate or correct signed webhook |
| 403 | ACTION_FORBIDDEN, PROCESSOR_NOT_APPROVED, TOOL_NOT_ALLOWED | No automatic retry or permission escalation |
| 404 | RESOURCE_NOT_FOUND | Hidden and absent resource are indistinguishable |
| 409 | IDEMPOTENCY_CONFLICT, REQUEST_IN_PROGRESS, INDEX_ALREADY_RUNNING, STALE_BASE, APPROVAL_INVALID, GENERATION_UNAVAILABLE | Inspect current state; only in-progress conditions justify bounded retry |
| 412 / 428 | REVISION_MISMATCH / PRECONDITION_REQUIRED | Refresh ETag, review and resubmit conditional write |
| 413 | PAYLOAD_TOO_LARGE, REPOSITORY_LIMIT_EXCEEDED | Reduce input |
| 422 | MODEL_OUTPUT_INVALID, EMBEDDING_INCOMPATIBLE | Inspect provider/output/configuration; never assume successful answer |
| 429 | RATE_LIMITED, TOKEN_BUDGET_EXCEEDED, COST_BUDGET_EXCEEDED | Respect Retry-After; daily caps may require reset/admin change |
| 500 | INTERNAL_ERROR | Preserve requestId; avoid repeated mutation without idempotency |
| 503 / 504 | DEPENDENCY_UNAVAILABLE / DEPENDENCY_TIMEOUT | Bounded backoff with original mutation key; reconcile uncertain side effects |

Endpoint sections list the failure statuses actually declared in current OpenAPI. This global catalog describes common behavior; do not assume every status/body/header is explicitly modeled on every operation. In particular current webhook failures have description-only bodies. No automatic retry for expired approvals, revoked access, malformed schemas or permanent configuration errors.

## 9. End-to-end API usage order

1. Complete issuer login, call GET /me and select/create an authorized workspace.
2. Admin creates GitHub setup session, follows returned authorization URL, submits callback code/state/installation ID and receives a one-use proof; connectInstallation consumes the proof.
3. List integration repositories, choose branch and create project using verified integration access.
4. Obtain required project grant, request indexing with Idempotency-Key and poll job until SUCCEEDED. Failed or cancelled work does not activate an index.
5. Create owner-private conversation and submit Question with a request key; response is a complete Message, not a token stream.
6. Read citations through source range API at the answer's index generation. Reindexing does not silently change an in-flight answer's revision.
7. Later, request analysis/tests, inspect proposal/diff, approve exact hash/base/action and request PR creation with valid write grant. Approval lasts 15 minutes and never authorizes merge/deployment.
8. On project deletion, use workspace deletion-receipt route; ordinary project/source endpoints become inaccessible immediately.

Setup session expires in ten minutes; one-time installation proof in five minutes. Verify actual GitHub installation administration server-side, not just browser parameters. User login and GitHub App installation authorization are distinct.

## 10. Private gRPC API

Package: devsync.ai.v1; Java package: com.devsync.contracts.ai.v1. All methods are unary in the existing protobuf; no streaming endpoint is defined. TLS/service identity, explicit deadline/cancellation and applicable execution/lease capabilities are required. Never expose private RPC ports to browser clients.

| Service | Method | Request → response | Purpose |
|---|---|---|---|
| AiService | AnswerQuestion | AnswerQuestionRequest → AnswerQuestionResponse | Scoped retrieval/model answer with references |
| AiService | ValidateIndex | ValidateIndexRequest → ValidateIndexResponse | Check expected generation/source completeness |
| JobProgressService | ClaimJob | ClaimJobRequest → ClaimJobResponse | Atomically claim eligible work and issue attempt capability |
| JobProgressService | RenewJobLease | RenewJobLeaseRequest → RenewJobLeaseResponse | Renew valid lease and refresh scoped context |
| JobProgressService | ReportJobProgress | ReportJobProgressRequest → ReportJobProgressResponse | Record valid attempt progress/cancellation state |
| JobProgressService | CompleteIndex | CompleteIndexRequest → CompleteIndexResponse | Validate and atomically complete/activate intended index |

The backend implements JobProgressService. Generic progress must not mark an INDEX job successful and bypass CompleteIndex. Worker lease is 60 seconds, renewed every 20 seconds; stale attempts fail. A signed execution context validates workspace/project/generation/audience/expiry; plain IDs do not grant scope.

RPC wire-field reference follows, transcribed from the existing protobuf. Fields use proto snake_case; REST DTO names remain camelCase. Proto3 scalar presence/defaults do not make security fields optional semantically: validate required identities, capabilities and ranges in service code.

### RPC message: ExecutionScope

| Field number | Field | Wire type |
|---|---|---|
| 1 | `workspace_id` | string |
| 2 | `project_id` | string |
| 3 | `generation_id` | string |
| 4 | `signed_execution_context` | string |

### RPC message: AnswerQuestionRequest

| Field number | Field | Wire type |
|---|---|---|
| 1 | `scope` | ExecutionScope |
| 2 | `question` | string |
| 3 | `conversation_id` | string |
| 4 | `request_id` | string |

### RPC message: Citation

| Field number | Field | Wire type |
|---|---|---|
| 1 | `chunk_id` | string |
| 2 | `path` | string |
| 3 | `commit_sha` | string |
| 4 | `start_line` | uint32 |
| 5 | `end_line` | uint32 |

### RPC message: AnswerQuestionResponse

| Field number | Field | Wire type |
|---|---|---|
| 1 | `answer` | string |
| 2 | `citations` | repeated Citation |
| 3 | `generation_id` | string |
| 4 | `insufficient_context` | bool |
| 5 | `request_id` | string |

### RPC message: ValidateIndexRequest

| Field number | Field | Wire type |
|---|---|---|
| 1 | `scope` | ExecutionScope |
| 2 | `expected_files` | uint64 |
| 3 | `expected_chunks` | uint64 |
| 4 | `commit_sha` | string |

### RPC message: ValidateIndexResponse

| Field number | Field | Wire type |
|---|---|---|
| 1 | `valid` | bool |
| 2 | `sanitized_errors` | repeated string |

### RPC message: ReportJobProgressRequest

| Field number | Field | Wire type |
|---|---|---|
| 1 | `job_id` | string |
| 2 | `attempt_token` | string |
| 3 | `sequence` | uint64 |
| 4 | `state` | JobState |
| 5 | `stage` | string |
| 6 | `sanitized_error_code` | string |

### RPC message: ReportJobProgressResponse

| Field number | Field | Wire type |
|---|---|---|
| 1 | `accepted` | bool |
| 2 | `cancellation_requested` | bool |
| 3 | `current_state` | JobState |

### RPC message: ClaimJobRequest

| Field number | Field | Wire type |
|---|---|---|
| 1 | `job_id` | string |
| 2 | `event_id` | string |
| 3 | `worker_instance_id` | string |

### RPC message: ClaimJobResponse

| Field number | Field | Wire type |
|---|---|---|
| 1 | `claimed` | bool |
| 2 | `attempt_token` | string |
| 3 | `attempt` | uint32 |
| 4 | `lease_expires_at_unix_seconds` | uint64 |
| 5 | `scope` | ExecutionScope |
| 6 | `cancellation_requested` | bool |

### RPC message: RenewJobLeaseRequest

| Field number | Field | Wire type |
|---|---|---|
| 1 | `job_id` | string |
| 2 | `attempt_token` | string |

### RPC message: RenewJobLeaseResponse

| Field number | Field | Wire type |
|---|---|---|
| 1 | `renewed` | bool |
| 2 | `lease_expires_at_unix_seconds` | uint64 |
| 3 | `cancellation_requested` | bool |
| 4 | `refreshed_execution_context` | string |

### RPC message: CompleteIndexRequest

| Field number | Field | Wire type |
|---|---|---|
| 1 | `job_id` | string |
| 2 | `attempt_token` | string |
| 3 | `generation_id` | string |
| 4 | `commit_sha` | string |
| 5 | `file_count` | uint64 |
| 6 | `chunk_count` | uint64 |

### RPC message: CompleteIndexResponse

| Field number | Field | Wire type |
|---|---|---|
| 1 | `accepted` | bool |
| 2 | `activated` | bool |
| 3 | `current_state` | JobState |
| 4 | `sanitized_reason_code` | string |

JobState values: JOB_STATE_UNSPECIFIED=0, QUEUED=1, RUNNING=2, SUCCEEDED=3, FAILED=4, CANCELLED=5 (actual enum identifiers retain JOB_STATE_ prefix). Attempt tokens, signed execution contexts and refreshed contexts are sensitive: redact and never return them through public REST.

RPC error mapping: invalid input → INVALID_ARGUMENT; missing identity → UNAUTHENTICATED; denied action → PERMISSION_DENIED; hidden/missing resource → NOT_FOUND; state conflict → FAILED_PRECONDITION/ALREADY_EXISTS; budget → RESOURCE_EXHAUSTED; dependency outage → UNAVAILABLE; timeout → DEADLINE_EXCEEDED; cancellation → CANCELLED. Do not retry a mutation without its durable intent/capability semantics.

## 11. Event and tool integration contracts

Kafka and MCP are internal integration boundaries, not extra public REST endpoints. Envelope fields include eventId, eventType, schemaVersion, occurredAt, workspaceId, projectId, jobId, traceparent and a bounded payload. Delivery is at least once; use durable deduplication/leases and transactional outbox. Do not put source or credentials in events.

| Event schema | Meaning |
|---|---|

| [analysis-requested.v1.schema.json](../contracts/events/analysis-requested.v1.schema.json) | devsync.analysis.requested.v1 |
| [cleanup-requested.v1.schema.json](../contracts/events/cleanup-requested.v1.schema.json) | devsync.cleanup.requested.v1 |
| [index-requested.v1.schema.json](../contracts/events/index-requested.v1.schema.json) | devsync.index.requested.v1 |
| [job-completed.v1.schema.json](../contracts/events/job-completed.v1.schema.json) | devsync.job.completed.v1 |
| [job-failed.v1.schema.json](../contracts/events/job-failed.v1.schema.json) | devsync.job.failed.v1 |
| [pull-request-requested.v1.schema.json](../contracts/events/pull-request-requested.v1.schema.json) | devsync.pull-request.requested.v1 |
| [retry-dead-letter.v1.schema.json](../contracts/events/retry-dead-letter.v1.schema.json) | Retry/dead-letter envelope |
| [test-requested.v1.schema.json](../contracts/events/test-requested.v1.schema.json) | devsync.test.requested.v1 |

| Tool | Input schema | Normalized output schema |
|---|---|---|
| create_pull_request | [arguments](../contracts/tools/create_pull_request.input.schema.json) | [result](../contracts/tools/create_pull_request.output.schema.json) |
| get_index_status | [arguments](../contracts/tools/get_index_status.input.schema.json) | [result](../contracts/tools/get_index_status.output.schema.json) |
| get_quality_findings | [arguments](../contracts/tools/get_quality_findings.input.schema.json) | [result](../contracts/tools/get_quality_findings.output.schema.json) |
| propose_patch | [arguments](../contracts/tools/propose_patch.input.schema.json) | [result](../contracts/tools/propose_patch.output.schema.json) |
| read_source_range | [arguments](../contracts/tools/read_source_range.input.schema.json) | [result](../contracts/tools/read_source_range.output.schema.json) |
| run_tests | [arguments](../contracts/tools/run_tests.input.schema.json) | [result](../contracts/tools/run_tests.output.schema.json) |
| search_code | [arguments](../contracts/tools/search_code.input.schema.json) | [result](../contracts/tools/search_code.output.schema.json) |

Gateway injects authenticated scope; model arguments cannot choose workspace, project, generation or credentials. Run-tests and PR tools request authorized asynchronous workflows. Native/MCP operations share permission, budget, schema, deadline, output and approval policy. MCP discovery alone never enables tools.

## 12. Versioning and compatibility

REST base is /api/v1; contract document version is 1.0.0. Breaking request/response semantics require reviewed versioning and transition. Consumers should tolerate compatible new optional response fields; server request schemas remain strict where specified. Never reuse protobuf field numbers or silently change enum meanings. Breaking Kafka event semantics get a new schema/topic version. Server, clients, migrations, docs and contract tests change together.

## 13. Documentation verification boundary

Endpoint entries and the schema catalog in this file come from the current OpenAPI; RPC fields come from current protobuf. Validate endpoint coverage, local links, JSON examples and required fields against these sources when updating this guide. Existing contract validators can verify schemas/compilation separately. This document is not evidence of implemented routes, working provider accounts, successful HTTP calls or production availability.

