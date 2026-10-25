# Data Privacy, Cost, and Support Policy

## Processor enablement

Default private-source sharing is off. A workspace administrator records approved processor ID, purpose (chat, embeddings, vectors, telemetry), endpoint/region, data categories, configured retention, deletion procedure, policy review date and owner. API enablement requires the allowlist and workspace setting; model convenience fallback cannot change processors. This is an engineering policy, not a legal certification or provider contract.

Developer questions and generated diffs can contain private source. Embeddings remain private derived data. Sending data to a provider is a separate boundary from storing it in PostgreSQL. Never promise zero retention unless the actual configured provider contract supports it and has been reviewed.

## Budget ledger

Ledger transactions reserve worst-case input/output token and monetary cost before network requests. Serialize reservations by workspace/day; account for in-flight calls when enforcing caps. Use UTC budget days and show reset time in user timezone. Release unused reservations after known provider outcomes; uncertain timeouts remain REVIEW_REQUIRED until reconciled instead of assuming zero cost. Prices are configured with provider/model/version/effective date. Disable live calls when prices are missing or stale beyond the configured seven-day review interval.

Track chat, embeddings, indexing retries and tool-induced model calls separately. Budget alerts at 80%; at 100%, stop new chargeable work, retain queued jobs, and explain when or how work can resume. An administrator can revise limits with an audit event. No client or model argument may override the budget.

## Retention and export

Apply the schedule in the baseline decisions. Exports are disabled in the initial UI; any later export feature requires owner scope, bounded asynchronous generation, short-lived download authorization and audit records. Do not expose database backups as a user export. Account removal revokes membership and disables identity association; retain only required minimal audit/billing records under reviewed policy.

## Support and escalation

Support requests contain request/job ID, timestamp/timezone, affected workflow, sanitized error code and reproduction steps. Never request access tokens, private keys or full source dumps. First responder checks known incidents and scoped logs; escalate access-control concerns immediately to the security owner and apply the incident procedure. Actual contact assignments belong to the deployment record, not invented sample email addresses.

## Responsible limitations

AI output is advisory until reviewed. Static findings and passing tests do not prove absence of defects. Product UI communicates the indexed revision, unsupported context and approval scope at the point where users decide to act. Do not label the product compliant, enterprise-certified, production-ready or vulnerability-free based on this document set alone.
