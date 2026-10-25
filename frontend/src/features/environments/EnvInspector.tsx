import { FileText, GitBranch, Link2, Plug, Search, Settings2, Shield } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { cn } from '@/lib/utils'
import { NotConnected } from './ConfigList'
import type { Environment } from './data'
import { envIcon } from './envIcons'

function Row({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
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

const guidance = [
  { icon: Search, text: 'Review the repository mapping' },
  { icon: FileText, text: 'Inspect non-secret configuration' },
  { icon: Settings2, text: 'Connect an approved runtime when supported' },
]

export function EnvInspector({ env }: { env: Environment }) {
  const { Icon, tone } = envIcon[env.id]
  return (
    <aside
      aria-label="Selected environment"
      className="rounded-2xl border border-obs-border bg-white p-6 shadow-soft"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-obs-muted">Selected environment</p>

      <div className="mt-4 flex items-center gap-4">
        <span className={cn('flex size-16 shrink-0 items-center justify-center rounded-2xl', tone)}>
          <Icon className="size-8" strokeWidth={1.7} aria-hidden />
        </span>
        <div>
          <h2 className="text-[26px] font-bold leading-tight tracking-[-0.02em]">{env.name}</h2>
          <p className="text-[14px] text-obs-muted">Example configuration</p>
        </div>
      </div>

      <dl className="mt-5 divide-y divide-obs-border/70 border-t border-obs-border">
        <Row icon={<Shield className="size-4" aria-hidden />} label="Repository">
          <span className="font-mono">{env.repo}</span>
        </Row>
        <Row icon={<GitBranch className="size-4" aria-hidden />} label="Branch mapping">
          <span className="font-mono">{env.branch}</span>
        </Row>
        <Row icon={<Plug className="size-4" aria-hidden />} label="Runtime connection">
          <NotConnected />
        </Row>
        <Row icon={<Link2 className="size-4" aria-hidden />} label="Verified revision">
          <span className="font-medium text-obs-muted">Not available</span>
        </Row>
      </dl>

      <ul className="mt-5 space-y-3 border-t border-obs-border pt-5">
        {guidance.map((g) => (
          <li key={g.text} className="flex items-center gap-3 text-[14.5px]">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-ivory text-obs-muted">
              <g.icon className="size-4" aria-hidden />
            </span>
            {g.text}
          </li>
        ))}
      </ul>

      <Link
        to={`/app/environments/${env.id}`}
        className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-control border border-obs-border bg-white text-[15.5px] font-semibold transition-colors hover:bg-obs-selected"
      >
        Open environment details
      </Link>
    </aside>
  )
}
