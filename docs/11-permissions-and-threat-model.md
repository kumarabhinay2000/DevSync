# Permission Matrix and Threat Model

Status: Proposed default policy. Project grants are explicit; workspace membership alone does not grant source access. Administrative metadata access does not imply permission to read private code.

| Action | Workspace owner/admin | Project maintainer | Project reader |
|---|---|---|---|
| Manage workspace membership/integration | Yes | No | No |
| Create project connection | Yes; requires repository access | Only with explicit create-project grant | No |
| Read source, chat, findings | Only with project grant | Yes | Yes |
| Request/cancel indexing or analysis | Only with maintainer grant | Yes | No |
| Propose changes | Only with maintainer grant | Yes | No |
| Approve patch / create PR | Separate approval/write grant required | Separate approval/write grant required | No |
| Delete project | Workspace admin plus project-management permission | Separate delete grant required | No |

Enforce active workspace membership as well as project grants. Service identities receive scoped capabilities, not human roles. Default deny unknown actions. Revocation invalidates future tool executions and cached access decisions; define a maximum token lifetime and revocation mechanism before deployment.

## Trust boundaries and threats

| Boundary / threat | Control | Verification evidence |
|---|---|---|
| Browser → API: stolen or forged identity | OIDC issuer/audience validation, secure browser flow, rate limits | Invalid/expired token tests; session review |
| Project A → project B: ID enumeration | Scoped resource lookups, consistent hidden-resource response | Cross-project negative integration tests |
| GitHub → webhook: replay/forgery | Raw-body signature validation, delivery-ID uniqueness | Invalid signature and duplicate delivery tests |
| Repository → model: prompt injection | Untrusted context separation, no model-granted authority | Malicious source fixture cannot trigger forbidden tool |
| Model → tool gateway: argument injection | Typed schema, path confinement, tool allowlist, bounded output | Traversal, oversized payload, unknown-tool tests |
| Worker → host: malicious build scripts | Isolated ephemeral execution, limits, no host secrets | Sandbox escape-surface and network-denial checks |
| Retrieval → vector provider: tenant leakage | Scope filters plus canonical ownership revalidation | Adversarial mixed-tenant search fixtures |
| Queue → worker: forged/duplicate command | Broker ACLs, event validation, state checks, deduplication | Replayed/stale event tests |
| Approval → write: patch changes after approval | Patch hash + base SHA binding, expiration, permission recheck | Stale revision and modified-patch tests |
| Telemetry → operator: secret disclosure | Payload minimization and redaction | Captured-log scan using synthetic secrets |

## Sensitive data inventory

Restricted: source code, prompts containing source, embeddings, private repository identifiers, integration credentials. Internal: memberships, job metadata, audit records. Public: explicitly published product documentation only. Embeddings are derived private data, not anonymized content.

Before private-repository rollout, record each external processor, data categories, region, deletion behavior, retention settings, and owner. Legal/compliance requirements depend on the organization and jurisdiction and are not certified by these documents.

## Abuse and failure controls

Bound repository size, per-file bytes, question length, context tokens, concurrent jobs, model spend, and tool duration. Enforce the initial values in [Baseline Decisions](18-baseline-decisions-and-limits.md) and validate them through benchmarks. Reject or pause oversized work with actionable feedback; do not silently truncate required security filters. Maintain a kill switch for write tools and external integrations.
