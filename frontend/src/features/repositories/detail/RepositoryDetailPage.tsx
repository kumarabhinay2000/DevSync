import {
  AlertTriangle,
  ArrowRight,
  CalendarClock,
  Check,
  CheckCircle2,
  Clock,
  Code2,
  ExternalLink,
  FileCode2,
  FileSearch,
  FolderGit2,
  GitBranch,
  GitCommitHorizontal,
  Info,
  Layers,
  Loader,
  Lock,
  MessageSquareText,
  MoreHorizontal,
  ShieldCheck,
} from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { Link, useParams } from 'react-router'
import { cn } from '@/lib/utils'
import { RepoIcon } from '../RepoIcons'
import { StatusBadge } from '../StatusBadge'
import { repos, type Repo, type RepoStatus } from '../data'
import { defaultFile, fileTrees } from './detailData'
import { StageTimeline, type Stage } from './StageTimeline'
import { StructurePanel } from './StructurePanel'

function stagesFor(status: RepoStatus): Stage[] {
  const base = [
    { title: 'Repository fetched', description: 'Selected commit downloaded.' },
    { title: 'Source files prepared', description: 'Eligible files selected and parsed.' },
    { title: 'Creating embeddings', description: 'Preparing code for semantic retrieval.' },
    { title: 'Validate index', description: 'Check source links and retrieval readiness.' },
    { title: 'Ready for AI questions', description: 'Activate the validated source index.' },
  ]
  const states: Stage['state'][] =
    status === 'ready'
      ? ['complete', 'complete', 'complete', 'complete', 'complete']
      : status === 'failed'
        ? ['complete', 'complete', 'failed', 'waiting', 'waiting']
        : ['complete', 'complete', 'running', 'waiting', 'waiting']
  return base.map((b, i) => ({
    ...b,
    state: states[i],
    note: status === 'failed' && i === 2 ? 'DEPENDENCY_UNAVAILABLE' : undefined,
  }))
}

function Chip({ icon, children, tone }: { icon: ReactNode; children: ReactNode; tone?: 'mint' }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[13.5px] font-medium',
        tone === 'mint' ? 'border-mint bg-mint/50 text-ink' : 'border-obs-border bg-white',
      )}
    >
      {icon}
      {children}
    </span>
  )
}

function Flow({ icon, tone, title, body }: { icon: ReactNode; tone: string; title: string; body: string }) {
  return (
    <li className="flex min-w-0 flex-1 flex-col items-center text-center">
      <span className={`flex size-14 items-center justify-center rounded-2xl ${tone}`}>{icon}</span>
      <p className="mt-3 text-[15.5px] font-bold">{title}</p>
      <p className="mt-0.5 text-[13px] leading-snug text-ink-muted">{body}</p>
    </li>
  )
}

function FlowArrow() {
  return (
    <li aria-hidden className="hidden shrink-0 items-start pt-6 sm:flex">
      <svg width="34" height="14" viewBox="0 0 34 14">
        <line x1="0" y1="7" x2="26" y2="7" stroke="#26323F" strokeWidth="2" />
        <line x1="0" y1="7" x2="26" y2="7" stroke="#BAE4D0" strokeWidth="3.4" className="flow-dots" />
        <path d="M22 2l7 5-7 5" fill="none" stroke="#BAE4D0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </li>
  )
}

function ContextRow({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <dt className="flex items-center gap-2.5 text-[14.5px] text-obs-muted">
        {icon}
        {label}
      </dt>
      <dd className="text-right text-[14.5px] font-semibold">{children}</dd>
    </div>
  )
}

