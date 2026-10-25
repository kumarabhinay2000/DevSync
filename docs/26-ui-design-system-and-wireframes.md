# UI Design System and Wireframe Handoff

Visual reference: [dashboard wireframe](wireframes/dashboard.svg), [chat wireframe](wireframes/chat.svg), and [review wireframe](wireframes/review.svg). These are static layout specifications, not working applications or final pixel-perfect mockups.

## Design tokens

Use Tailwind semantic theme variables consumed by shadcn/ui. Light baseline: background `#F8FAFC`, surface `#FFFFFF`, foreground `#0F172A`, muted text `#475569`, border `#CBD5E1`, primary `#1D4ED8`, primary text `#FFFFFF`, success `#166534`, warning `#92400E`, danger `#B91C1C`. Do not use muted/border tokens for essential text. Verify contrast in implemented states rather than assuming every token combination is accessible.

Spacing scale 4/8/12/16/24/32/48px; page max width 1440px; desktop sidebar 224px; controls minimum height 40px and touch targets 44px; radius 8px cards/controls; body 14–16px, page title 24px, code 13px monospaced. System sans-serif stack; system monospace code stack. Theme and typography preferences never alter code contents.

Breakpoints: below 768px use drawer navigation and single-column content; 768–1199px use two panes with modal source viewer; ≥1200px allow three-pane chat/source view. Chat composer stays reachable; reserve space so fixed elements do not cover content. Respect reduced motion; status does not depend on animation.

## Component behavior

ProjectCard: repository name, selected branch, indexed SHA, last successful index, job state, context actions by permission. RepositoryPicker: accessible combobox with server pagination and explicit private marker. JobTimeline: timestamps/stages/attempts, no fake percentage. CitationLink: numbered reference, path, exact SHA and lines, accessible name with context. SourcePanel: immutable revision, line numbers, selectable code, range highlighting and copy action. DiffPanel: file-level summary plus unified/split view; additions/deletions labelled beyond color.

ApprovalDialog: exact repository/base/hash, test outcome, action, expiration and explicit approve/reject buttons. No preselected approval; changes invalidate prior approval. ErrorBanner: sanitized summary, request ID and actionable retry. EmptyState: why content is absent and a permitted next action. Destructive project removal uses a review dialog naming affected project and retention behavior; this is product UX, not permission to delete the user's local source.

## Screen acceptance checklist

Cover empty, loading, retry, success, long names, small viewport, keyboard focus, screen-reader labels and forbidden state for every screen. Disable controls only with explanation. Preserve unsent question text after a recoverable request error; never resend automatically on navigation. Do not display proposed/unimplemented features as functional buttons in the MVP.

## Localization and time

Initial product interface is English; content accepts Unicode questions and filenames. Store timestamps in UTC and display in the user's selected timezone with an exact tooltip. Relative ages must not hide the commit revision. Do not hard-code server-local dates or invent user locale from repository language.
