# Delivery, Observability, and Recovery Specification

## Environment topology

Local: developer machine, synthetic/public fixtures, no production secrets. Staging: isolated namespace/data stores, synthetic evaluation data, restricted integrations, same immutable images/config schema as production. Production: namespace `devsync-prod`, externally operated stateful dependencies, TLS ingress, private internal services and service identities. Restore drills use a separate recovery namespace with external writes blocked.

Proposed ports: browser 5173, API 8080, FastAPI health/admin 8000, AI gRPC 50051, backend worker-control gRPC 50052, PostgreSQL 5432, Redis 6379, Kafka 9092 internally, Keycloak 8081 locally, SonarQube 9000, Grafana 3000, Prometheus 9090, Tempo 3200. Expose only frontend/API ingress publicly; local port binding is loopback. Health/admin endpoints are not public application APIs.

## Pipeline contract

PR jobs: dependency installation from locks → formatting/lint/type checks → JUnit/Mockito, React Testing Library, Pytest → ephemeral integration services → contract/schema checks → build → secret/dependency/container scans → SonarQube analysis → artifact publication. Main-branch pipeline publishes images tagged with commit and digest, an SBOM, provenance metadata, contract bundle, and test/evaluation report. Do not make build secrets available to untrusted fork code.

Jenkins accepts only an immutable approved image digest, contract/migration bundle, environment and release ID. Use a deployment lock per environment, workload identity, environment-specific credentials, staging verification and an explicit production release gate. No mutable `latest` image tag for releases. Record previous digest and config revision. Schema migrations run once as a separately controlled job before compatible workloads are rolled out.

## Kubernetes resource baseline

| Workload | Initial replicas | CPU request/limit | Memory request/limit |
|---|---|---|---|
| API | 2 | 250m / 1000m | 512 MiB / 1 GiB |
| AI service | 2 | 250m / 1000m | 512 MiB / 2 GiB |
| Index worker | 1 | 500m / 2000m | 1 GiB / 4 GiB |
| Frontend web server | 2 | 50m / 250m | 64 MiB / 256 MiB |

These are sizing hypotheses. Set graceful termination ≥90 seconds for worker lease handling; stop claiming jobs first. Liveness tests process health, not transient external provider status. Readiness requires required local initialization; dependency failures produce appropriate degraded/failed requests without restart storms. Use nonroot users, read-only root filesystems, dropped capabilities, resource quotas and restrictive egress. Restrict service-account API permissions; test executor is separate from API/index workers.

## Metrics and alerts

| Signal | Metric design | Initial alert |
|---|---|---|
| API failures | requests_total by route template/method/status class | >5% 5xx for 5 minutes with ≥100 requests |
| Metadata latency | request duration histogram | p95 >500ms for 15 minutes |
| Q&A failures/latency | answers_total by outcome and duration histogram | >10% dependency/output errors for 10 minutes |
| Queue delay | oldest queued job age; consumer lag | oldest job >10 minutes for 10 minutes |
| Worker recovery | lease_expired_total, active job count | repeated lease expiration >3/15 minutes |
| Model spending | reserved/actual tokens and configured-price cost | 80% daily budget warning; 100% enforced stop |
| Cleanup | oldest cleanup age, failed attempts | any project cleanup older than 24 hours |
| Backups | last successful backup/WAL age | RPO coverage gap >15 minutes |

Counters/histograms must use bounded labels; project IDs, paths and prompts belong in authorized diagnostic records only. Sample successful traces initially at 10%, collect errors at the configured collector policy, and verify redaction before export. Logging includes timestamp, level, service, deployment revision, request/trace/job ID and stable error code, never raw bearer/context tokens.

## Recovery and operational commands

The following inspection commands are real Kubernetes CLI patterns for the target naming contract; they require a configured cluster and are not startup commands for this documentation-only repository:

```powershell
kubectl config current-context
kubectl -n devsync-prod get deployments,pods,jobs
kubectl -n devsync-prod rollout status deployment/devsync-api --timeout=180s
kubectl -n devsync-prod describe deployment devsync-api
```

Before mutation, verify context, namespace, release ID, schema compatibility and incident/release authority. Roll back a compatible API workload with `kubectl -n devsync-prod rollout undo deployment/devsync-api`, then verify rollout status and the full smoke workflow. AI/worker/frontend rollbacks must use the recorded matching release manifest, not independent guesses. This command has not been executed because no cluster was provisioned.

Restore procedure: stop intake/writes → isolate recovery environment → restore PostgreSQL full backup plus WAL to chosen point → restore artifacts → load compatible configuration/images → verify scope and generation consistency → reconcile outbox/job leases and external PR side effects → rebuild missing vectors → resume a controlled subset → complete workflow tests → restore full traffic. Record actual RPO/RTO and missing data. Kafka offsets alone are not evidence that database mutations or GitHub writes completed.

Rotate integration/model credentials by adding replacement references, validating in staging, switching live configuration, verifying requests, revoking old credentials and recording the audit event. Never print secret values during rotation. Review alert routing and recovery drills monthly; production launch requires real contact assignment.
