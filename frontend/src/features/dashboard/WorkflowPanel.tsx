import { Check, FileCode2, FileSearch, FolderGit2, GitBranch, MessageSquareText } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { CodeBlock } from '@/components/domain/CodeBlock'

const excerpt = `if (!hasProjectAccess(user, project)) {
    throw new AccessDeniedException("Project access denied");
}
return repositoryService.read(project);`

function Tile({
  icon,
  tone,
  title,
  caption,
}: {
  icon: ReactNode
  tone: string
  title: string
  caption: string
}) {
  return (
    <li className="flex min-w-0 flex-1 flex-col items-center rounded-xl border border-obs-border bg-white px-4 py-6 text-center">
      <span className={`flex size-[72px] items-center justify-center rounded-2xl ${tone}`}>{icon}</span>
      <p className="mt-4 text-[17px] font-bold">{title}</p>
      <p className="mt-0.5 font-mono text-[13px] text-obs-muted">{caption}</p>
    </li>
  )
}

/** Thin connector; the moving dots are decorative only. */
function Arrow() {
  return (
    <li aria-hidden className="hidden shrink-0 items-center sm:flex">
      <svg width="52" height="14" viewBox="0 0 52 14">
        <line x1="0" y1="7" x2="44" y2="7" stroke="#DCE1DC" strokeWidth="2" />
        <line x1="0" y1="7" x2="44" y2="7" stroke="#275DFF" strokeWidth="3.4" className="flow-dots" />
        <path d="M42 2l7 5-7 5" fill="none" stroke="#275DFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </li>
  )
}

export function WorkflowPanel() {
  return (
    <section
      aria-labelledby="workflow-title"
      className="rounded-2xl border border-obs-border bg-white p-6 shadow-soft"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-obs-muted">
        How your workspace connects
      </p>
      <h2 id="workflow-title" className="mt-1.5 text-[26px] font-bold leading-tight tracking-[-0.02em]">
        From your code to a useful answer
      </h2>

      <ol className="mt-6 flex flex-col items-stretch gap-3 rounded-2xl bg-ivory p-4 sm:flex-row sm:items-center">
        <Tile
          tone="bg-obs-selected text-cobalt"
          icon={<FolderGit2 className="size-9" strokeWidth={1.6} aria-hidden />}
          title="1. Repository"
          caption="api-service"
        />
        <Arrow />
        <Tile
          tone="bg-mint text-ink"
          icon={<FileSearch className="size-9" strokeWidth={1.6} aria-hidden />}
          title="2. Relevant code"
          caption="Indexed source"
        />
        <Arrow />
        <Tile
          tone="bg-cobalt text-white"
          icon={
            <span className="relative">
              <MessageSquareText className="size-9" strokeWidth={1.6} aria-hidden />
              <span className="absolute -bottom-2 -right-3 flex size-6 items-center justify-center rounded-full bg-mint text-ink ring-2 ring-cobalt">
                <FileCode2 className="size-3.5" aria-hidden />
              </span>
            </span>
          }
          title="3. Cited answer"
          caption="Check the source"
        />
      </ol>
      <p className="mt-3 text-center text-[13px] text-obs-muted">Illustrative workflow</p>

      <hr className="my-5 border-obs-border" />

      {/* Selected repository strip */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-control bg-obs-selected text-cobalt">
            <FolderGit2 className="size-5" aria-hidden />
          </span>
          <span className="font-mono text-[18px] font-bold">api-service</span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-success-bg px-3 py-1 text-[13px] font-semibold text-success">
            <Check className="size-3.5" strokeWidth={3} aria-hidden />
            Ready
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-obs-border bg-ivory px-3 py-1 font-mono text-[13px]">
            <GitBranch className="size-3.5" aria-hidden />
            main
          </span>
          <span className="font-mono text-[13px] text-obs-muted">a3f82c1</span>
        </div>

        <div className="flex gap-2.5">
          <Link
            to="/app/repositories"
            className="inline-flex h-10 items-center rounded-control border border-obs-border bg-white px-4 text-sm font-semibold transition-colors hover:bg-obs-selected"
          >
            Open repository
          </Link>
          <Link
            to="/app/assistant"
            className="inline-flex h-10 items-center rounded-control bg-cobalt px-5 text-sm font-semibold text-white transition-colors hover:bg-cobalt-hover"
          >
            Ask AI
          </Link>
        </div>
      </div>

      {/* Source preview */}
      <div className="mt-5 overflow-hidden rounded-xl border border-obs-border">
        <div className="flex items-center justify-between border-b border-obs-border bg-ivory px-4 py-2.5">
          <span className="flex items-center gap-2 font-mono text-[14px] font-bold">
            <FileCode2 className="size-4 text-obs-muted" aria-hidden />
            ProjectAccessPolicy.java
          </span>
          <span className="text-[13px] text-obs-muted">Example source preview</span>
        </div>
        <CodeBlock
          label="Example source preview, ProjectAccessPolicy.java lines 12 to 15"
          code={excerpt}
          startLine={12}
          highlight={[12, 14]}
          className="text-[13.5px]"
        />
      </div>
    </section>
  )
}
