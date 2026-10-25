# Testing and Quality Strategy

## Tests by layer

| Layer | Tools | Meaningful coverage |
|---|---|---|
| Java logic | JUnit + Mockito | Membership policy, job transitions, approval validity, integration failures |
| Backend integration | JUnit with disposable services | Real PostgreSQL migrations, scoped queries, outbox transactions, Kafka retry/deduplication |
| Frontend | React Testing Library | Login states, repository selection, loading/errors, chat citations, review interactions |
| Python | Pytest | Parsing, source ranges, chunking, retrieval filters, context budgets, tool gateway policy |
| Contracts | OpenAPI/protobuf/event validation | Java/Python compatibility and backward-compatible event evolution |
| System workflows | API smoke tests and Playwright | Connect → index → question → citations; later proposal → approval → PR |
| AI evaluation | Versioned question set and offline fixtures | Retrieval relevance, reference correctness, unsupported claims, latency and cost |

Use deterministic provider doubles for routine CI and a small budget-limited live-provider evaluation suite separately. A successful LLM HTTP response is not proof of a correct answer.

## Required scenarios

- Cross-workspace and cross-project access attempts, including vector search and job lookups.
- Invalid/replayed GitHub webhooks and revoked installation access.
- Worker crash, lease expiry, duplicate events, provider timeout, and partial vector writes.
- Stale source revision, empty retrieval, malformed model output, and invalid citation ranges.
- Secret-like source content exclusion and sanitized logs/errors.
- Malicious instructions inside repository files and MCP tool output.
- Later: sandbox network/file restrictions, expired approvals, modified patch hashes, and changed base revisions.

## CI gates

Frontend type-check/build and interaction tests; backend compile/unit/integration tests; Python lint/type checks and tests as configured; contract validation; secret/dependency checks; container build; and migration validation. SonarQube adds static-analysis gates when integrated. Use the explicit retrieval/citation/isolation/usefulness gates in [AI Design](20-ai-retrieval-tools-and-mcp.md); do not substitute code coverage for behavior evidence.

## Release acceptance

Every PRD acceptance criterion must have recorded evidence. Demonstrate the complete reference workflow in a clean environment. Record benchmark workload, commit, model versions, measured results, and known limitations. Block release for unauthorized data exposure, unreliable citations on the agreed test set, or unrecoverable job/data corruption.

## Performance testing

Measure cold/warm retrieval, concurrent chats, repository size, embedding throughput, queue backlog, and external-provider latency separately. Verify rate limits and backpressure before increasing concurrency. Performance targets in the PRD are provisional until benchmarked.
