# User Guide

Status: Intended product behavior; the application is not available yet. Screens follow [UI Specification](10-ui-ux-specification.md).

## Get started

Sign in with the configured identity provider. Select your workspace. A workspace administrator connects the GitHub integration with access only to intended repositories. A permitted user selects a repository and branch, reviews data-sharing/exclusion information, and starts indexing.

The job screen shows actual progress stages. Repository questions become available after an index is validated and activated. Large repositories and provider limits can affect duration; no indexing-time guarantee is currently established.

## Ask useful questions

Ask a focused question such as “Where is project access checked?” or “Which service handles repository indexing?” Review the cited files and exact commit. An answer describes the indexed revision and can become stale after new commits until reindexing completes.

An insufficient-context response means the available index did not support a reliable answer. Refine the question, check excluded files, confirm the branch, or request reindexing. Do not treat generated suggestions as verified changes.

## Jobs and recovery

Open job details for status and a sanitized error. A cancellation request may take time while a worker reaches a safe interruption point. Retry after correcting permissions, configuration, or provider availability. Contact the project maintainer with the job/request ID if failures repeat; do not share secrets in support messages.

## Later capabilities

Static findings, test execution, patch review, and pull-request creation arrive in later phases. An approval applies only to the displayed patch and base revision. Changes require renewed approval if either changes. A created PR still follows the repository's normal review/merge policy.

## Data and access

Use only repositories you are authorized to share with the configured processors. Workspace membership does not automatically provide source access. Administrators can revoke integrations or remove projects; cleanup targets 24 hours, while encrypted backups expire within the documented 30-day schedule; a delay triggers operational escalation.
