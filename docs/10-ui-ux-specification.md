# UI/UX Specification

Status: Implementation baseline, not implemented screens. Routes and labels are proposed.

## Navigation and screen inventory

| Screen / route | Main content | Actions and constraints |
|---|---|---|
| /login | Product purpose, identity-provider sign-in | Sign in; show safe login failure and retry |
| /workspaces | Authorized workspace cards | Select workspace; do not expose other memberships |
| /w/:workspaceId/projects | Project cards, search, index status | Connect repository when permitted; paginated results |
| /p/:projectId/overview | Repository, branch, indexed SHA, latest jobs | Reindex, cancel active job, open chat |
| /p/:projectId/chat/:conversationId | Conversation, answer citations, source viewer | Ask question; open cited revision; retry failed request |
| /p/:projectId/jobs/:jobId | Current stage, attempt, timestamps, sanitized errors | Cancel/retry according to durable job state |
| /p/:projectId/findings | Later: severity filters and source-linked findings | Inspect static-analysis evidence |
| /p/:projectId/proposals/:proposalId | Later: diff, tests, base SHA, approval history | Approve exact patch; create PR if policy permits |
| /w/:workspaceId/settings | Membership, integrations, limits | Explicit permission checks; audit mutations |

## Chat desktop wireframe

```text
+-----------------------------------------------------------------------+
| DevSync AI | Workspace / Project | Indexed: main @ abc123 | User       |
+----------------+--------------------------------+---------------------+
| Project        | Conversation                   | Cited source        |
| Overview       | You: Where is login checked?   | path + commit       |
| Chat           | AI: Explanation [1] [2]        | numbered source     |
| Jobs           |                                | selected line range |
| Findings*      |                                |                     |
| Settings       | [Ask about this repository...] |                     |
+----------------+--------------------------------+---------------------+
```

`*` Later feature. On narrow screens use a collapsible navigation drawer and a source panel opened from a citation. Keep the current question and answer readable without horizontal page scrolling; code can scroll within its own container.

## Connect-repository flow

Select integration → choose accessible repository → select branch → review exclusions and provider data-sharing summary → connect → show indexing job. If no integration exists, route an authorized administrator to integration setup. Do not silently request broader repository permissions.

## State and interaction requirements

Every data screen defines loading, empty, success, forbidden, not-found, and recoverable-error states. A project without an active index disables repository Q&A with a link to job status. A replacement index building in the background does not hide the previous active index; visibly label the revision used for each answer.

Disable repeat mutation submissions while pending and preserve the idempotency key across a network retry. A cancellation request displays “Cancellation requested” until the backend confirms a terminal state. Do not invent progress percentages: show known stages and counts only.

Render generated Markdown through a sanitizer, disable raw HTML, and validate external link protocols. Source links open the exact indexed SHA. Never show fabricated citations or a confidence percentage without a defined measurement.

## Accessibility and review acceptance

Use semantic headings, explicit form labels, keyboard-accessible dialogs, visible focus, announced asynchronous status, and non-color-only status indicators. Verify chat, repository connection, and error recovery with keyboard-only interaction. Check mobile layout and long source paths. [Design tokens and three static SVG wireframes](26-ui-design-system-and-wireframes.md) complete the layout handoff; final implemented-screen visual/accessibility testing remains a delivery gate.
