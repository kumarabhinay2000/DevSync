# Baseline Decisions, Limits, and Configuration

Version: 1.0 · 25 October 2026 · Status: engineering baseline selected for this documentation handoff.

This document resolves earlier open design choices with explicit defaults. These defaults are not customer validation, purchased services, contractual promises, or a claim of deployment. Change a default through a recorded architecture decision with affected contracts and tests in the same change.

## Product and delivery baseline

The initial user is a developer or small team investigating Java, Python, TypeScript, and TSX GitHub repositories. The primary outcome is repository Q&A with revision-correct citations. Team capacity and calendar commitments are not fabricated: deliver by the completion gates in the roadmap. Public repositories and synthetic fixtures are used until a workspace administrator explicitly enables approved external processors for private source.

| Decision | Baseline |
|---|---|
| Workspace/project access | Explicit project grants plus active workspace membership; no implicit source access for administrators |
| User identity | OIDC Authorization Code + PKCE; Keycloak is the local reference identity service; production can use any conforming configured issuer |
| Browser session | SPA keeps access token in memory; no localStorage token persistence; re-authenticate on reload; no refresh token in the initial browser design |
| Provider integration | GitHub App installations; stable numeric repository IDs, not names, identify repositories |
| Model integration | Configurable server-side chat and embedding adapters; explicit endpoint/model configuration; no automatic provider fallback for private source |
| Default vector store | pgvector; initial dimension 1536; require the configured embedding model to emit exactly 1536 finite components |
| Alternative vector store | Pinecone adapter selected per generation; same dimension, metadata policy, and evaluation suite; no dual writes |
| Schema migration | Flyway, backend-owned; reference DDL supplied separately from executable application migrations |
| First search index | Exact filtered vector search for correctness; HNSW rollout only after comparison with the exact baseline |
| Source storage | Canonical bounded source snapshots/chunks in PostgreSQL for baseline-sized repos; object-storage adapter for patch/test/backup artifacts |
| Observability | OpenTelemetry collector, Prometheus metrics, Grafana dashboards, Tempo trace backend; structured JSON logs to environment log collection |
| Delivery | GitHub Actions owns PR validation/image publication; Jenkins owns staging/production promotion; shared scripts, single deployment owner per environment |
| Hosting | Cloud-neutral Kubernetes target; production stateful dependencies externally operated; deployment does not require a specific cloud vendor |
| Browser end-to-end tests | Playwright, in addition to required React Testing Library component tests |

Provider URL, model ID, credentials, DNS, certificates, cloud account, registry, and real incident contacts are deployment inputs, not missing product design. Do not insert invented values. Setup fails closed when required inputs are absent. Dependency versions must be pinned in implementation lockfiles after compatibility verification; these documents do not claim current-version compatibility.

## Initial resource and workload limits

These are enforceable default ceilings and acceptance targets, not measured capacities. Byte limits apply to decompressed content, not just clone transfer size.

| Setting | Default |
|---|---|
| Repository source budget | 100 MiB eligible source, 10,000 eligible files per generation |
| Single source file | 1 MiB; binary, symlink, submodule traversal, archives, and generated/vendor files excluded |
| Question / API JSON body | 16,000 Unicode characters / 256 KiB maximum body |
| Index concurrency | 1 active index job per project, 2 per workspace; global worker concurrency starts at 2 |
| Chat concurrency | 2 per user, 5 per workspace; queue bounded at 20 |
| Chat request rate | 20/minute/user; 100/minute/workspace; return Retry-After on limit |
| Model context | 12,000 retrieved-context tokens; 2,000 history tokens; 2,000 output tokens; adapter checks model capacity |
| Tool loop | At most 6 invocations/answer, 30 seconds/tool, 64 KiB/tool result, 120 seconds total answer budget |
| Retrieval | 20 candidates, deduplicate overlapping ranges, at most 8 final chunks |
| Chunking | Target 800 tokens, maximum 1,200, 100-token overlap for oversized symbols; preserve accurate line offsets |
| Job lease | 60 seconds, renew every 20 seconds; immutable attempt token |
| Retries | 3 processing attempts; backoff 5s then 30s with jitter; permanent authorization/schema errors do not retry |
| Job timeout | Indexing 30 minutes; analysis 20 minutes; sandbox test 10 minutes |
| Approval validity | 15 minutes; exact patch hash, base SHA, repository, action, actor bound |
| Chat budget | Default 1 million total provider tokens/workspace/day; cost ceiling additionally configurable |
| Cost guard | USD 5/day/workspace initial maximum when verified model prices are configured; otherwise private/live-provider execution disabled |

Prices are runtime configuration obtained from the selected provider, not a hard-coded claim about current pricing. Reserve the upper-bound expected cost atomically before calls; reconcile actual usage afterward. Fail closed when the spend ledger is unavailable. Redis counters alone cannot guarantee a durable spending cap.

## Retention defaults

| Data | Default lifecycle |
|---|---|
| Active source/index | Retain while project remains active |
| Superseded generations | 7 days; historical references then resolve through authorized immutable GitHub links |
| Chat and test/patch artifacts | 30 days; users can delete their conversations earlier |
| Job history and tool metadata | 30 days; never retain raw secrets or full tool arguments |
| Security audit metadata | 90 days with access restricted to authorized administrators |
| Operational logs / traces | 14 days / 7 days; no raw source or prompt bodies |
| Prometheus metrics | 30 days with bounded labels |
| Kafka normal / dead-letter topics | 7 days / 14 days; payloads contain identifiers only |
| Project deletion | Deny reads immediately; cleanup target within 24 hours; retry and alert if exceeded |
| Encrypted backups | Daily full + continuous WAL, 30-day retention; deletion ages out through backup expiry |

Privacy or enterprise policy can shorten these limits. Longer retention requires a reviewed policy change and disclosure to users. Deleting canonical chunks detaches historical citation foreign keys while retaining path/SHA/line provenance; citation reads still require current authorization.

## Service objectives and recovery targets

Target monthly availability 99.5% for authenticated metadata and indexed Q&A, measured separately. A successful Q&A requires a valid bounded response or explicit insufficient-context result; dependency errors are failures, not successful answers. Target metadata p95 <500 ms; Q&A p95 <10 seconds for the reference workload; 100 MiB index completion <30 minutes under the initial controlled benchmark. These targets require measurement before launch.

Recovery target: RPO 15 minutes, RTO 4 hours for canonical database/artifacts; vector rebuild target 24 hours for the initial workload. Restores must satisfy the measured capacity; revise targets rather than claiming untested guarantees. Owner roles: release lead, incident lead, security owner, data recovery owner, and integration owner. A deployment must bind each role to a real reachable person before production enablement.
