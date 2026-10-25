# Operational Runbooks

Status: Operational procedures for implementation, completed by [Delivery and Recovery](21-delivery-observability-and-recovery.md). Environment naming, inspection/rollback commands, alerts, owner roles and recovery targets are specified there. Actual cluster access, contact assignments and measured recovery evidence are deployment inputs; these procedures do not claim a running production system.

## Incident handling

Assign an incident lead, record start time and user impact, preserve sanitized evidence, and identify the last deployment/configuration change. Contain data exposure or unsafe writes first. Communicate observed impact and the next update time. After recovery, verify affected workflows and publish corrective actions with owners.

Proposed severity: SEV1 for suspected private-source exposure or broad outage; SEV2 for major indexing/chat failure; SEV3 for limited degradation with a workaround. Final escalation and response targets need an operational owner.

## Indexing backlog or stuck job

1. Inspect queue age, consumer lag, worker health, leases, and provider errors using correlated job IDs.
2. Determine whether the bottleneck is database, provider quota, CPU, or poison input.
3. Pause or reduce intake if backlog growth threatens capacity; avoid unlimited retry or blind scaling.
4. Reclaim an expired lease using the supported job mechanism; preserve attempt history.
5. Retry a dead-letter event only after fixing its cause and confirming deduplication.
6. Verify successful activation and that no partial generation became visible.

## Suspected authorization leak

Disable affected integration/tool capability, revoke compromised credentials, restrict impacted service access, and preserve minimal forensic evidence. Determine affected workspace/project/revision scope. Verify API, cache, vector, and internal execution-context boundaries before restoration. Follow organizational notification obligations through the designated owner; do not infer legal deadlines from this guide.

## Application rollback

Record deployed image digests and configuration revisions. Confirm schema compatibility with the previous release. Roll back the workload through the approved delivery system, verify readiness and smoke workflows, and monitor error/backlog recovery. If schema changes are incompatible, use the reviewed forward-fix or restore plan; do not run ad hoc destructive SQL.

## Database restore drill

Select a backup and documented restore point. Restore into an isolated environment with outbound integration writes disabled. Apply only the compatible application version. Validate memberships, project scope, active-generation consistency, job/outbox state, and sample citations. Reconcile external writes and queue offsets before resuming processing. Record observed data loss and recovery duration against the eventual RPO/RTO.

## Vector rebuild

Confirm canonical source/chunk retention and model configuration. Build a new inactive generation or provider index, regenerate embeddings as required, validate scope and sample retrieval, then switch the active pointer. Keep the previous generation until rollback policy permits cleanup. Model/dimension changes require re-embedding, not relabeling vectors.

## Release checklist

- Approved scope and acceptance evidence; no unresolved access-control defects.
- Passing CI and reviewed contracts/migrations.
- Immutable images and environment configuration recorded.
- Secrets and external-provider privacy configuration verified.
- Staging smoke/evaluation results attached.
- Backup/restore and rollback approach verified for the release.
- Dashboards, alerts, release owner, and support handoff ready.

Exact operational commands must be added from tested infrastructure, with environment targets explicit. Avoid copy-paste deployment commands against an unknown cluster.
