# Contract Sources

Version 1.0.0 design baseline. These are contract artifacts, not deployed endpoints.

## API and RPC

- [OpenAPI 3.0.3](openapi.json): complete target REST contract, with MVP/automation phase tags.
- [Protobuf](proto/devsync/ai/v1/ai.proto): AiService and JobProgressService; answers, index validation, lease claim/renew, progress and atomic completion.

Bearer identity alone never grants project access. Every scoped operation enforces active workspace membership and explicit project grants. Conversation reads are owner-private. GitHub webhooks use signature verification instead of bearer authentication. See [API semantics](../docs/25-api-semantics-and-errors.md) and [AI/tool/MCP design](../docs/20-ai-retrieval-tools-and-mcp.md).

## Kafka schemas and matching fixtures

| Schema | Fixture |
|---|---|
| [analysis-requested](events/analysis-requested.v1.schema.json) | [positive example](examples/analysis-requested.json) |
| [cleanup-requested](events/cleanup-requested.v1.schema.json) | [positive example](examples/cleanup-requested.json) |
| [index-requested](events/index-requested.v1.schema.json) | [positive example](examples/index-requested.json) |
| [job-completed](events/job-completed.v1.schema.json) | [positive example](examples/job-completed.json) |
| [job-failed](events/job-failed.v1.schema.json) | [positive example](examples/job-failed.json) |
| [pull-request-requested](events/pull-request-requested.v1.schema.json) | [positive example](examples/pull-request-requested.json) |
| [retry-dead-letter](events/retry-dead-letter.v1.schema.json) | [positive example](examples/retry-dead-letter.json) |
| [test-requested](events/test-requested.v1.schema.json) | [positive example](examples/test-requested.json) |

Topics use the schema eventType value; retry and dead-letter topics wrap the validated original event. Commands partition by project ID. Initial topic partitions: 3; local replication 1, production replication 3/min ISR 2. Producer publication uses transactional outbox and consumers use durable idempotency; delivery remains at least once. Normal retention 7 days, dead-letter 14 days. No credentials or full source in events.

## Tool schemas

| Tool | Arguments | Normalized result |
|---|---|
| create_pull_request | [input](tools/create_pull_request.input.schema.json) | [output](tools/create_pull_request.output.schema.json) |
| get_index_status | [input](tools/get_index_status.input.schema.json) | [output](tools/get_index_status.output.schema.json) |
| get_quality_findings | [input](tools/get_quality_findings.input.schema.json) | [output](tools/get_quality_findings.output.schema.json) |
| propose_patch | [input](tools/propose_patch.input.schema.json) | [output](tools/propose_patch.output.schema.json) |
| read_source_range | [input](tools/read_source_range.input.schema.json) | [output](tools/read_source_range.output.schema.json) |
| run_tests | [input](tools/run_tests.input.schema.json) | [output](tools/run_tests.output.schema.json) |
| search_code | [input](tools/search_code.input.schema.json) | [output](tools/search_code.output.schema.json) |

Model arguments cannot supply workspace, project, generation, credential or execution capabilities. The gateway injects authenticated scope, validates paths/ranges, applies byte/token limits, checks approvals and audits outcomes. Native and MCP adapters must produce the same normalized results.

## Validation and evolution

Run [the documentation validator](../scripts/validate_documentation.py) with [pinned dependencies](../scripts/requirements-docs.txt); see [commands](../docs/27-configuration-and-toolchain.md). It validates OpenAPI, JSON Schemas and fixtures/negative cases, compiles protobuf, parses SQL and checks local document links. See [recorded results](../docs/reference/validation-report.md). Application conformance, migration execution and live provider tests remain implementation gates.

Additive contract changes require compatible consumers. Never reuse protobuf field numbers. Breaking event changes get a new event version/topic and migration window. See [governance](../docs/23-engineering-governance-and-backlog.md).
