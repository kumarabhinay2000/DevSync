# Deployment and Operations Plan

This document describes intended infrastructure. No Docker Compose files, pipelines, dashboards, or Kubernetes resources have been created yet.

## Local development

Planned Docker Compose services: frontend, Spring Boot API, Python AI service, indexing worker, PostgreSQL with pgvector, Redis, and Kafka. SonarQube and observability can run in optional profiles to reduce local resource use. External identity and model providers use developer credentials or local test doubles.

Provide `.env.example` with variable names and safe placeholders, readiness checks, documented service ports, migrations, and a small fixture repository. Use the [target runtime families and locking procedure](27-configuration-and-toolchain.md). Do not commit real credentials.

## CI and delivery

GitHub Actions validates pull requests and builds immutable container images. Shared scripts define build/test behavior so Jenkins can invoke the same checks. Jenkins is intended for a separate enterprise/staging/production delivery requirement, not redundant competing deployments.

Suggested release flow: checks → image build → scan → image digest publication → staging migration/deployment → smoke tests → authorized production release. Do not deploy unreviewed repository-generated code into application infrastructure.

## Kubernetes target

Separate API, AI service, and worker deployments. Configure resource requests/limits, readiness/liveness checks, graceful shutdown, workload identity, restricted network policies, secrets injection, and environment-specific configuration. Scale HTTP services by measured load and workers by backlog, with bounded model-provider concurrency.

Prefer managed PostgreSQL, Kafka, and Redis when budget and hosting permit. Running stateful dependencies in-cluster requires explicit storage, backup, upgrade, and recovery ownership. The baseline is cloud-neutral Kubernetes with externally operated stateful dependencies; cloud account and endpoints are deployment inputs.

## Observability

OpenTelemetry instruments browser/API requests where appropriate, gRPC calls, worker tasks, database operations, and external provider requests. Propagate trace context through Kafka envelopes. Prometheus stores operational metrics; Grafana displays dashboards and alerts. Tempo is the baseline trace backend; Prometheus stores metrics rather than traces.

Track API latency/error rate, indexing success/duration, consumer lag, worker lease expiry, retrieval latency, answer latency, token/cost estimates, rate limits, and vector-provider failures. Avoid user IDs, file paths, question text, and other high-cardinality/private content in metric labels.

## Failure runbooks

| Failure | Initial response and recovery |
|---|---|
| LLM/embedding provider unavailable | Bound retries, show useful status, preserve jobs, pause expensive retries, alert on sustained failures |
| Kafka consumer backlog | Check downstream health and rate limits before scaling workers; inspect poison messages and dead-letter queue |
| Worker crash | Reclaim expired lease and resume/retry idempotently; never activate partial generations |
| Vector provider unavailable | Keep project metadata accessible; report search unavailability; rebuild vectors from retained authorized chunks when appropriate |
| Database outage | Stop unsafe mutations, restore connectivity or approved backup, verify migration and consistency before resuming |
| Bad application release | Roll back image digest if schema-compatible; forward-fix incompatible migrations using the recovery plan |

## Backup and release readiness

Recovery targets are RPO 15 minutes and RTO 4 hours for canonical data; see the baseline and detailed recovery specification. Back up PostgreSQL and required artifacts; verify restore in an isolated environment. Document vector rebuild duration, cache loss behavior, Kafka retention, and credential recovery. A backup is not considered verified until restoration has been demonstrated.
