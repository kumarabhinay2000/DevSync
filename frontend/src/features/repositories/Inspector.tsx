import { CheckCircle2, ChevronRight, Folder, FolderOpen, GitBranch, Info, Lock } from 'lucide-react'
import { Link } from 'react-router'
import { cn } from '@/lib/utils'
import { RepoIcon } from './RepoIcons'
import { StatusBadge } from './StatusBadge'
import type { Repo, TreeNode } from './data'

function Tree({ nodes, root = false }: { nodes: TreeNode[]; root?: boolean }) {
  return (
    <ul className={cn(!root && 'ml-[11px] border-l border-obs-border pl-4')}>
      {nodes.map((n) => (
        <li key={n.name} className="py-[3px]">
          <span className="flex items-center gap-2 font-mono text-[14px]">
            {n.children ? (
              <FolderOpen className="size-4 text-cobalt" aria-hidden />
            ) : (
              <Folder className="size-4 text-cobalt" aria-hidden />
            )}
            {n.name}
          </span>
          {n.children && <Tree nodes={n.children} />}
        </li>
      ))}
    </ul>
  )
}

function Meta({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <dt className="text-[14px] text-obs-muted">{label}</dt>
      <dd className="text-[14.5px] font-semibold">{children}</dd>
    </div>
  )
}

export function Inspector({ repo }: { repo: Repo }) {
  const canAsk = repo.hasUsableIndex
  const failed = repo.status === 'failed'

  return (
    <aside
      aria-label="Selected repository"
      className="rounded-2xl border border-obs-border bg-white p-6 shadow-soft xl:sticky xl:top-24"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-obs-muted">Selected repository</p>

      <div className="mt-4 flex items-start gap-4">
        <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-obs-selected">
          <RepoIcon kind={repo.icon} className="size-8" />
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <h2 className="font-mono text-[24px] font-bold leading-tight tracking-[-0.01em]">{repo.name}</h2>
            <span className="inline-flex items-center gap-1 rounded-full bg-ivory px-2.5 py-0.5 text-[12.5px] font-medium text-obs-muted">
              <Lock className="size-3" aria-hidden />
              Private
            </span>
          </div>
          <p className="mt-0.5 truncate font-mono text-[13.5px] text-obs-muted">{repo.path}</p>
        </div>
      </div>

      <p className="mt-4 text-[15px] text-obs-text">{repo.description}</p>

      <hr className="my-5 border-obs-border" />

      <dl className="divide-y divide-obs-border/60">
        <Meta label="Stack">{repo.stackFull}</Meta>
        <Meta label="Branch">
          <span className="inline-flex items-center gap-1.5 font-mono">
            <GitBranch className="size-4 text-obs-muted" aria-hidden />
            {repo.branch}
          </span>
        </Meta>
        <Meta label={repo.hasUsableIndex ? 'Active revision' : 'Revision'}>
          <span className="font-mono">{repo.hasUsableIndex ? repo.sha : `${repo.sha} (indexing)`}</span>
        </Meta>
        <Meta label="Index state">
          <StatusBadge status={repo.status} />
        </Meta>
      </dl>

      {failed && (
        <p className="mt-2 flex items-center gap-2 rounded-control bg-success-bg px-3 py-2 text-[13.5px] font-semibold text-success">
          <CheckCircle2 className="size-4 shrink-0" aria-hidden />
          Previous index ready
        </p>
      )}

      <hr className="my-5 border-obs-border" />

      <div className="flex items-baseline justify-between">
        <h3 className="text-[17px] font-bold">Example source layout</h3>
        <span className="text-[12.5px] text-obs-muted">Illustrative structure</span>
      </div>
      <div className="mt-3 rounded-xl bg-ivory p-4">
        <Tree nodes={repo.tree} root />
      </div>

      <div className="mt-6 space-y-2.5">
        <Link
          to={`/app/repositories/${repo.id}`}
          className="inline-flex h-12 w-full items-center justify-center gap-1.5 rounded-control bg-cobalt text-[15.5px] font-semibold text-white transition-colors hover:bg-cobalt-hover"
        >
          Open repository
          <ChevronRight className="size-4" aria-hidden />
        </Link>
        {canAsk ? (
          <Link
            to="/app/assistant"
            className="inline-flex h-12 w-full items-center justify-center rounded-control border border-obs-border bg-white text-[15.5px] font-semibold transition-colors hover:bg-obs-selected"
          >
            Open AI Assistant
          </Link>
        ) : (
          <button
            type="button"
            disabled
            className="inline-flex h-12 w-full items-center justify-center rounded-control border border-obs-border bg-white text-[15.5px] font-semibold opacity-50"
          >
            Open AI Assistant
          </button>
        )}
      </div>

      <p className="mt-4 flex items-start gap-2 text-[13.5px] text-obs-muted">
        <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
        {canAsk
          ? failed
            ? `Answers use the previous ready index (${repo.sha}).`
            : 'Answers use this indexed revision.'
          : 'Ask AI becomes available once an index is ready.'}
      </p>
    </aside>
  )
}
