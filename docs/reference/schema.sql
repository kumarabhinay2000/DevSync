-- DevSync AI target schema reference. NOT an applied migration.
-- Requires PostgreSQL with an approved pgvector extension installation.
-- Runtime roles must not have extension/schema administration privileges.
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE users (
 id uuid PRIMARY KEY, oidc_issuer text NOT NULL, oidc_subject text NOT NULL,
 display_name text NOT NULL, created_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(oidc_issuer,oidc_subject)
);
CREATE TABLE workspaces (
 id uuid PRIMARY KEY, name varchar(120) NOT NULL, revision bigint NOT NULL DEFAULT 1,
 allow_private_source boolean NOT NULL DEFAULT false,
 approved_processor_ids jsonb NOT NULL DEFAULT '[]', daily_token_limit bigint NOT NULL DEFAULT 1000000 CHECK(daily_token_limit>0),
 daily_cost_limit_usd numeric(12,6) NOT NULL DEFAULT 5 CHECK(daily_cost_limit_usd>0),
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE workspace_members (
 workspace_id uuid NOT NULL REFERENCES workspaces, user_id uuid NOT NULL REFERENCES users,
 role text NOT NULL CHECK(role IN ('OWNER','ADMIN','MEMBER')),
 permissions jsonb NOT NULL DEFAULT '[]', active boolean NOT NULL DEFAULT true,
 revision bigint NOT NULL DEFAULT 1, PRIMARY KEY(workspace_id,user_id)
);
CREATE TABLE integrations (
 id uuid PRIMARY KEY, workspace_id uuid NOT NULL REFERENCES workspaces,
 provider text NOT NULL CHECK(provider='GITHUB'), external_installation_id text NOT NULL,
 credential_ref text NOT NULL, status text NOT NULL CHECK(status IN ('ACTIVE','REVOKED','ERROR')),
 created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(workspace_id,id), UNIQUE(workspace_id,provider,external_installation_id)
);
CREATE TABLE projects (
 id uuid PRIMARY KEY, workspace_id uuid NOT NULL REFERENCES workspaces, integration_id uuid NOT NULL,
 name varchar(120) NOT NULL, repository_external_id text NOT NULL, default_branch text NOT NULL,
 auth_epoch bigint NOT NULL DEFAULT 1, desired_generation_id uuid,
 deleted_at timestamptz, created_at timestamptz NOT NULL DEFAULT now(), revision bigint NOT NULL DEFAULT 1,
 UNIQUE(workspace_id,id), FOREIGN KEY(workspace_id,integration_id) REFERENCES integrations(workspace_id,id)
);
CREATE UNIQUE INDEX projects_live_repository ON projects(workspace_id,integration_id,repository_external_id) WHERE deleted_at IS NULL;
CREATE TABLE project_members (
 workspace_id uuid NOT NULL, project_id uuid NOT NULL, user_id uuid NOT NULL,
 role text NOT NULL CHECK(role IN ('MAINTAINER','READER')), permissions jsonb NOT NULL DEFAULT '[]', revision bigint NOT NULL DEFAULT 1,
 PRIMARY KEY(project_id,user_id), FOREIGN KEY(workspace_id,project_id) REFERENCES projects(workspace_id,id),
 FOREIGN KEY(workspace_id,user_id) REFERENCES workspace_members(workspace_id,user_id)
);
CREATE TABLE index_generations (
 id uuid PRIMARY KEY, workspace_id uuid NOT NULL, project_id uuid NOT NULL,
 commit_sha varchar(64) NOT NULL, provider text NOT NULL CHECK(provider IN ('PGVECTOR','PINECONE')),
 embedding_model text NOT NULL, embedding_dimension integer NOT NULL CHECK(embedding_dimension=1536),
 chunker_version text NOT NULL, status text NOT NULL CHECK(status IN ('BUILDING','VALIDATED','ACTIVE','SUPERSEDED','FAILED','DELETING')),
 created_at timestamptz NOT NULL DEFAULT now(), validated_at timestamptz,
 UNIQUE(workspace_id,project_id,id), FOREIGN KEY(workspace_id,project_id) REFERENCES projects(workspace_id,id)
);
ALTER TABLE projects ADD CONSTRAINT desired_generation_scope_fk FOREIGN KEY(workspace_id,id,desired_generation_id) REFERENCES index_generations(workspace_id,project_id,id);
CREATE TABLE project_active_indexes (
 workspace_id uuid NOT NULL, project_id uuid PRIMARY KEY, generation_id uuid NOT NULL UNIQUE,
 activated_at timestamptz NOT NULL DEFAULT now(),
 FOREIGN KEY(workspace_id,project_id) REFERENCES projects(workspace_id,id),
 FOREIGN KEY(workspace_id,project_id,generation_id) REFERENCES index_generations(workspace_id,project_id,id)
);
CREATE TABLE source_files (
 id uuid PRIMARY KEY, workspace_id uuid NOT NULL, project_id uuid NOT NULL, generation_id uuid NOT NULL,
 path text NOT NULL, content_hash char(64) NOT NULL, language text NOT NULL,
 content text NOT NULL, line_count integer NOT NULL CHECK(line_count>=0), parse_quality text NOT NULL,
 UNIQUE(workspace_id,project_id,generation_id,id), UNIQUE(generation_id,path),
 FOREIGN KEY(workspace_id,project_id,generation_id) REFERENCES index_generations(workspace_id,project_id,id)
);
CREATE TABLE code_chunks (
 id uuid PRIMARY KEY, workspace_id uuid NOT NULL, project_id uuid NOT NULL, generation_id uuid NOT NULL, source_file_id uuid NOT NULL,
 start_line integer NOT NULL CHECK(start_line>=1), end_line integer NOT NULL CHECK(end_line>=start_line),
 symbol text, content text NOT NULL, content_hash char(64) NOT NULL, token_count integer NOT NULL CHECK(token_count>=0),
 UNIQUE(workspace_id,project_id,generation_id,id),
 UNIQUE(generation_id,source_file_id,start_line,end_line,content_hash),
 FOREIGN KEY(workspace_id,project_id,generation_id,source_file_id) REFERENCES source_files(workspace_id,project_id,generation_id,id)
);
CREATE TABLE chunk_embeddings (
 chunk_id uuid PRIMARY KEY, workspace_id uuid NOT NULL, project_id uuid NOT NULL, generation_id uuid NOT NULL,
 embedding vector(1536) NOT NULL,
 FOREIGN KEY(workspace_id,project_id,generation_id,chunk_id) REFERENCES code_chunks(workspace_id,project_id,generation_id,id) ON DELETE CASCADE
);
CREATE INDEX embeddings_scope ON chunk_embeddings(workspace_id,project_id,generation_id);
CREATE TABLE jobs (
 id uuid PRIMARY KEY, workspace_id uuid NOT NULL, project_id uuid NOT NULL, requested_by uuid REFERENCES users,
 type text NOT NULL CHECK(type IN ('INDEX','ANALYSIS','TEST','PR_CREATE','CLEANUP')),
 status text NOT NULL CHECK(status IN ('QUEUED','RUNNING','SUCCEEDED','FAILED','CANCELLED')),
 retry_of uuid REFERENCES jobs, generation_id uuid, result_resource_id uuid,
 attempt integer NOT NULL DEFAULT 0 CHECK(attempt BETWEEN 0 AND 3),
 attempt_token_hash char(64), lease_expires_at timestamptz, cancellation_requested_at timestamptz,
 error_code varchar(80), created_at timestamptz NOT NULL DEFAULT now(), completed_at timestamptz,
 UNIQUE(workspace_id,project_id,id), FOREIGN KEY(workspace_id,project_id) REFERENCES projects(workspace_id,id),
 FOREIGN KEY(workspace_id,project_id,generation_id) REFERENCES index_generations(workspace_id,project_id,id)
);
CREATE UNIQUE INDEX one_active_index_job ON jobs(project_id) WHERE type='INDEX' AND status IN ('QUEUED','RUNNING');
CREATE INDEX jobs_project_time ON jobs(project_id,created_at DESC,id);
CREATE TABLE idempotency_records (
 id uuid PRIMARY KEY, actor_id uuid NOT NULL REFERENCES users, workspace_id uuid NOT NULL REFERENCES workspaces,
 scope_key text NOT NULL, key varchar(200) NOT NULL, request_hash char(64) NOT NULL,
 resource_id uuid, response_ref text, state text NOT NULL CHECK(state IN ('IN_PROGRESS','COMPLETED','FAILED')),
 expires_at timestamptz NOT NULL, UNIQUE(actor_id,workspace_id,scope_key,key)
);
CREATE TABLE job_events (
 id uuid PRIMARY KEY, job_id uuid NOT NULL REFERENCES jobs, attempt integer NOT NULL CHECK(attempt>=0),
 sequence bigint NOT NULL CHECK(sequence>=1), event_type text NOT NULL, stage text NOT NULL,
 sanitized_payload jsonb NOT NULL DEFAULT '{}', created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(job_id,attempt,sequence)
);
CREATE TABLE outbox_events (
 id uuid PRIMARY KEY, aggregate_id uuid NOT NULL, event_type text NOT NULL, payload jsonb NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(), published_at timestamptz,
 publish_attempt integer NOT NULL DEFAULT 0, lease_expires_at timestamptz
);
CREATE INDEX outbox_unpublished ON outbox_events(created_at,id) WHERE published_at IS NULL;
CREATE TABLE consumed_events (
 consumer_name text NOT NULL, event_id uuid NOT NULL, processed_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY(consumer_name,event_id)
);
CREATE TABLE webhook_deliveries (
 delivery_id text PRIMARY KEY, integration_id uuid REFERENCES integrations, event_type text NOT NULL,
 received_at timestamptz NOT NULL DEFAULT now(), payload_hash char(64) NOT NULL
);
CREATE TABLE conversations (
 id uuid PRIMARY KEY, workspace_id uuid NOT NULL, project_id uuid NOT NULL, owner_id uuid NOT NULL REFERENCES users,
 title varchar(200) NOT NULL, created_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(workspace_id,project_id,id), FOREIGN KEY(workspace_id,project_id) REFERENCES projects(workspace_id,id)
);
CREATE TABLE messages (
 id uuid PRIMARY KEY, workspace_id uuid NOT NULL, project_id uuid NOT NULL, conversation_id uuid NOT NULL,
 role text NOT NULL CHECK(role IN ('USER','ASSISTANT')), content text NOT NULL,
 generation_id uuid, provider_request_id text, request_id uuid NOT NULL,
 insufficient_context boolean NOT NULL DEFAULT false, prompt_version text, model_config_hash char(64),
 created_at timestamptz NOT NULL DEFAULT now(),
 FOREIGN KEY(workspace_id,project_id,conversation_id) REFERENCES conversations(workspace_id,project_id,id) ON DELETE CASCADE,
 FOREIGN KEY(workspace_id,project_id,generation_id) REFERENCES index_generations(workspace_id,project_id,id)
);
CREATE INDEX messages_conversation_time ON messages(conversation_id,created_at,id);
CREATE TABLE message_citations (
 id uuid PRIMARY KEY, message_id uuid NOT NULL REFERENCES messages ON DELETE CASCADE,
 chunk_id uuid REFERENCES code_chunks(id) ON DELETE SET NULL,
 commit_sha varchar(64) NOT NULL, path text NOT NULL, start_line integer NOT NULL CHECK(start_line>=1),
 end_line integer NOT NULL CHECK(end_line>=start_line)
);
CREATE TABLE analysis_findings (
 id uuid PRIMARY KEY, workspace_id uuid NOT NULL, project_id uuid NOT NULL, job_id uuid NOT NULL,
 tool text NOT NULL CHECK(tool='SONARQUBE'), rule_id text NOT NULL,
 severity text NOT NULL CHECK(severity IN ('INFO','LOW','MEDIUM','HIGH','CRITICAL')),
 path text NOT NULL, line integer NOT NULL CHECK(line>=1), commit_sha varchar(64) NOT NULL,
 message text NOT NULL, fingerprint char(64) NOT NULL,
 FOREIGN KEY(workspace_id,project_id,job_id) REFERENCES jobs(workspace_id,project_id,id), UNIQUE(job_id,fingerprint)
);
CREATE TABLE artifacts (
 id uuid PRIMARY KEY, workspace_id uuid NOT NULL, project_id uuid NOT NULL,
 kind text NOT NULL CHECK(kind IN ('TEST_LOG','PATCH','REPORT')), object_ref text NOT NULL,
 content_hash char(64) NOT NULL, byte_count bigint NOT NULL CHECK(byte_count>=0),
 content_type text NOT NULL, expires_at timestamptz NOT NULL,
 UNIQUE(workspace_id,project_id,id), FOREIGN KEY(workspace_id,project_id) REFERENCES projects(workspace_id,id)
);
CREATE TABLE change_proposals (
 id uuid PRIMARY KEY, workspace_id uuid NOT NULL, project_id uuid NOT NULL, created_by uuid NOT NULL REFERENCES users,
 base_commit_sha varchar(64) NOT NULL, patch_artifact_id uuid NOT NULL,
 patch_hash char(64) NOT NULL, summary text NOT NULL,
 status text NOT NULL CHECK(status IN ('DRAFT','TESTING','TEST_FAILED','READY_FOR_REVIEW','APPROVED','PR_CREATING','PR_CREATED','REJECTED','CANCELLED')),
 created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(workspace_id,project_id,id),
 FOREIGN KEY(workspace_id,project_id) REFERENCES projects(workspace_id,id),
 FOREIGN KEY(workspace_id,project_id,patch_artifact_id) REFERENCES artifacts(workspace_id,project_id,id)
);
CREATE TABLE approvals (
 id uuid PRIMARY KEY, workspace_id uuid NOT NULL, project_id uuid NOT NULL, proposal_id uuid NOT NULL,
 approver_id uuid NOT NULL REFERENCES users, approved_patch_hash char(64) NOT NULL,
 approved_base_sha varchar(64) NOT NULL, action text NOT NULL CHECK(action='CREATE_PULL_REQUEST'),
 decision text NOT NULL CHECK(decision IN ('APPROVE','REJECT')),
 expires_at timestamptz NOT NULL, consumed_at timestamptz, created_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(workspace_id,project_id,id), FOREIGN KEY(workspace_id,project_id,proposal_id) REFERENCES change_proposals(workspace_id,project_id,id)
);
CREATE TABLE pull_requests (
 id uuid PRIMARY KEY, workspace_id uuid NOT NULL, project_id uuid NOT NULL, proposal_id uuid NOT NULL,
 approval_id uuid NOT NULL, external_pr_id text, url text, branch_name text NOT NULL,
 status text NOT NULL CHECK(status IN ('CREATING','CREATED','FAILED')),
 UNIQUE(proposal_id), FOREIGN KEY(workspace_id,project_id,proposal_id) REFERENCES change_proposals(workspace_id,project_id,id),
 FOREIGN KEY(workspace_id,project_id,approval_id) REFERENCES approvals(workspace_id,project_id,id)
);
CREATE TABLE test_profiles (
 id text PRIMARY KEY, description text NOT NULL, image_digest text NOT NULL, entrypoint jsonb NOT NULL,
 timeout_seconds integer NOT NULL CHECK(timeout_seconds BETWEEN 1 AND 600), enabled boolean NOT NULL DEFAULT false
);
CREATE TABLE test_results (
 id uuid PRIMARY KEY, workspace_id uuid NOT NULL, project_id uuid NOT NULL, job_id uuid NOT NULL UNIQUE,
 proposal_id uuid NOT NULL, test_profile_id text NOT NULL REFERENCES test_profiles,
 outcome text NOT NULL CHECK(outcome IN ('PENDING','PASS','FAIL','ERROR','TIMEOUT','CANCELLED')),
 summary text NOT NULL, artifact_id uuid,
 FOREIGN KEY(workspace_id,project_id,job_id) REFERENCES jobs(workspace_id,project_id,id),
 FOREIGN KEY(workspace_id,project_id,proposal_id) REFERENCES change_proposals(workspace_id,project_id,id),
 FOREIGN KEY(workspace_id,project_id,artifact_id) REFERENCES artifacts(workspace_id,project_id,id)
);
CREATE TABLE mcp_servers (
 id uuid PRIMARY KEY, workspace_id uuid NOT NULL REFERENCES workspaces, name varchar(120) NOT NULL,
 endpoint text NOT NULL, credential_ref text NOT NULL, allowed_tools jsonb NOT NULL,
 schema_fingerprint char(64) NOT NULL, status text NOT NULL DEFAULT 'DISABLED' CHECK(status IN ('DISABLED','PENDING_REVIEW','ENABLED','ERROR')),
 created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(workspace_id,id)
);
CREATE TABLE tool_executions (
 id uuid PRIMARY KEY, workspace_id uuid NOT NULL, project_id uuid NOT NULL, job_id uuid, actor_id uuid NOT NULL REFERENCES users,
 tool_name text NOT NULL, argument_hash char(64) NOT NULL, approval_id uuid,
 outcome text NOT NULL, duration_ms integer NOT NULL CHECK(duration_ms>=0), created_at timestamptz NOT NULL DEFAULT now(),
 FOREIGN KEY(workspace_id,project_id) REFERENCES projects(workspace_id,id),
 FOREIGN KEY(workspace_id,project_id,job_id) REFERENCES jobs(workspace_id,project_id,id),
 FOREIGN KEY(workspace_id,project_id,approval_id) REFERENCES approvals(workspace_id,project_id,id)
);
CREATE TABLE audit_events (
 id uuid PRIMARY KEY, workspace_id uuid NOT NULL REFERENCES workspaces, actor_id uuid REFERENCES users,
 action text NOT NULL, resource_type text NOT NULL, resource_id text NOT NULL, outcome text NOT NULL,
 sanitized_details jsonb NOT NULL DEFAULT '{}', created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE spend_reservations (
 id uuid PRIMARY KEY, workspace_id uuid NOT NULL REFERENCES workspaces, request_id uuid NOT NULL UNIQUE,
 budget_date date NOT NULL, model_config_hash char(64) NOT NULL,
 reserved_tokens bigint NOT NULL CHECK(reserved_tokens>=0), actual_tokens bigint CHECK(actual_tokens>=0),
 reserved_usd numeric(12,6) NOT NULL CHECK(reserved_usd>=0), actual_usd numeric(12,6) CHECK(actual_usd>=0),
 state text NOT NULL CHECK(state IN ('RESERVED','RECONCILED','CANCELLED','REVIEW_REQUIRED')),
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX spend_workspace_day ON spend_reservations(workspace_id,budget_date,state);
CREATE TABLE cleanup_manifests (
 id uuid PRIMARY KEY, workspace_id uuid NOT NULL, project_id uuid NOT NULL, job_id uuid NOT NULL,
 initiated_by uuid NOT NULL REFERENCES users, resource_progress jsonb NOT NULL DEFAULT '{}',
 created_at timestamptz NOT NULL DEFAULT now(), completed_at timestamptz,
 UNIQUE(workspace_id,id), FOREIGN KEY(workspace_id,project_id) REFERENCES projects(workspace_id,id),
 FOREIGN KEY(workspace_id,project_id,job_id) REFERENCES jobs(workspace_id,project_id,id)
);
CREATE TABLE deletion_receipts (
 id uuid PRIMARY KEY, workspace_id uuid NOT NULL REFERENCES workspaces, manifest_id uuid NOT NULL,
 initiated_by uuid NOT NULL REFERENCES users, expires_at timestamptz NOT NULL,
 FOREIGN KEY(workspace_id,manifest_id) REFERENCES cleanup_manifests(workspace_id,id)
);
-- Lifecycle service nulls messages.generation_id, clears active/desired pointers,
-- then deletes expired generation children in FK-safe order. Retain citation snapshots.
-- Application transactions enforce last-owner protection, lease transitions,
-- approval binding, canonical citation ownership and per-day budget reservations.

CREATE TABLE github_setup_sessions (
 id uuid PRIMARY KEY, workspace_id uuid NOT NULL REFERENCES workspaces, actor_id uuid NOT NULL REFERENCES users,
 state_hash char(64) NOT NULL UNIQUE, installation_id text, proof_hash char(64),
 expires_at timestamptz NOT NULL, consumed_at timestamptz,
 created_at timestamptz NOT NULL DEFAULT now()
);
