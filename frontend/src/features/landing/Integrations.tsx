import { Braces, Gauge, Network, Plug } from 'lucide-react'
import type { ReactNode } from 'react'
import { Reveal } from '@/components/domain/Reveal'
import { SectionHeading } from './SectionHeading'

function GitHubMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M12 .5C5.73.5.5 5.73.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56v-2c-3.2.7-3.87-1.37-3.87-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.76 2.69 1.25 3.34.96.1-.74.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.68 0-1.25.45-2.28 1.18-3.08-.12-.29-.51-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.78 0c2.2-1.49 3.17-1.18 3.17-1.18.62 1.59.23 2.76.11 3.05.74.8 1.18 1.83 1.18 3.08 0 4.41-2.69 5.38-5.25 5.67.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5Z" />
    </svg>
  )
}

const chips: { label: string; icon: ReactNode }[] = [
  { label: 'GitHub', icon: <GitHubMark className="size-5" /> },
  { label: 'SonarQube', icon: <Gauge className="size-5" strokeWidth={1.8} aria-hidden /> },
  { label: 'MCP', icon: <Plug className="size-5" strokeWidth={1.8} aria-hidden /> },
  { label: 'REST APIs', icon: <Braces className="size-5" strokeWidth={1.8} aria-hidden /> },
  { label: 'gRPC', icon: <Network className="size-5" strokeWidth={1.8} aria-hidden /> },
]

export function Integrations() {
  return (
    <section
      id="integrations"
      aria-labelledby="integrations-title"
      className="scroll-mt-20 border-y border-border bg-surface py-20"
    >
      <div className="container-page">
        <SectionHeading
          id="integrations-title"
          title="Fits your development workflow."
          description="Connect your repositories, analysis tools, and AI context."
        />

        <ul className="mt-12 flex flex-wrap items-center justify-center gap-4">
          {chips.map((c, i) => (
            <li key={c.label}>
              <Reveal delay={i * 90}>
                <span className="flex h-14 items-center gap-3 rounded-control border border-border bg-surface px-6 text-[17px] font-semibold text-foreground shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-panel">
                  <span className="text-primary">{c.icon}</span>
                  {c.label}
                </span>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
