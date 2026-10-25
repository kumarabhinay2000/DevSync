# DevSync AI — Documentation Index

Baseline: 25 October 2026. Complete target engineering documentation; the application itself is not implemented.

Start with [completion status and evidence](17-documentation-status.md), then read PRD, baseline decisions, architecture and roadmap.

| Document | Content |
|---|---|
| [01 — Product Requirements Document](01-product-requirements.md) | Engineering specification and acceptance handoff |
| [02 — System Architecture](02-system-architecture.md) | Engineering specification and acceptance handoff |
| [03 — Database Design](03-database-design.md) | Engineering specification and acceptance handoff |
| [04 — API and Event Contracts](04-api-and-event-contracts.md) | Engineering specification and acceptance handoff |
| [05 — Implementation Roadmap](05-implementation-roadmap.md) | Engineering specification and acceptance handoff |
| [06 — Testing and Quality Strategy](06-testing-and-quality.md) | Engineering specification and acceptance handoff |
| [07 — Security and Access Design](07-security-and-access.md) | Engineering specification and acceptance handoff |
| [08 — Deployment and Operations Plan](08-deployment-and-operations.md) | Engineering specification and acceptance handoff |
| [09 — Decisions, Assumptions, and Open Questions](09-decisions-and-open-questions.md) | Engineering specification and acceptance handoff |
| [10 — UI/UX Specification](10-ui-ux-specification.md) | Engineering specification and acceptance handoff |
| [11 — Permission Matrix and Threat Model](11-permissions-and-threat-model.md) | Engineering specification and acceptance handoff |
| [12 — ER Diagram and Data Lifecycle](12-database-er-and-data-lifecycle.md) | Engineering specification and acceptance handoff |
| [13 — Developer Onboarding Guide](13-developer-onboarding.md) | Engineering specification and acceptance handoff |
| [14 — Operational Runbooks](14-operations-runbooks.md) | Engineering specification and acceptance handoff |
| [15 — User Guide](15-user-guide.md) | Engineering specification and acceptance handoff |
| [16 — Requirements Traceability and Release Gates](16-requirements-traceability.md) | Engineering specification and acceptance handoff |
| [17 — Documentation Status and Handoff](17-documentation-status.md) | Engineering specification and acceptance handoff |
| [18 — Baseline Decisions, Limits, and Configuration](18-baseline-decisions-and-limits.md) | Engineering specification and acceptance handoff |
| [19 — Detailed Workflows and State Machines](19-detailed-workflows-and-state-machines.md) | Engineering specification and acceptance handoff |
| [20 — AI, Retrieval, Tools, and MCP Design](20-ai-retrieval-tools-and-mcp.md) | Engineering specification and acceptance handoff |
| [21 — Delivery, Observability, and Recovery Specification](21-delivery-observability-and-recovery.md) | Engineering specification and acceptance handoff |
| [22 — Test Cases and AI Evaluation Catalog](22-test-cases-and-evaluation-catalog.md) | Engineering specification and acceptance handoff |
| [23 — Engineering Governance and Implementation Backlog](23-engineering-governance-and-backlog.md) | Engineering specification and acceptance handoff |
| [24 — Database Reference and Migration Specification](24-database-reference-and-migrations.md) | Engineering specification and acceptance handoff |
| [25 — API Semantics, Visibility, and Error Catalog](25-api-semantics-and-errors.md) | Engineering specification and acceptance handoff |
| [26 — UI Design System and Wireframe Handoff](26-ui-design-system-and-wireframes.md) | Engineering specification and acceptance handoff |
| [27 — Configuration, Toolchain, and Setup Handoff](27-configuration-and-toolchain.md) | Engineering specification and acceptance handoff |
| [28 — Data Privacy, Cost, and Support Policy](28-data-privacy-cost-and-support.md) | Engineering specification and acceptance handoff |

## Contracts, references and verification

- [Contract sources and complete contract-file index](../contracts/README.md)
- [Database reference SQL](reference/schema.sql)
- [Configuration reference](reference/environment.example)
- [Dashboard wireframe](wireframes/dashboard.svg), [chat wireframe](wireframes/chat.svg), [review wireframe](wireframes/review.svg)
- [Validation script](../scripts/validate_documentation.py) and [validator dependency pins](../scripts/requirements-docs.txt)
- [Validation report](reference/validation-report.md), [JSON report](reference/validation-report.json), [source file inventory](reference/file-inventory.json)

## Reading and maintenance rules

The baseline decisions resolve earlier design assumptions. The API semantics and OpenAPI govern request/response field names; reference SQL and the migration specification govern target persistence. Documents describe required behavior, not fabricated implementation evidence. Contract, code and documentation changes must be reviewed together.
