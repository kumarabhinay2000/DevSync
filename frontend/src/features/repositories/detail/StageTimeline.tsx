import { AlertTriangle, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export type StageState = 'complete' | 'running' | 'waiting' | 'failed'

export type Stage = { title: string; description: string; state: StageState; note?: string }

const label: Record<StageState, string> = {
  complete: 'Complete',
  running: 'Running',
  waiting: 'Waiting',
  failed: 'Failed',
}

const labelTone: Record<StageState, string> = {
  complete: 'text-success',
  running: 'text-[#1d3fbf]',
  waiting: 'text-obs-muted',
  failed: 'text-warning',
}

function Marker({ state }: { state: StageState }) {
  if (state === 'complete') {
    return (
      <span className="flex size-9 items-center justify-center rounded-full bg-success text-white">
        <Check className="size-[18px]" strokeWidth={3} aria-hidden />
      </span>
    )
  }
  if (state === 'running') {
    return (
      <span className="relative flex size-9 items-center justify-center">
        <span className="absolute inset-0 animate-ping rounded-full bg-cobalt/25 motion-reduce:animate-none" aria-hidden />
        <span className="relative flex size-9 items-center justify-center rounded-full border-[3px] border-cobalt bg-white">
          <span className="size-3 rounded-full bg-cobalt" />
        </span>
      </span>
    )
  }
  if (state === 'failed') {
    return (
      <span className="flex size-9 items-center justify-center rounded-full bg-warning-bg text-warning ring-2 ring-warning/40">
        <AlertTriangle className="size-[18px]" aria-hidden />
      </span>
    )
  }
  return <span className="block size-9 rounded-full border-2 border-obs-border bg-white" aria-hidden />
}

export function StageTimeline({ stages }: { stages: Stage[] }) {
  return (
    <ol className="relative">
      {stages.map((s, i) => {
        const last = i === stages.length - 1
        const active = s.state === 'running' || s.state === 'failed'
        return (
          <li key={s.title} className="relative flex gap-5 pb-6 last:pb-0">
            {!last && (
              <span
                aria-hidden
                className={cn(
                  'absolute left-[17px] top-9 -bottom-0 w-0.5',
                  s.state === 'complete' ? 'bg-success/50' : 'bg-obs-border',
                )}
              />
            )}
            <span className="relative z-10 shrink-0">
              <Marker state={s.state} />
            </span>

            <div
              className={cn(
                'flex min-w-0 flex-1 items-start justify-between gap-4 rounded-xl px-4 py-3 -mt-1',
                active && 'bg-obs-selected/60 ring-1 ring-cobalt/25',
                s.state === 'failed' && 'bg-warning-bg/60 ring-warning/30',
              )}
            >
              <div className="min-w-0">
                <p className={cn('text-[17px] font-bold leading-snug', s.state === 'waiting' && 'text-obs-muted')}>
                  {s.title}
                </p>
                <p className="mt-0.5 text-[14.5px] text-obs-muted">{s.description}</p>
                {s.note && <p className="mt-1 font-mono text-[12.5px] text-warning">{s.note}</p>}
              </div>
              <span className={cn('shrink-0 pt-0.5 text-[14px] font-semibold', labelTone[s.state])}>
                {label[s.state]}
              </span>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
