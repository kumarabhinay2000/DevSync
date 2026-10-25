# Requirements Traceability and Release Gates

Status: Planned verification. No tests have run against an application implementation.

| PRD requirement | Implementation surface | Required verification | Phase |
|---|---|---|---|
| FR-01 Protected APIs | Spring Security, browser identity flow | Missing/expired/wrong-audience token tests | 1 |
| FR-02 Project isolation | Grants, API queries, vector filters, workers | Cross-workspace/project negative tests across all surfaces | 2–4 |
| FR-03 Idempotent indexing | Job uniqueness, request hash, outbox | Same key/same body returns job; different body conflicts | 2–3 |
| FR-04 Revision/model identity | Index-generation records | Exact SHA and embedding configuration survive reindex/restart | 3 |
| FR-05 Correct citations | Parser ranges, retrieval provenance, response validation | Every emitted reference resolves within indexed source | 4 |
| FR-06 Evidence/uncertainty | Prompt and answer policy, evaluation harness | Supported-answer and insufficient-context fixtures | 4 |
| FR-07 Useful failure recovery | Job state, sanitized errors, retry UI | Provider timeout and worker crash tests | 3–4 |
| FR-08 Safe reindex | Inactive generation and atomic activation | Partial failure preserves old active index; concurrent jobs cannot regress it | 3 |
| FR-09 Deletion | Immediate access denial and cleanup manifest | Denied reads plus retryable cleanup across providers/caches | 3–4 |

## Backlog item template

Each issue contains: user outcome, linked requirement, scope/non-goals, API/schema impact, permission checks, failure behavior, acceptance examples, test evidence, telemetry, dependencies, and owner. Use real owners and estimates only when assigned.

## Review gates

Product gate: user/problem/MVP and external-data policy agreed. Design gate: threat boundaries, ownership, schema, and contracts reviewed. Merge gate: meaningful tests, code review, contract compatibility, and docs updated. Release gate: reference workflow, migration/rollback, operational ownership, and measured acceptance evidence.

## Evidence record template

Record requirement/test ID, source commit, environment, workload/fixture revision, provider/model version, expected result, actual result, timestamp, and evidence link. Redact sensitive data. A checked box without reproducible evidence is not acceptance.
