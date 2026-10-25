import { AlertTriangle, CheckCircle2, GitBranch, Info, LayoutGrid, List, Loader, Lock, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { cn } from '@/lib/utils'
import { RepoIcon } from './RepoIcons'
import { StatusBadge } from './StatusBadge'
import { repos, type Repo, type RepoStatus } from './data'

type Filter = 'all' | RepoStatus

const GRID = 'sm:grid-cols-[minmax(0,2.2fr)_minmax(0,1fr)_minmax(0,1.3fr)_minmax(0,1fr)]'

function NextAction({ repo }: { repo: Repo }) {
  if (repo.status === 'ready') {
    return (
      <Link
        to="/app/assistant"
        className="inline-flex h-10 items-center rounded-control bg-cobalt px-5 text-[15px] font-semibold text-white transition-colors hover:bg-cobalt-hover"
      >
        Ask AI →
      </Link>
    )
  }
  return (
    <Link
      to={`/app/repositories/${repo.id}`}
      className="inline-flex h-10 items-center rounded-control border border-obs-border bg-white px-4 text-[15px] font-semibold transition-colors hover:bg-obs-selected"
    >
      {repo.status === 'indexing' ? 'View job →' : 'View details →'}
    </Link>
  )
}

function StatusGuide() {
  const items = [
    { icon: CheckCircle2, tone: 'text-success bg-success-bg', label: 'Ready', hint: 'Ask about code' },
    { icon: Loader, tone: 'text-[#1d3fbf] bg-obs-selected', label: 'Indexing', hint: 'Follow the job' },
    { icon: AlertTriangle, tone: 'text-warning bg-warning-bg', label: 'Needs attention', hint: 'Review the latest attempt' },
  ]
  return (
    <div className="mt-6 rounded-xl bg-ivory p-5">
      <h3 className="text-[17px] font-bold">Repository status guide</h3>
      <ul className="mt-4 grid divide-obs-border sm:grid-cols-3 sm:divide-x">
        {items.map((it) => (
          <li key={it.label} className="flex items-center gap-3 py-2 sm:px-5 sm:first:pl-0">
            <span className={cn('flex size-9 shrink-0 items-center justify-center rounded-full', it.tone)}>
              <it.icon className="size-[18px]" aria-hidden />
            </span>
            <span>
              <span className="block text-[15px] font-semibold">{it.label}</span>
              <span className="block text-[13.5px] text-obs-muted">{it.hint}</span>
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-3 flex items-center gap-2 text-[13.5px] text-obs-muted">
        <Info className="size-4 shrink-0" aria-hidden />
        A failed reindex does not remove your previous ready index.
      </p>
    </div>
  )
}

export function RepositoryBrowser({
  selectedId,
  onSelect,
}: {
  selectedId: string
  onSelect: (id: string) => void
}) {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<Filter>('all')

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    return repos.filter(
      (r) =>
        (status === 'all' || r.status === status) &&
        (!q || [r.name, r.path, r.stack].some((v) => v.toLowerCase().includes(q))),
    )
  }, [query, status])

  return (
    <section aria-labelledby="browser-title" className="rounded-2xl border border-obs-border bg-white p-6 shadow-soft">
      <div className="flex items-center justify-between">
        <h2 id="browser-title" className="text-[24px] font-bold tracking-[-0.02em]">
          Connected repositories
        </h2>
        <p className="text-[14px] font-medium text-obs-muted" aria-live="polite">
          {rows.length} {rows.length === 1 ? 'repository' : 'repositories'}
        </p>
      </div>

      {/* Toolbar */}
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <label className="relative min-w-[240px] flex-1">
          <span className="sr-only">Filter loaded repositories</span>
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-obs-muted" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter loaded repositories…"
            className="h-11 w-full rounded-control border border-obs-border bg-white pl-10 pr-3 text-[15px] placeholder:text-obs-muted focus:border-cobalt"
          />
        </label>

        <label>
          <span className="sr-only">Filter by status</span>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as Filter)}
            className="h-11 rounded-control border border-obs-border bg-white px-3.5 text-[15px] font-medium focus:border-cobalt"
          >
            <option value="all">All statuses</option>
            <option value="ready">Ready</option>
            <option value="indexing">Indexing</option>
            <option value="failed">Needs attention</option>
          </select>
        </label>

        <div role="group" aria-label="Layout" className="flex rounded-control border border-obs-border bg-ivory p-1">
          <button
            type="button"
            aria-pressed="true"
            className="flex h-9 items-center gap-1.5 rounded-md bg-ink px-3 text-[13px] font-semibold text-white"
          >
            <List className="size-4" aria-hidden />
            List
          </button>
          <button
            type="button"
            disabled
            title="Grid layout is not available yet"
            className="flex h-9 items-center gap-1.5 rounded-md px-3 text-[13px] font-semibold text-obs-muted disabled:opacity-60"
          >
            <LayoutGrid className="size-4" aria-hidden />
            Grid
          </button>
        </div>
      </div>

      {/* Table header */}
      <div
        aria-hidden
        className={cn(
          'mt-5 hidden gap-4 border-b border-obs-border px-5 pb-3 text-[12px] font-semibold uppercase tracking-[0.1em] text-obs-muted sm:grid',
          GRID,
        )}
      >
        <span>Repository</span>
        <span>Indexed revision</span>
        <span>Status</span>
        <span className="text-right">Next action</span>
      </div>

      {rows.length === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed border-obs-border px-6 py-12 text-center">
          <p className="text-[16px] font-semibold">No loaded repositories match your filters.</p>
          <button
            type="button"
            onClick={() => {
              setQuery('')
              setStatus('all')
            }}
            className="mt-3 text-[15px] font-semibold text-cobalt hover:underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <ul className="divide-y divide-obs-border">
          {rows.map((r) => {
            const selected = r.id === selectedId
            return (
              <li
                key={r.id}
                onClick={() => onSelect(r.id)}
                className={cn(
                  'relative grid cursor-pointer items-center gap-x-4 gap-y-3 px-5 py-5 transition-colors',
                  GRID,
                  selected ? 'bg-obs-selected' : 'hover:bg-ivory',
                )}
              >
                {selected && <span aria-hidden className="absolute inset-y-0 left-0 w-1 rounded-r bg-cobalt" />}

                <button
                  type="button"
                  aria-pressed={selected}
                  onClick={() => onSelect(r.id)}
                  className="flex min-w-0 items-center gap-4 text-left"
                >
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-white shadow-soft ring-1 ring-obs-border">
                    <RepoIcon kind={r.icon} className="size-7" />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate font-mono text-[17px] font-bold">{r.name}</span>
                    <span className="block truncate font-mono text-[13px] text-obs-muted">{r.path}</span>
                    <span className="mt-1.5 flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-obs-border bg-white px-2.5 py-0.5 text-[12.5px] font-medium">
                        {r.stack}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-ivory px-2.5 py-0.5 text-[12.5px] font-medium text-obs-muted">
                        <Lock className="size-3" aria-hidden />
                        Private
                      </span>
                    </span>
                  </span>
                </button>

                <div>
                  <p className="flex items-center gap-1.5 font-mono text-[14px] font-medium">
                    <GitBranch className="size-4 text-obs-muted" aria-hidden />
                    {r.branch}
                  </p>
                  <p className="mt-0.5 font-mono text-[13.5px] text-obs-muted">
                    {r.sha}
                    {r.status === 'indexing' && <span className="font-sans"> · in progress</span>}
                  </p>
                </div>

                <div>
                  <StatusBadge status={r.status} />
                  <p
                    className={cn(
                      'mt-1.5 text-[13.5px]',
                      r.status === 'failed' ? 'font-semibold text-success' : 'text-obs-muted',
                    )}
                  >
                    {r.status === 'failed' && (
                      <CheckCircle2 className="mr-1 inline size-3.5 align-[-2px]" aria-hidden />
                    )}
                    {r.statusNote}
                  </p>
                  {r.attempt && <p className="mt-0.5 whitespace-nowrap text-[12.5px] text-obs-muted">Attempt {r.attempt}</p>}
                </div>

                <div className="sm:text-right" onClick={(e) => e.stopPropagation()}>
                  <NextAction repo={r} />
                </div>
              </li>
            )
          })}
        </ul>
      )}

      <StatusGuide />
    </section>
  )
}
