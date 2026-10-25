# Database Design

## Conventions

PostgreSQL logical schema, completed by the [reference SQL](reference/schema.sql) and [migration specification](24-database-reference-and-migrations.md). Use UUID identifiers, UTC timestamps, foreign keys, and explicit workspace scope. Store secrets in a secret manager, with only references in application records. Baseline embedding dimension is 1536; the configured embedding model must match it exactly.

| Table | Key fields and purpose |
|---|---|
| users | id, oidc_issuer, oidc_subject, display_name, created_at; unique issuer/subject |
| workspaces | id, name, created_at |
| workspace_members | workspace_id, user_id, role; unique membership |
| projects | id, workspace_id, name, integration_id, repository_external_id, default_branch, deleted_at |
| project_members | project_id, user_id, role; explicit project grants |
| integrations | id, workspace_id, provider, external_installation_id, credential_ref, status |
| index_generations | id, workspace_id, project_id, commit_sha, provider, embedding_model, embedding_dimension, chunker_version, status, created_at |
| project_active_indexes | project_id, generation_id; one active generation per project initially |
| source_files | id, generation_id, path, content_hash, language, line_count |
| code_chunks | id, workspace_id, project_id, generation_id, source_file_id, start_line, end_line, symbol, content, content_hash |
| chunk_embeddings | chunk_id, generation_id, embedding; pgvector storage for the selected model configuration |
| jobs | id, workspace_id, project_id, type, status, requested_by, idempotency_key, attempt, lease_expires_at, error_code, created_at, completed_at |
| job_events | id, job_id, sequence, event_type, sanitized_payload, created_at |
| conversations | id, workspace_id, project_id, owner_id, created_at |
| messages | id, conversation_id, role, content, generation_id, provider_request_id, created_at |
| message_citations | id, message_id, chunk_id, commit_sha, path, start_line, end_line |
| analysis_findings | id, job_id, tool, rule_id, severity, path, line, message, fingerprint |
| change_proposals | id, project_id, base_commit_sha, patch_ref, patch_hash, status, created_by |
| approvals | id, proposal_id, approver_id, approved_patch_hash, approved_base_sha, decision, expires_at |
| tool_executions | id, job_id, actor_id, tool_name, argument_hash, approval_id, outcome, duration_ms |
| audit_events | id, workspace_id, actor_id, action, resource_type, resource_id, sanitized_details, created_at |
| outbox_events | id, aggregate_id, event_type, payload, created_at, published_at |
| consumed_events | consumer_name, event_id, processed_at; unique pair for deduplication |

## Relationships and integrity

Workspace → projects → index generations → files → chunks → embeddings. Projects also own conversations, jobs, and proposals. Messages reference the generation used to answer, so answers remain tied to a revision.

Enforce cross-table workspace/project consistency with composite constraints where feasible. Application queries enforce scope; PostgreSQL row-level security is a defense-in-depth option that must be tested with connection pooling and background roles before adoption. Cache or vector namespace filters alone do not establish authorization.

Use indexes on membership lookup, workspace/project foreign keys, job status and creation time, conversation message order, generation/file path, and unpublished outbox rows. Use exact filtered pgvector search initially; enable approximate indexing only after comparison against that correctness baseline.

## Vector-provider handling

For pgvector, keep embedding schema/indexes compatible with the selected dimension; a model change creates a new generation and may require a new physical vector table/index. For Pinecone, keep canonical chunks and provenance in PostgreSQL and use stable chunk IDs plus scoped metadata remotely. Never activate a partially written generation.

## Job state machine

`QUEUED → RUNNING → SUCCEEDED | FAILED | CANCELLED`. Retry creates a new attempt with bounded retry count. A worker lease prevents indefinite RUNNING state after a crash. Cancellation is cooperative; the active generation changes only after complete validation.

## Retention and deletion

Retention defaults are specified in [Baseline Decisions](18-baseline-decisions-and-limits.md). Project deletion immediately blocks access, then a tracked cleanup job removes code chunks, vectors in the selected provider, cached entries, and stored artifacts. Audit records retain only the approved minimal metadata. Backups expire on a documented schedule; do not promise instant physical erasure from backups.

## Migration policy

Use backend-owned Flyway migrations. The reference DDL is a design attachment; actual application migrations follow the specified series and require fresh/upgrade execution tests. Use expand/migrate/contract changes for deployed schemas; test migrations against a disposable PostgreSQL instance and back up before destructive production changes.
