# Security and Access Design

## Identity and authorization

Use an OIDC provider for user identity and Spring Security for token validation. Browser flow: Authorization Code with PKCE, in-memory access token, no initial refresh-token persistence; reload requires reauthentication. Validate issuer, audience, expiration, and signature. Use OAuth scopes for delegated integration access; do not equate a GitHub login with repository authorization.

Proposed workspace roles: owner, admin, member. Project roles: maintainer and reader. Readers can ask questions and view permitted results. Maintainers can request indexing and analysis; change approval requires a separate explicit permission. Owners/admins manage memberships and integrations. Project grants are explicit and additionally require active workspace membership; administrator status does not imply source access.

## Repository integration

Prefer a GitHub App with narrowly scoped installation access. Verify webhook signatures using the raw body, deduplicate delivery IDs, and refresh access state on revoked installations. Keep installation tokens short-lived and outside logs. Fetch immutable commits into isolated temporary workspaces with file, size, depth, and time limits.

## AI data boundary

Private source leaves the system when sent to external LLM, embedding, or vector providers. Provider selection must therefore include data-processing terms, retention configuration, region, and permitted repository policy before private repository use. Source content must not become telemetry baggage or metric labels.

Apply workspace/project/revision filters before retrieval and revalidate returned chunk ownership. Cache keys include scope, revision, model, and relevant policy version. Do not share conversational memory across users or projects accidentally.

## Tools and approvals

Treat source files, retrieved documents, generated output, and MCP responses as untrusted. Model-generated arguments cannot grant permissions. Validate every tool call against a server-side policy and bounded schema. Do not allow model-controlled executable names or arbitrary shell text in the initial tool set.

Run repository tests in short-lived isolated environments with restricted network, read-only base source, explicit writable scratch space, resource limits, and no host credentials. Repository build/test scripts can execute arbitrary code; they are not safe merely because they are called tests.

Approvals bind actor, action, repository, base SHA, patch hash, tool scope, and expiration. A changed patch or base revision invalidates approval. PR creation and production deployment are separate operations; approval for one does not grant the other.

## Secrets, audit, and deletion

Keep secrets in an environment-appropriate secret manager; local `.env` files stay untracked. Redact credentials and source content from operational logs. Audit membership changes, integration changes, privileged tool use, approvals, and writes without recording tokens or unnecessarily copying code.

Deletion immediately revokes access, then tracks provider/vector/artifact cleanup. Apply the explicit retention and backup defaults in [Baseline Decisions](18-baseline-decisions-and-limits.md). Test authorization and deletion behavior across APIs, caches, workers, and vector providers.
