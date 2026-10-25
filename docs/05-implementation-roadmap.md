# Implementation Roadmap

No delivery dates are committed. Estimate after confirming team capacity and completing the first technical spike. Each phase requires a working demonstration and the listed gate.

| Phase | Deliverables | Completion gate |
|---|---|---|
| 0 — Requirements | Review selected baseline, bind deployment inputs, build reference fixture and evaluation set | MVP scope, privacy rules, cost ceiling, and acceptance criteria agreed |
| 1 — Foundation | Frontend/backend/Python scaffolds, shared configuration, Docker setup, CI checks, OIDC skeleton | Services start locally; protected API and UI login work; secrets excluded from source |
| 2 — Repository access | GitHub installation integration, projects, memberships, revision resolution, durable jobs | Authorized repository connects; denied access and duplicate requests are tested |
| 3 — Indexing | Tree-sitter chunks, embeddings, pgvector retrieval, index generations, Kafka/outbox processing | Reference repo indexes; worker crash/retry and inactive-generation behavior are verified |
| 4 — Grounded chat | Private gRPC AI calls, RAG prompts, citations, frontend chat, evaluation harness | Agreed repository questions receive useful answers with valid references; access isolation passes |
| 5 — Tools and MCP | Tool gateway, approved read-only tools, MCP adapter, audit records | Malformed input, excessive outputs, prompt injection, and unauthorized tools are handled |
| 6 — Analysis and changes | SonarQube, sandboxed tests, diff proposals, revision-bound approvals, GitHub PR jobs | Exact approved changes produce a PR; stale approvals and failed tests block configured actions |
| 7 — Operational expansion | Pinecone adapter, Jenkins pipeline, Kubernetes manifests, dashboards, backup/restore | Provider contract tests, deployment smoke tests, rollback and restore drills pass |

## First engineering backlog

1. Apply the documented hosting/identity/limits/budget defaults; bind real provider configuration and privacy approval before external calls.
2. Create project structure and pin compatible runtime/library versions from official documentation.
3. Implement schema migrations and membership authorization.
4. Build a login → project list vertical slice.
5. Implement GitHub repository connection and job tracking.
6. Index a small reference repository at a fixed commit.
7. Deliver a question → retrieved context → cited answer vertical slice.
8. Measure correctness, latency, and cost before expanding automation.

## Definition of done

A feature has reviewed scope, implemented behavior, appropriate tests, clear errors, enforced access controls, relevant telemetry, updated contracts/docs, and a reproducible demo. Production readiness also requires environment configuration, operational ownership, backup/restore validation, and release checks.

## Scope controls

Retain every requested stack item in the target design, but do not block a useful MVP on operating every optional component. pgvector and Pinecone share a provider abstraction. GitHub Actions and Jenkins use shared scripts. Kubernetes follows a working container deployment. Existing functionality must be regression-checked when existing source becomes available.
