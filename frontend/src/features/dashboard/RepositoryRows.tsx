import { CheckCircle2, Info } from 'lucide-react'
import { Link } from 'react-router'
import { RepoIcon } from '@/features/repositories/RepoIcons'
import { StatusBadge } from '@/features/repositories/StatusBadge'
import { repos } from '@/features/repositories/data'
import { cn } from '@/lib/utils'

function nextAction(status: (typeof repos)[number]['status']) {
  if (status === 'ready') return { label: 'Ask AI', to: '/app/assistant' }
  return { label: status === 'indexing' ? 'View job' : 'View details', to: '' }
}

export function RepositoryRows() {
  return (
    <section aria-labelledby="repos-title" className="rounded-2xl border border-obs-border bg-white p-6 shadow-soft">
      <div className="flex items-center justify-between">
        <h2 id="repos-title" className="text-[24px] font-bold tracking-[-0.02em]">
          Your repositories
        </h2>
        <Link to="/app/repositories" className="text-[15px] font-semibold text-cobalt hover:underline">
          View all →
        </Link>
      </div>

      <div
        aria-hidden
        className="mt-5 hidden grid-cols-[minmax(0,1.3fr)_minmax(0,1.2fr)_minmax(0,0.8fr)] gap-4 border-b border-obs-border pb-3 text-[12px] font-semibold uppercase tracking-[0.1em] text-obs-muted sm:grid"
      >
        <span>Repository</span>
        <span>Index status</span>
        <span className="text-right">Next step</span>
      </div>

      <ul className="divide-y divide-obs-border">
        {repos.map((r) => {
          const action = nextAction(r.status)
          return (
            <li
              key={r.id}
              className="grid items-center gap-x-4 gap-y-3 py-4 sm:grid-cols-[minmax(0,1.3fr)_minmax(0,1.2fr)_minmax(0,0.8fr)]"
            >
              <div className="flex min-w-0 items-center gap-3.5">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-control bg-ivory">
                  <RepoIcon kind={r.icon} />
                </span>
                <span className="min-w-0">
                  <span className="block truncate font-mono text-[16px] font-bold">{r.name}</span>
                  <span className="block text-[14px] text-obs-muted">{r.stack}</span>
                </span>
              </div>

              <div>
                <StatusBadge status={r.status} />
                <p
                  className={cn(
                    'mt-1.5 text-[13.5px]',
                    r.status === 'failed' ? 'font-semibold text-success' : 'font-mono text-obs-muted',
                  )}
                >
                  {r.status === 'failed' && <CheckCircle2 className="mr-1 inline size-3.5 align-[-2px]" aria-hidden />}
                  {r.status === 'ready' ? `${r.branch} · ${r.sha}` : r.statusNote}
                </p>
              </div>

              <div className="sm:text-right">
                <Link
                  to={action.to || `/app/repositories/${r.id}`}
                  className="text-[15px] font-semibold text-cobalt hover:underline"
                >
                  {action.label} →
                </Link>
              </div>
            </li>
          )
        })}
      </ul>

      <p className="mt-2 flex items-center gap-2 rounded-control bg-ivory px-3.5 py-2.5 text-[13.5px] text-obs-muted">
        <Info className="size-4 shrink-0" aria-hidden />
        A failed reindex keeps your previous ready index available.
      </p>
    </section>
  )
}
