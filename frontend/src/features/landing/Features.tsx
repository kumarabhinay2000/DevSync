import {
  AlertTriangle,
  Check,
  FileCode2,
  Folder,
  FolderOpen,
  GitPullRequestDraft,
  ScanSearch,
} from 'lucide-react'
import type { ComponentType, ReactNode } from 'react'
import { CitationMarker, SourceRef } from '@/components/domain/Citation'
import { Reveal } from '@/components/domain/Reveal'
import { cn } from '@/lib/utils'
import { SectionHeading } from './SectionHeading'

type PanelProps = {
  title: string
  description: string
  className?: string
  delay?: number
  icon?: ComponentType<{ className?: string; strokeWidth?: number; 'aria-hidden'?: boolean }>
  children?: ReactNode
}

function Panel({ title, description, className, delay, icon: Icon, children }: PanelProps) {
  return (
    <Reveal className={cn('flex', className)} delay={delay}>
      <article className="flex w-full flex-col rounded-dialog border border-border bg-surface p-7 shadow-soft transition-shadow hover:shadow-panel">
        {Icon && (
          <span className="mb-5 flex size-11 items-center justify-center rounded-control bg-selected text-primary">
            <Icon className="size-5" strokeWidth={1.8} aria-hidden />
          </span>
        )}
        <h3 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h3>
        <p className="mt-2 max-w-[34rem] text-base text-muted-foreground">{description}</p>
        {children}
      </article>
    </Reveal>
  )
}

/* ---- Panel visuals (illustrative sample data) ---- */

function VerifyDemo() {
  return (
    <div className="mt-7 flex-1 space-y-4 rounded-control border border-border bg-background p-5">
      <div className="flex justify-end">
        <p className="rounded-xl rounded-tr-sm bg-foreground px-4 py-2 text-sm text-white">
          How is authentication handled?
        </p>
      </div>
      <p className="text-[15px] leading-relaxed text-foreground">
        Authentication is handled by{' '}
        <code className="rounded bg-surface-muted px-1.5 py-0.5 font-mono text-[13px] font-medium">
          JwtAuthenticationFilter
        </code>
        , which validates the JWT token and sets the user context.
        <CitationMarker n={1} />
        <CitationMarker n={2} />
      </p>
      <div className="grid gap-2.5">
        <SourceRef
          n={1}
          file="JwtAuthenticationFilter.java"
          path="src/main/java/com/devsync/auth"
          lines="L28–54"
          revision="main · a3f82c1"
          active
        />
        <SourceRef
          n={2}
          file="SecurityConfig.java"
          path="src/main/java/com/devsync/config"
          lines="L41–63"
          revision="main · a3f82c1"
        />
      </div>
    </div>
  )
}

type TreeRow = { name: string; depth: number; kind: 'folder' | 'open' | 'file'; selected?: boolean }

const tree: TreeRow[] = [
  { name: 'api-service', depth: 0, kind: 'open' },
  { name: 'src/main/java/com/devsync', depth: 1, kind: 'open' },
  { name: 'auth', depth: 2, kind: 'open' },
  { name: 'AuthController.java', depth: 3, kind: 'file', selected: true },
  { name: 'JwtAuthenticationFilter.java', depth: 3, kind: 'file', selected: true },
  { name: 'TokenUtil.java', depth: 3, kind: 'file', selected: true },
  { name: 'UserPrincipal.java', depth: 3, kind: 'file', selected: true },
  { name: 'config', depth: 2, kind: 'folder' },
  { name: 'controller', depth: 2, kind: 'folder' },
  { name: 'service', depth: 2, kind: 'open' },
  { name: 'ProjectAccessPolicy.java', depth: 3, kind: 'file', selected: true },
  { name: 'model', depth: 2, kind: 'folder' },
]

