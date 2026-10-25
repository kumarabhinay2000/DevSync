import { AlertTriangle, CheckCircle2, Loader } from 'lucide-react'
import { Link } from 'react-router'
import { cn } from '@/lib/utils'

const events = [
  {
    icon: Loader,
    spin: true,
    tone: 'text-[#1d3fbf] bg-obs-selected',
    text: 'web-client indexing started',
    time: '2 min ago',
  },
  { icon: CheckCircle2, tone: 'text-success bg-success-bg', text: 'api-service ready to explore', time: '12 min ago' },
  {
    icon: AlertTriangle,
    tone: 'text-warning bg-warning-bg',
    text: 'ai-service reindex needs attention',
    time: '18 min ago',
  },
]

export function ActivityTimeline() {
  return (
    <section
      aria-labelledby="activity-title"
      className="flex flex-col rounded-2xl border border-obs-border bg-white p-6 shadow-soft"
    >
      <h2 id="activity-title" className="text-[24px] font-bold tracking-[-0.02em]">
        Recent activity
      </h2>

      <ol className="relative mt-6 flex-1 space-y-6">
        <span aria-hidden className="absolute bottom-4 left-[15px] top-4 w-px bg-obs-border" />
        {events.map((e) => (
          <li key={e.text} className="relative flex items-start gap-4">
            <span className={cn('relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full', e.tone)}>
              <e.icon
                className={cn('size-4', e.spin && 'animate-spin motion-reduce:animate-none')}
                aria-hidden
              />
            </span>
            <div>
              <p className="text-[15.5px] font-semibold leading-snug">{e.text}</p>
              <p className="text-[13.5px] text-obs-muted">{e.time}</p>
            </div>
          </li>
        ))}
      </ol>

      <Link to="/app/repositories" className="mt-6 text-[15px] font-semibold text-cobalt hover:underline">
        View activity →
      </Link>
    </section>
  )
}
