# DevSync AI — UI Theme and Style Guide

Date: 25 October 2026. Scope: standalone visual and interaction specification for React, TypeScript, Tailwind CSS and shadcn/ui. No components are implemented by this document.

## 1. Visual direction

Use a calm developer-workspace style: slate surfaces, blue primary actions, compact but readable content and clear separation between explanation, source and proposed changes. Default theme is light; dark is an explicit supported variant. Avoid decorative gradients, glass effects and excessive shadows in data/code screens. Reserve strong color for action, status and selected context.

## 2. Semantic color palette

| Token | Light | Dark | Usage |
|---|---|---|---|
| background | #F8FAFC | #0B1220 | Page canvas |
| surface | #FFFFFF | #111827 | Cards, panels, dialogs |
| surface-muted | #F1F5F9 | #1E293B | Table headers, inactive panels |
| foreground | #0F172A | #F1F5F9 | Primary text |
| muted-foreground | #475569 | #CBD5E1 | Secondary text |
| border | #CBD5E1 | #475569 | Panel/control boundaries |
| primary | #1D4ED8 | #93C5FD | Primary action and links |
| primary-hover | #1E40AF | #BFDBFE | Hovered primary action |
| primary-foreground | #FFFFFF | #0F172A | Text/icons on primary fill |
| selected-background | #DBEAFE | #1E3A5F | Active navigation/selection |
| focus-ring | #2563EB | #93C5FD | Keyboard focus indicator |
| success-foreground | #166534 | #86EFAC | Ready/passed text |
| success-background | #DCFCE7 | #143522 | Ready/passed surface |
| warning-foreground | #92400E | #FDE68A | Caution/cancel requested |
| warning-background | #FEF3C7 | #422B0D | Caution surface |
| danger-foreground | #B91C1C | #FCA5A5 | Failed/rejected/destructive text |
| danger-background | #FEE2E2 | #451A1A | Error surface |
| info-foreground | #1E40AF | #BFDBFE | Informational status |
| info-background | #DBEAFE | #172D4D | Informational surface |

Map these semantic values to Tailwind/shadcn theme variables rather than scattering raw colors across components. Use foreground/background token pairs together. Danger text token is not automatically a button fill token: light destructive buttons use #B91C1C with white text; dark destructive buttons use #FCA5A5 with #0F172A text.

Persist only theme preference locally (`light`, `dark`, `system`); default first visit to light. Apply theme before painting where feasible to avoid flashes. A system option follows device preference. Theme storage must never contain access tokens or repository data.

## 3. Fonts and typography

Primary UI family: system sans-serif for fast rendering and no third-party font requests. Windows uses Segoe UI; Apple uses platform system font; other environments use the first installed fallback. Code uses system monospace. No remote font download is required.

```css
--font-ui: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,
           "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
--font-code: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
             "Liberation Mono", "Courier New", monospace;
```

| Role | Size / line-height | Weight | Usage |
|---|---|---|---|
| Page title | 24px / 32px | 600 | One main title per screen |
| Section title | 20px / 28px | 600 | Main content sections |
| Panel title | 16px / 24px | 600 | Cards, source/diff headers |
| Reading body / AI answer | 16px / 26px | 400 | Longer explanations |
| UI body | 14px / 22px | 400 | Forms, tables and navigation |
| Form label / button | 14px / 20px | 500 | Controls and labels |
| Metadata | 12px / 18px | 400 | SHA/time/helper details |
| Code / diff | 13px / 20px | 400 | Source and patches |
| Status badge | 12px / 18px | 600 | Compact status |

Default letter spacing is normal; page titles can use -0.02em. Never use uppercase for paragraph text or source identifiers. Keep explanatory prose near 65–80 characters/line. Use tabular numerals for durations and counts. Code keeps original case, indentation and exact text; typography cannot rewrite source.

## 4. Layout, spacing and density

Base spacing unit 4px; allowed scale 4/8/12/16/24/32/48px. Page padding 24px desktop, 16px mobile. Max content width 1440px. Desktop sidebar 224px; top bar 64px. Cards/panels use 16–24px padding and 16–24px gaps. Table row minimum height 44px; allow wrapping important content rather than hiding it.

Chat uses navigation, conversation and optional source panes. Conversation minimum width 360px on desktop, source pane 360–480px when space allows. Composer grows up to six visible lines before internal scrolling. Use flex/min-width handling so code overflow stays within its pane, not the entire page.

