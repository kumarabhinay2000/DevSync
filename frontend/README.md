# DevSync AI — Frontend

Landing page for DevSync AI. Stack follows [docs/DEVELOPMENT-SETUP.md](../docs/DEVELOPMENT-SETUP.md):
React + TypeScript, Vite, Tailwind CSS v4 (semantic tokens in `src/styles/index.css`), Radix primitives.

## Commands

Run from this directory (Node 22.12+):

```powershell
npm ci          # install exact lockfile dependencies
npm run dev     # http://localhost:5173
npm run build   # type-check + production build
npm run lint
```

## Layout

- `src/features/landing/` — page sections (Header, Hero, Workflow, Features, ContextDetail, Trust, Integrations, Faq, FinalCta, Footer)
- `src/components/ui/` — Button, Accordion
- `src/components/domain/` — BrandMark, CodeBlock, Citation
- `src/styles/index.css` — design tokens

All code, paths and commit references on the page are illustrative sample data.
