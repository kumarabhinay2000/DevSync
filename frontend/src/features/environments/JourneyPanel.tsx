import { GitBranch } from 'lucide-react'
import { cn } from '@/lib/utils'
import { EnvIllustration } from './Illustrations'
import { environments, type EnvId } from './data'

const ring: Record<EnvId, string> = {
  development: 'ring-cobalt',
  staging: 'ring-[#3F9E78]',
  production: 'ring-[#1B2A4A]',
}

function Connector({ label }: { label: string }) {
  return (
    <li aria-hidden className="hidden w-[130px] shrink-0 flex-col items-center justify-center lg:flex">
      <span className="mb-2 text-center text-[13px] font-semibold leading-tight text-obs-muted">{label}</span>
      <svg width="110" height="16" viewBox="0 0 110 16">
        <line x1="0" y1="8" x2="100" y2="8" stroke="#B7C0BC" strokeWidth="2" strokeDasharray="5 5" />
        <path d="M95 2l9 6-9 6" fill="none" stroke="#64706D" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </li>
  )
}

export function JourneyPanel({ selectedId, onSelect }: { selectedId: EnvId; onSelect: (id: EnvId) => void }) {
  return (
    <section aria-labelledby="journey-title" className="rounded-2xl border border-obs-border bg-white p-6 shadow-soft">
      <h2 id="journey-title" className="text-[26px] font-bold tracking-[-0.02em]">
        Your development journey
      </h2>
      <p className="mt-1 text-[15px] text-obs-muted">Three contexts, one understandable workflow.</p>

      <ol className="mt-6 flex flex-col items-stretch gap-4 rounded-2xl bg-ivory p-5 lg:flex-row lg:items-center">
        {environments.flatMap((env, i) => {
          const tile = (
            <li key={env.id} className="min-w-0 flex-1">
              <button
                type="button"
                aria-pressed={env.id === selectedId}
                onClick={() => onSelect(env.id)}
                className={cn(
                  'w-full rounded-2xl bg-white p-4 text-left shadow-soft transition-shadow hover:shadow-panel',
                  env.id === selectedId ? `ring-2 ${ring[env.id]}` : 'ring-1 ring-obs-border',
                )}
              >
                <span className="block aspect-[240/150] overflow-hidden rounded-xl">
                  <EnvIllustration id={env.id} />
                </span>
                <span className="mt-4 block text-[22px] font-bold tracking-[-0.01em]">{env.name}</span>
                <span className="mt-0.5 block text-[15px] text-obs-muted">{env.tagline}</span>
                <span className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-obs-border bg-ivory px-3 py-1 font-mono text-[13.5px] font-medium">
                  <GitBranch className="size-3.5 text-obs-muted" aria-hidden />
                  {env.branch}
                </span>
              </button>
            </li>
          )
          if (i === environments.length - 1) return [tile]
          return [tile, <Connector key={`c-${env.id}`} label={i === 0 ? 'Review and validate' : 'Authorized release'} />]
        })}
      </ol>

      <p className="mt-3 text-center text-[13.5px] text-obs-muted">
        Illustrative lifecycle — no deployment is triggered here.
      </p>
    </section>
  )
}