| Width | Layout |
|---|---|
| <768px | One column; drawer navigation; source opens as full-height sheet |
| 768–1199px | Sidebar plus main content; source opens as dialog/sheet |
| ≥1200px | Three-pane chat when content widths permit |

Use 8px corner radius for controls/cards, 12px for dialogs, pill radius for badges only. Use subtle elevation for overlays; regular cards rely on borders. Dialog width 480–640px for forms, up to 960px for diff review; scroll inside viewport with actions always reachable.

## 5. Buttons, forms and navigation

Primary button: one clear next action per action group, blue fill, semibold label. Secondary: surface + border. Ghost: low-emphasis toolbar action. Destructive: danger palette and explicit verb. Icon-only buttons need accessible labels and tooltips; icon artwork 16/20px, touch target at least 44px. Use one consistent outline icon family; filled variants only for clearly defined states.

Inputs have persistent labels, helper text and inline errors. Placeholder text is an example, never the only label. Required fields are marked consistently in text. Validate on submit and after interaction; do not reject partial input while the user types. Disabled actions explain missing permission, index readiness or budget state.

Active navigation uses selected background plus text/icon emphasis and an active indicator; do not communicate selection only through hue. Breadcrumbs show workspace/project and optional feature location; exact indexed SHA remains visible on code-aware screens.

## 6. Component inventory

| Component | Required content and states |
|---|---|
| ProjectCard | Repository, branch, exact indexed SHA, status, last successful index, permitted actions |
| RepositoryPicker | Search, accessible paginated options, private marker, access/integration errors |
| JobTimeline | Real stage, attempts, timestamps, cancel intent, sanitized failure; no invented percentage |
| ChatMessage | User/AI identity, readable content, citations, error/insufficient-context state |
| Citation | Reference number, file, SHA, line range, keyboard-openable source |
| SourceViewer | Immutable revision, line numbers, selected range, contained horizontal scroll, copy feedback |
| FindingsTable | Severity icon/text, rule, source range, filter, empty/error state |
| DiffViewer | Changed paths, unified/split view, plus/minus labels, immutable patch hash |
| ApprovalDialog | Repository, base SHA, patch hash, test result, exact action, expiry, explicit decision |
| BudgetIndicator | Remaining usage, reset time, limit reached and permitted next action |
| EmptyState | Reason and one authorized next action |
| ErrorBanner | Sanitized error, request ID, recovery action; no stack traces or secrets |

## 7. Code, diff and AI content

Syntax highlighting is subtle and theme-aware; source text stays selectable. Selected lines use a background and range marker. Diff additions use success surface + `+`, deletions danger surface + `−`; preserve all meaningful whitespace and provide a wrap toggle. Review defaults to unified on narrow screens.

AI answers use restrained Markdown: paragraphs, lists, short headings and code blocks. Citations attach to the claims they support. Sanitize output, block raw HTML and unsafe link protocols. Show insufficient context plainly; do not invent a confidence percentage. Keep generated suggestions distinguishable from repository evidence and approved changes.

## 8. Interaction states and motion

Every screen covers loading, empty, populated, forbidden, missing, recoverable failure and offline/dependency failure where relevant. Pending mutations prevent repeated submission while keeping the original idempotency key. Preserve unsent question text after recoverable errors. Cancellation is pending until backend confirmation.

Use 120–180ms hover/focus transitions and 180–220ms panel transitions. No looping decorative animation. Respect reduced-motion preference. Skeletons match final layout; use real progress counts only when known. Success toasts are brief and nonblocking; important errors remain visible inline.

## 9. Accessibility and writing style

Provide semantic landmarks/headings, programmatic labels, visible 2px focus rings with offset, focus trap/return for dialogs, keyboard escape where safe, and announced asynchronous status. Target ordinary text contrast ≥4.5:1, large text ≥3:1 and meaningful control boundaries ≥3:1; verify actual rendered combinations. Do not rely on color alone. Ensure layout works at 200% zoom and narrow viewport.

Use direct action labels: “Connect repository”, “Start indexing”, “Ask a question”, “Review changes”, “Create pull request”. Explain what failed and the next step. Avoid marketing language in errors. Display timestamps in user timezone with precise UTC/source details available; never hide commit identity behind a relative age.

## 10. Visual acceptance

Check both themes, keyboard flows, long Unicode filenames, large code blocks, empty/error/permission states, narrow layouts, zoom, reduced motion, source copy behavior and unchanged code whitespace. This document specifies the intended design; browser screenshots and implemented accessibility results are separate implementation evidence.
