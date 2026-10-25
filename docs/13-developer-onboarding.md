# Developer Onboarding Guide

Status: Setup specification. Application manifests, build wrappers, Compose files, and runnable service code do not exist yet; there is no working startup command today.

## Prerequisites to pin during scaffolding

Git, Docker with Compose support, Node.js/package manager, JDK/build tool, and Python/package manager. Use the [runtime targets and dependency-locking procedure](27-configuration-and-toolchain.md), record exact validated versions in implementation toolchain files, and use them in CI. Do not rely on developers' global installations without documenting them.

## Expected repository structure

```text
frontend/             React application and interaction tests
backend/              Spring Boot application and database migrations
ai-service/           FastAPI, gRPC implementation, workers, Python tests
contracts/            OpenAPI, protobuf, and event schemas
infra/                Compose, Kubernetes, monitoring configuration
scripts/              Shared build, test, and delivery entry points
docs/                 Product, engineering, and operations documentation
```

The repository contains contracts, documentation, reference assets and documentation-validation scripts. Application service and infrastructure directories are planned.

## Configuration inventory

| Configuration group | Intended variables / values | Secret handling |
|---|---|---|
| Database | DATABASE_URL, DATABASE_USER, DATABASE_PASSWORD | Password secret; separate service roles |
| Cache / queue | REDIS_URL, KAFKA_BOOTSTRAP_SERVERS, broker auth references | Credentials in secret store |
| Identity | OIDC_ISSUER_URI, OIDC_CLIENT_ID, allowed redirect/origin configuration | Any client secret server-side only |
| GitHub | GITHUB_APP_ID, GITHUB_INSTALLATION_ID, private-key reference, webhook secret | Never browser-exposed |
| Models | LLM_PROVIDER, LLM_MODEL, EMBEDDING_MODEL, EMBEDDING_DIMENSION, provider-key reference | Server-side only |
| Vector search | VECTOR_PROVIDER, PINECONE_INDEX, provider-key reference | pgvector default; scoped provider credentials |
| Internal RPC | AI_GRPC_TARGET, TLS certificate/key references, execution-token audience | Service identity and short-lived context |
| Telemetry | OTEL_EXPORTER_OTLP_ENDPOINT, service name, sampling configuration | No source/prompt payloads by default |

The [reference environment file](reference/environment.example) provides canonical baseline names to synchronize with executable configuration. Never put backend secrets into frontend build-time variables.

## Required first-run workflow

Once scaffolding exists, the setup owner must document and verify: install pinned dependencies → copy safe example configuration → obtain developer credentials → start dependencies → migrate schema → start services → load fixture repo → run smoke checks → stop services without deleting persistent data.

Record exact commands only after running them in a clean checkout. Provide Windows PowerShell instructions for this workspace and CI/Linux equivalents where necessary. Mark destructive reset commands clearly and keep them separate from ordinary shutdown.

## Troubleshooting checklist

Check missing configuration, port conflicts, dependency health, migration state, identity redirect mismatch, GitHub installation permissions, model quota, and embedding dimension mismatch. Include sanitized request/job IDs when reporting a defect. Do not paste access tokens or private source into tickets.