function DetailView({ repo }: { repo: Repo }) {
  const [status, setStatus] = useState<RepoStatus>(repo.status)
  const [attempt, setAttempt] = useState(repo.attempt ?? (repo.status === 'failed' ? 2 : 1))
  const [cancelRequested, setCancelRequested] = useState(false)
  const [retried, setRetried] = useState(false)

  const firstIndex = !repo.hasUsableIndex
  const canAsk = repo.hasUsableIndex
  const stages = stagesFor(status)
  const tree = fileTrees[repo.id] ?? fileTrees['api-service']

  const started =
    status === 'indexing'
      ? retried
        ? 'Started just now'
        : 'Started 2 min ago'
      : status === 'ready'
        ? 'Completed 12 min ago'
        : 'Failed 18 min ago'

  const title =
    status === 'ready'
      ? 'Your code is ready for questions'
      : status === 'failed'
        ? 'Indexing needs attention'
        : 'Preparing your code for questions'

  const subtitle =
    status === 'ready'
      ? `Indexed at commit ${repo.sha}.`
      : status === 'failed'
        ? `The latest attempt at commit ${repo.sha} did not finish.`
        : `Building the ${firstIndex ? 'first ' : 'new '}index at commit ${repo.sha}.`

  const indexState =
    status === 'indexing' ? (
      <span className="inline-flex items-center gap-1.5 text-[#1d3fbf]">
        <Loader className="size-4 animate-spin motion-reduce:animate-none" aria-hidden />
        Building
      </span>
    ) : status === 'ready' ? (
      <span className="inline-flex items-center gap-1.5 text-success">
        <CheckCircle2 className="size-4" aria-hidden />
        Ready
      </span>
    ) : (
      <span className="inline-flex items-center gap-1.5 text-warning">
        <AlertTriangle className="size-4" aria-hidden />
        Latest attempt failed
      </span>
    )

  const retry = () => {
    setStatus('indexing')
    setAttempt((a) => a + 1)
    setRetried(true)
    setCancelRequested(false)
  }

  return (
    <div className="mx-auto max-w-[1480px]">
      {/* Header */}
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cobalt">Repository workspace</p>
      <div className="mt-3 flex flex-wrap items-start justify-between gap-6">
        <div className="flex min-w-0 items-start gap-5">
          <span className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-obs-selected">
            <RepoIcon kind={repo.icon} className="size-9" />
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-mono text-[38px] font-bold leading-none tracking-[-0.02em] md:text-[40px]">
                {repo.name}
              </h1>
              <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-[13px] font-medium text-obs-muted ring-1 ring-obs-border">
                <Lock className="size-3.5" aria-hidden />
                Private
              </span>
            </div>
            <p className="mt-2 truncate font-mono text-[14px] text-obs-muted">{repo.path}</p>
            <p className="mt-1 text-base text-obs-text">{repo.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            disabled
            title="Illustrative data: there is no live GitHub repository behind this page"
            className="inline-flex h-11 items-center gap-2 rounded-control border border-obs-border bg-white px-4 text-[15px] font-semibold opacity-60"
          >
            Open on GitHub
            <ExternalLink className="size-4" aria-hidden />
          </button>
          <button
            type="button"
            aria-label="More actions"
            className="flex size-11 items-center justify-center rounded-control border border-obs-border bg-white text-obs-muted hover:text-obs-text"
          >
            <MoreHorizontal className="size-5" aria-hidden />
          </button>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2.5">
        <Chip icon={<GitBranch className="size-4 text-obs-muted" aria-hidden />}>
          <span className="font-mono">{repo.branch}</span>
        </Chip>
        <Chip icon={<GitCommitHorizontal className="size-4 text-obs-muted" aria-hidden />}>
          <span className="font-mono">{repo.sha}</span>
        </Chip>
        <Chip icon={<Code2 className="size-4 text-obs-muted" aria-hidden />}>{repo.stack}</Chip>
        <Chip tone="mint" icon={<Check className="size-4" strokeWidth={3} aria-hidden />}>
          Processor policy approved
        </Chip>
      </div>

      {/* Tabs (in-page navigation) */}
      <nav aria-label="Repository sections" className="mt-7 flex gap-8 border-b border-obs-border">
        <a
          href="#stages"
          aria-current="page"
          className="-mb-px border-b-[3px] border-cobalt pb-3 text-[15.5px] font-semibold text-obs-text"
        >
          Overview
        </a>
        <a href="#structure" className="pb-3 text-[15.5px] font-medium text-obs-muted hover:text-obs-text">
          Source
        </a>
        <a href="#stages" className="pb-3 text-[15.5px] font-medium text-obs-muted hover:text-obs-text">
          Indexing jobs
        </a>
      </nav>

      {/* Upper row */}
      <div className="mt-6 grid items-start gap-6 xl:grid-cols-[minmax(0,62fr)_minmax(0,38fr)]">
        <section
          id="stages"
          aria-labelledby="stages-title"
          className="scroll-mt-24 rounded-2xl border border-obs-border bg-white p-6 shadow-soft"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="stages-title" className="flex items-center gap-3 text-[24px] font-bold tracking-[-0.02em]">
              {status === 'indexing' ? (
                <Loader className="size-6 animate-spin text-cobalt motion-reduce:animate-none" aria-hidden />
              ) : status === 'ready' ? (
                <CheckCircle2 className="size-6 text-success" aria-hidden />
              ) : (
                <AlertTriangle className="size-6 text-warning" aria-hidden />
              )}
              {title}
            </h2>
            <StatusBadge status={status} />
          </div>
          <p className="mt-1.5 pl-9 text-[15px] text-obs-muted">{subtitle}</p>

          <div className="mt-7">
            <StageTimeline stages={stages} />
          </div>

          {status === 'failed' && (
            <div className="mt-6 space-y-2.5">
              <p className="flex items-start gap-2.5 rounded-control bg-warning-bg px-4 py-3 text-[14px] text-warning">
                <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
                <span>
                  <strong className="font-semibold">Stage failed:</strong> an external dependency was unavailable.
                  Error code <span className="font-mono">DEPENDENCY_UNAVAILABLE</span>.
                </span>
              </p>
              <p className="flex items-center gap-2.5 rounded-control bg-success-bg px-4 py-3 text-[14px] font-semibold text-success">
                <CheckCircle2 className="size-4 shrink-0" aria-hidden />
                Previous index ready · <span className="font-mono">{repo.sha}</span>
              </p>
            </div>
          )}

          <hr className="my-6 border-obs-border" />

          <div className="flex flex-wrap items-center justify-between gap-4">
            <ul className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[14px] text-obs-muted">
              <li className="flex items-center gap-2">
                <Clock className="size-4" aria-hidden />
                Attempt {attempt}
              </li>
              <li className="flex items-center gap-2">
                <CalendarClock className="size-4" aria-hidden />
                {started}
              </li>
              <li className="flex items-center gap-2">
                <Layers className="size-4" aria-hidden />
                {firstIndex ? 'First index' : 'Reindex'}
              </li>
            </ul>

            <div className="flex items-center gap-4">
              <a href="#stages" className="text-[15px] font-semibold text-cobalt hover:underline">
                View indexing job →
              </a>
              {status === 'indexing' && (
                <button
                  type="button"
                  disabled={cancelRequested}
                  onClick={() => setCancelRequested(true)}
                  className="inline-flex h-11 items-center rounded-control border border-obs-border bg-white px-5 text-[15px] font-semibold transition-colors hover:bg-ivory disabled:opacity-60"
                >
                  {cancelRequested ? 'Cancellation requested' : 'Cancel indexing'}
                </button>
              )}
              {status === 'failed' && (
                <button
                  type="button"
                  onClick={retry}
                  className="inline-flex h-11 items-center rounded-control bg-cobalt px-5 text-[15px] font-semibold text-white transition-colors hover:bg-cobalt-hover"
                >
                  Retry indexing
                </button>
              )}
            </div>
          </div>

          {cancelRequested && (
            <p role="status" className="mt-4 flex items-start gap-2.5 rounded-control bg-ivory px-4 py-3 text-[14px] text-obs-muted">
              <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
              Cancellation requested. The worker stops at the next safe point, so the job keeps running until
              that is confirmed.
            </p>
          )}
        </section>

        <StructurePanel key={repo.id} tree={tree} initialFile={defaultFile[repo.id] ?? defaultFile['api-service']} />
      </div>

      {/* Lower row */}
      <div className="mt-6 grid items-stretch gap-6 xl:grid-cols-[minmax(0,62fr)_minmax(0,38fr)]">
        <section
          aria-labelledby="next-title"
          className="rounded-2xl bg-ink p-6 text-white shadow-panel"
        >
          <div className="flex items-start gap-4">
            <span className="relative flex size-12 shrink-0 items-center justify-center rounded-xl bg-mint text-ink">
              <MessageSquareText className="size-6" aria-hidden />
              <span className="absolute -bottom-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full bg-ink text-mint ring-2 ring-mint">
                <FileCode2 className="size-3" aria-hidden />
              </span>
            </span>
            <div>
              <h2 id="next-title" className="text-[24px] font-bold tracking-[-0.02em]">
                Your next step: ask with evidence
              </h2>
              <p className="mt-1 text-[15px] text-ink-muted">
                {!canAsk
                  ? 'AI chat unlocks when this first index is validated.'
                  : status === 'failed'
                    ? 'AI chat keeps using your previous ready index while the latest attempt needs attention.'
                    : 'AI chat is available on this validated index.'}
              </p>
            </div>
          </div>

          <ol className="mt-7 flex flex-col gap-5 rounded-xl bg-ink-raised px-5 py-6 sm:flex-row sm:items-start">
            <Flow
              tone="bg-white text-cobalt"
              icon={<FolderGit2 className="size-7" strokeWidth={1.7} aria-hidden />}
              title="Source"
              body="Your repository at this commit"
            />
            <FlowArrow />
            <Flow
              tone="bg-mint text-ink"
              icon={<FileSearch className="size-7" strokeWidth={1.7} aria-hidden />}
              title="Index"
              body="Create searchable source context"
            />
            <FlowArrow />
            <Flow
              tone="bg-cobalt text-white"
              icon={<MessageSquareText className="size-7" strokeWidth={1.7} aria-hidden />}
              title="Answer"
              body="Get answers with source references"
            />
          </ol>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4">
              {canAsk ? (
                <Link
                  to="/app/assistant"
                  className="inline-flex h-12 items-center gap-2 rounded-control bg-cobalt px-6 text-[15.5px] font-semibold text-white transition-colors hover:bg-cobalt-hover"
                >
                  Open AI Assistant
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
              ) : (
                <>
                  <button
                    type="button"
                    disabled
                    aria-describedby="ai-locked-reason"
                    className="inline-flex h-12 items-center gap-2 rounded-control border border-ink-border bg-ink-raised px-6 text-[15.5px] font-semibold text-ink-muted"
                  >
                    <Lock className="size-4" aria-hidden />
                    Open AI Assistant
                  </button>
                  <span id="ai-locked-reason" className="text-[14px] text-ink-muted">
                    Waiting for first index.
                  </span>
                </>
              )}
            </div>
            <a href="#structure" className="text-[15px] font-semibold text-mint hover:underline">
              Browse source →
            </a>
          </div>
        </section>

        <aside
          aria-labelledby="context-title"
          className="rounded-2xl border border-obs-border bg-white p-6 shadow-soft"
        >
          <h2 id="context-title" className="text-[22px] font-bold tracking-[-0.02em]">
            Index context
          </h2>
          <dl className="mt-3 divide-y divide-obs-border/70">
            <ContextRow icon={<GitBranch className="size-4" aria-hidden />} label="Branch">
              <span className="font-mono">{repo.branch}</span>
            </ContextRow>
            <ContextRow icon={<GitCommitHorizontal className="size-4" aria-hidden />} label="Revision">
              <span className="font-mono">{repo.sha}</span>
            </ContextRow>
            <ContextRow icon={<Loader className="size-4" aria-hidden />} label="Index state">
              {indexState}
            </ContextRow>
            <ContextRow icon={<Layers className="size-4" aria-hidden />} label="Active index">
              {canAsk ? (
                <span className="font-mono">
                  {repo.sha}
                  {status === 'failed' && <span className="font-sans font-medium text-obs-muted"> (previous)</span>}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 font-medium text-obs-muted">
                  <span className="size-2.5 rounded-full border-2 border-obs-border" aria-hidden />
                  Not available yet
                </span>
              )}
            </ContextRow>
          </dl>
          <p className="mt-3 flex items-start gap-2 rounded-control bg-ivory px-3.5 py-3 text-[13.5px] text-obs-muted">
            <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
            A specific commit keeps answers tied to the right source.
          </p>
        </aside>
      </div>

      <p className="mt-8 flex items-center gap-2 text-[13px] text-obs-muted">
        <ShieldCheck className="size-4" aria-hidden />
        Repository access follows your project permissions.
      </p>
    </div>
  )
}

export function RepositoryDetailPage() {
  const { repoId } = useParams()
  const repo = repos.find((r) => r.id === repoId)

  if (!repo) {
    return (
      <div className="max-w-xl">
        <h1 className="text-[32px] font-bold tracking-[-0.02em]">Repository unavailable</h1>
        <p className="mt-3 text-base text-obs-muted">
          This repository does not exist or you do not have access to it.
        </p>
        <Link
          to="/app/repositories"
          className="mt-6 inline-flex h-11 items-center rounded-control border border-obs-border bg-white px-5 text-sm font-semibold hover:bg-obs-selected"
        >
          Back to Repositories
        </Link>
      </div>
    )
  }

  return <DetailView key={repo.id} repo={repo} />
}
