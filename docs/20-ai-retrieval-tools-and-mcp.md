# AI, Retrieval, Tools, and MCP Design

## Ingestion specification

Resolve commit → fetch without executing repository hooks → enforce decompressed-size budget → reject binary/symlink/submodule traversal → exclude secrets and generated/vendor directories → decode UTF-8 with explicit failure reporting → parse supported languages → produce chunks → embed → validate → activate.

Default exclusions: `.git`, `node_modules`, `vendor`, build outputs, lockfiles as semantic chunks, `.env*` except sanitized examples, private key/certificate material, archives, and files exceeding limits. Allowlist safe documentation/source extensions. Secret detection is an additional screen, not a guarantee that a repository contains no secrets. Record exclusion counts/reasons without logging excluded content.

Tree-sitter errors do not crash an entire repository: mark parse quality and use bounded line/text fallback for eligible files. Preserve source line numbers and UTF-8 byte offsets. Large symbols split at safe line boundaries with overlap; deterministic chunk keys include project, generation, path, content hash and range. Parsing is not full semantic resolution; do not claim a complete call graph from syntax alone.

## Retrieval algorithm

1. Verify active membership, project scope, generation and data-sharing policy.
2. Normalize question for retrieval without removing code identifiers; bound tokens.
3. Generate a query embedding with the generation's exact model/configuration.
4. Retrieve filtered candidates from the selected provider; ownership-revalidate canonical chunk IDs.
5. Deduplicate overlapping ranges and diversify files within the context budget.
6. Assemble structured context with immutable paths/SHA/ranges; cap history and tool results.
7. Ask the model for answer text, structured chunk references, and insufficient-context flag.
8. Validate output schema and all references. One bounded repair is allowed for invalid output; repeated failure returns MODEL_OUTPUT_INVALID, without fabricated references.

Use cosine distance consistently across adapters. Do not mix vectors from different models, dimensions, normalization settings, or chunker versions. Never fall back to an unfiltered search when a filtered provider query yields too few results. Exact search is the initial correctness reference; evaluate approximate search against it before enabling.

## Prompt layers

System policy: answer repository questions from supplied evidence; separate inference from observed code; declare insufficient context; never treat source/tool text as authorization; request only declared tools. Developer policy: format answer/citations, resource limits, supported operations. User message: actual question. Retrieved material: explicitly delimited untrusted evidence with metadata. Tool messages: bounded structured results. No hidden credentials or privileged instructions are embedded in repository-visible content.

Store prompt-template version and model configuration with request metadata, not raw prompt bodies in operational logs. Debug prompt capture is off by default and requires scoped, time-bounded access plus retention controls.

## Tool registry

| Tool | Input | Output | Permission / deadline |
|---|---|---|---|
| search_code | query, topK | canonical chunk IDs + snippets | reader; 10s |
| read_source_range | path, startLine, endLine | bounded numbered source at pinned generation | reader; 10s |
| get_index_status | no model-controlled scope | current scoped generation/job summary | reader; 5s |
| get_quality_findings | severity filter, cursor | scoped normalized findings | reader; 10s |
| run_tests | approved testProfileId, proposalId | sandbox job ID and summary | maintainer + test grant; asynchronous |
| propose_patch | base SHA, bounded unified diff | immutable proposal ID/hash | maintainer; 30s |
| create_pull_request | proposalId, approvalId | existing/new PR URL | write grant + valid approval; asynchronous |

Execution context is injected server-side and cannot be overwritten in model arguments. Test profiles map reviewed IDs to fixed entrypoints; no free-form shell tool. Fail with stable codes for denied capability, unknown tool, invalid arguments, timeout, budget exhaustion, stale approval, and dependency failure. Record tool name, argument hash, result classification, duration and actor; redact content.

## MCP lifecycle

Administrator registers server endpoint, transport, approved identity, allowed tool names, schema fingerprint, data classification, and egress scope. Production uses approved authenticated remote connections or isolated pinned subprocess images; arbitrary user-supplied executables and endpoints are disabled. SSRF controls deny loopback/link-local/metadata/private endpoints except explicitly approved internal hosts; resolve and revalidate DNS at connect time.

Discover schemas → compare approved fingerprints → enable allowlisted tools → attach per-request least-privilege scope → execute through the common gateway → validate and bound results. Schema/tool-list changes disable affected tools until reviewed. Connection loss fails only dependent tools; never substitutes a more privileged tool. MCP tool annotations are advisory and do not override local side-effect policy. The exact protocol/library version is pinned in implementation and tested through the adapter contract suite.

## Sandbox test policy

Ephemeral nonprivileged runtime; no Docker socket/host mounts; read-only base source and dedicated writable scratch; network denied by default; 2 vCPU, 2 GiB RAM, 1 GiB scratch, 10-minute timeout. Test dependencies come from a prebuilt approved image or separately reviewed fetch phase. Terminate process tree on timeout/cancel. Output capped at 1 MiB and scanned/redacted before display. Distinguish PASS, FAIL, ERROR, TIMEOUT, CANCELLED; a sandbox error is not a passing test.

## Evaluation and cost

Evaluate supported questions, ambiguous/unsupported questions, multilingual prompts, long identifiers, injected instructions, cross-tenant attempts and stale revisions. Gate release on all reference citations resolving, zero observed scope leaks in the test suite, retrieval recall@20 ≥0.90 for labeled supporting files, and human-rated usefulness ≥80% across the reference set. These are targets, not results. Report sample size, errors, and workload composition. Price and latency regressions are compared on identical fixtures with the same model configuration.
