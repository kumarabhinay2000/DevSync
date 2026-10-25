import { GitBranch, Lock, Plug } from 'lucide-react'
import { Link } from 'react-router'
import { cn } from '@/lib/utils'
import { environments, type EnvId } from './data'
import { envIcon } from './envIcons'

const GRID = 'sm:grid-cols-[minmax(0,1.3fr)_minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,0.9fr)]'

export function NotConnected() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-obs-border bg-ivory px-3 py-1 text-[13.5px] font-semibold text-obs-muted">
      <Plug className="size-3.5" aria-hidden />
      Not connected
    </span>
  )
}

export function ConfigList({ selectedId, onSelect }: { selectedId: EnvId; onSelect: (id: EnvId) => void }) {
  return (
    <section aria-labelledby="configs-title" className="rounded-2xl border border-obs-border bg-white p-6 shadow-soft">
      <h2 id="configs-title" className="text-[24px] font-bold tracking-[-0.02em]">
        Environment configurations
      </h2>
      <p className="mt-1 text-[15px] text-obs-muted">
        Example mappings. Select an environment to view its details.
      </p>

      <div
        aria-hidden
        className={cn(
          'mt-5 hidden gap-4 border-b border-obs-border px-4 pb-3 text-[12px] font-semibold uppercase tracking-[0.1em] text-obs-muted sm:grid',
          GRID,
        )}
      >
        <span>Environment</span>
        <span>Repository &amp; branch</span>
        <span>Connection</span>
        <span className="text-right">Next step</span>
      </div>

      <ul className="divide-y divide-obs-border">
        {environments.map((env) => {
          const selected = env.id === selectedId
          const { Icon, tone } = envIcon[env.id]
          return (
            <li
              key={env.id}
              onClick={() => onSelect(env.id)}
              className={cn(
                'relative grid cursor-pointer items-center gap-x-4 gap-y-3 px-4 py-5 transition-colors',
                GRID,
                selected ? 'bg-obs-selected ring-1 ring-cobalt/30' : 'hover:bg-ivory',
              )}
            >
              {selected && <span aria-hidden className="absolute inset-y-0 left-0 w-1 rounded-r bg-cobalt" />}

              <button
                type="button"
                aria-pressed={selected}
                onClick={() => onSelect(env.id)}
                className="flex items-center gap-3.5 text-left"
              >
                <span
                  className={cn(
                    'flex size-12 shrink-0 items-center justify-center rounded-xl',
                    tone,
                    selected && 'bg-white shadow-soft',
                  )}
                >
                  <Icon className="size-6" strokeWidth={1.8} aria-hidden />
                </span>
                <span>
                  <span className="block text-[17px] font-bold">{env.name}</span>
                  <span className="block text-[14px] text-obs-muted">{env.short}</span>
                </span>
              </button>

              <div className="min-w-0">
                <p className="truncate font-mono text-[15px] font-bold">{env.repo}</p>
                <p className="mt-0.5 flex items-center gap-1.5 font-mono text-[13.5px] text-obs-muted">
                  <GitBranch className="size-3.5" aria-hidden />
                  {env.branch}
                </p>
              </div>

              <div>
                <NotConnected />
              </div>

              <div className="sm:text-right" onClick={(e) => e.stopPropagation()}>
                <Link
                  to={`/app/environments/${env.id}`}
                  className="text-[15px] font-semibold text-cobalt hover:underline"
                >
                  View details →
                </Link>
              </div>
            </li>
          )
        })}
      </ul>

      <p className="mt-3 flex items-center gap-2 text-[13.5px] text-obs-muted">
        <Lock className="size-4" aria-hidden />
        Configuration access follows workspace permissions.
      </p>
    </section>
  )
}