function TreeDemo() {
  return (
    <ul
      aria-label="Illustrative repository file tree"
      className="mt-7 space-y-0.5 rounded-control border border-border bg-background p-3 font-mono text-[13px]"
    >
      {tree.map((r) => (
        <li
          key={r.name + r.depth}
          className={cn(
            'flex items-center gap-2 rounded-md py-1.5 pr-3',
            r.selected ? 'bg-selected font-medium text-primary' : 'text-foreground',
          )}
          style={{ paddingLeft: 10 + r.depth * 18 }}
        >
          {r.kind === 'open' && <FolderOpen className="size-4 text-primary" aria-hidden />}
          {r.kind === 'folder' && <Folder className="size-4 text-muted-foreground" aria-hidden />}
          {r.kind === 'file' && <FileCode2 className="size-4" aria-hidden />}
          <span className="truncate">{r.name}</span>
          {r.selected && <Check className="ml-auto size-3.5" aria-label="Selected" />}
        </li>
      ))}
    </ul>
  )
}

function QualityDemo() {
  return (
    <div className="mt-6 space-y-2 rounded-control border border-border bg-background p-3 text-[13px]">
      <div className="flex items-center gap-2.5 rounded-md bg-warning-bg px-3 py-2 text-warning">
        <AlertTriangle className="size-4 shrink-0" aria-hidden />
        <span className="font-semibold">Medium</span>
        <span className="truncate font-mono text-xs">TokenUtil.java · L42</span>
      </div>
      <div className="flex items-center gap-2.5 rounded-md border border-border bg-surface px-3 py-2 text-muted-foreground">
        <FileCode2 className="size-4 shrink-0" aria-hidden />
        <span className="truncate font-mono text-xs">Open evidence at the analyzed commit</span>
      </div>
    </div>
  )
}

function DiffDemo() {
  return (
    <div className="mt-6 overflow-hidden rounded-control border border-border bg-background font-mono text-[12.5px] leading-[22px]">
      <div className="flex items-center justify-between border-b border-border bg-surface-muted px-3 py-1.5 text-xs">
        <span className="font-medium text-foreground">ProjectAccessPolicy.java</span>
        <span className="rounded bg-success-bg px-2 py-0.5 font-sans text-[11px] font-semibold text-success">
          Tests: PASS
        </span>
      </div>
      <p className="bg-danger-bg px-3 text-danger">
        <span className="mr-3 select-none font-bold">−</span>if (user == null) return;
      </p>
      <p className="bg-success-bg px-3 text-success">
        <span className="mr-3 select-none font-bold">+</span>requireAuthenticated(user);
      </p>
    </div>
  )
}

export function Features() {
  return (
    <section id="features" aria-labelledby="features-title" className="scroll-mt-20 pb-24 pt-8">
      <div className="container-page">
        <SectionHeading
          id="features-title"
          title="Everything you need to understand your codebase."
          description="Explore, ask, and review with purpose-built tools for real development work."
        />

        <div className="mt-14 grid gap-6 lg:grid-cols-12">
          <Panel
            className="lg:col-span-7"
            title="Answers you can verify"
            description="Get clear answers with direct links to source files, line numbers, and specific revisions."
          >
            <VerifyDemo />
          </Panel>

          <Panel
            className="lg:col-span-5"
            delay={120}
            title="Navigate complex repositories"
            description="Explore your codebase with contextual explanations and structured source navigation."
          >
            <TreeDemo />
          </Panel>

          <Panel
            className="lg:col-span-5"
            icon={ScanSearch}
            title="Code quality in context"
            description="Understand how code fits together, inspect findings, and review relevant source evidence."
          >
            <QualityDemo />
          </Panel>

          <Panel
            className="lg:col-span-7"
            delay={120}
            icon={GitPullRequestDraft}
            title="Review proposed changes"
            description="See exactly what will change, with clear explanations, diffs, and test outcomes."
          >
            <DiffDemo />
          </Panel>
        </div>
      </div>
    </section>
  )
}
