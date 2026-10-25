# Decisions, Assumptions, and Open Questions

## Proposed decisions

| ID | Decision | Reason and consequence |
|---|---|---|
| ADR-001 | Begin with repository understanding and cited Q&A | Establish a useful, measurable product before automated code writes |
| ADR-002 | Spring Boot owns application workflows; Python owns AI computation | Clear authorization and durable-state ownership without forcing AI libraries into Java |
| ADR-003 | pgvector is the first vector provider; Pinecone is an adapter milestone | Retains both requested technologies while avoiding initial dual-storage consistency work |
| ADR-004 | Use REST publicly and gRPC privately | Browser-friendly APIs and explicit typed Java/Python contracts |
| ADR-005 | Use transactional outbox plus idempotent Kafka consumers | Prevent lost publication and tolerate at-least-once delivery |
| ADR-006 | Native and MCP tools share a policy gateway | Integration protocol does not bypass permission, scope, or approval checks |
| ADR-007 | GitHub Actions starts CI; Jenkins serves a later delivery requirement | Shared scripts reduce drift between pipeline systems |
| ADR-008 | Docker precedes Kubernetes operations | Validate working services before managing production orchestration |
| ADR-009 | Use immutable source revisions and replaceable index generations | Preserve citation provenance and avoid partial reindex visibility |

These decisions are proposed and can be revised with evidence. Record replacements and consequences here rather than silently changing the architecture.

## Resolution of earlier open questions

[Baseline Decisions](18-baseline-decisions-and-limits.md) now supplies the product segment, explicit grants, local OIDC reference, provider adapter policy, dimension, budget, limits, retention, cloud-neutral deployment, Tempo backend, CI ownership and recovery targets. [Evaluation Catalog](22-test-cases-and-evaluation-catalog.md) defines the question-set composition and gates.

Real credentials, provider model IDs, cloud account, actual team capacity and incident contacts are environment/organization inputs. They cannot be manufactured by documentation. Deployment blocks affected capabilities until the documented inputs are supplied. Customer research, performance measurements and actual recovery evidence are execution activities, not hidden design TODOs.

## Main risks and mitigations

- Stack breadth increases maintenance: deliver by capability and keep optional integrations behind adapters.
- AI answers can be unsupported: evaluate retrieval and citation correctness, expose uncertainty, and preserve provenance.
- Private source can leak: enforce scoped access and provider policy across retrieval, caches, logs, and external requests.
- Running code can compromise workers: isolate execution and remove host/network credentials.
- Repositories change during processing: pin commit SHAs and invalidate revision-bound approvals.
- Queue/vector operations can partially fail: use durable jobs, idempotency, generations, cleanup, and recovery tests.

## Current repository status

The project directory was empty when these documents were prepared. No existing application was modified. Runtime target families and design defaults are now selected in the completed baseline; exact implementation locks require a clean compatibility build. Documentation/contract validation is recorded separately; no application tests or deployed services are claimed. The next concrete step is the authenticated repository-Q&A vertical slice.
