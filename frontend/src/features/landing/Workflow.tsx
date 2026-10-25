import { ArrowRight, FolderGit2, MessagesSquare, ScanSearch } from 'lucide-react'
import { useInView } from '@/lib/motion'
import { cn } from '@/lib/utils'
import { SectionHeading } from './SectionHeading'

const steps = [
  {
    n: '01',
    icon: FolderGit2,
    title: 'Connect your repository',
    body: 'Choose a repository and index a specific revision.',
  },
  {
    n: '02',
    icon: MessagesSquare,
    title: 'Ask with context',
    body: 'Get answers grounded in relevant code and documentation.',
  },
  {
    n: '03',
    icon: ScanSearch,
    title: 'Review with confidence',
    body: 'Inspect sources, proposed changes, and test results.',
  },
]

const STEP_MS = 450

export function Workflow() {
  const [ref, inView] = useInView<HTMLOListElement>(0.3)

  return (
    <section id="how-it-works" aria-labelledby="workflow-title" className="scroll-mt-20 py-24">
      <div className="container-page">
        <SectionHeading
          id="workflow-title"
          title="From repository to clarity."
          description="Go from a codebase to clear, source-linked answers in three simple steps."
        />

        <ol ref={ref} className="mt-16 grid gap-12 md:grid-cols-3 md:gap-0">
          {steps.map((s, i) => (
            <li key={s.n} className="relative flex flex-col items-center px-6 text-center md:px-10">
              <div
                className={cn(
                  'relative flex size-20 items-center justify-center rounded-2xl border bg-surface shadow-soft transition-all duration-500',
                  inView ? 'scale-100 border-primary/30 opacity-100' : 'scale-90 border-border opacity-0',
                )}
                style={{ transitionDelay: `${i * STEP_MS}ms` }}
              >
                <s.icon className="size-8 text-primary" strokeWidth={1.6} aria-hidden />
                <span className="absolute -right-3 -top-3 flex size-9 items-center justify-center rounded-full bg-primary text-[13px] font-bold text-white ring-4 ring-background">
                  {s.n}
                </span>
              </div>

              <div
                className={cn(
                  'transition-all duration-500',
                  inView ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0',
                )}
                style={{ transitionDelay: `${i * STEP_MS + 150}ms` }}
              >
                <h3 className="mt-7 text-xl font-semibold text-foreground">{s.title}</h3>
                <p className="mt-2 max-w-[18rem] text-base text-muted-foreground">{s.body}</p>
              </div>

              {i < steps.length - 1 && (
                <span
                  aria-hidden
                  className={cn(
                    'absolute right-0 top-8 hidden w-1/3 origin-left translate-x-1/2 items-center text-primary/50 transition-transform duration-700 md:flex',
                    inView ? 'scale-x-100' : 'scale-x-0',
                  )}
                  style={{ transitionDelay: `${i * STEP_MS + 300}ms` }}
                >
                  <span className="h-px flex-1 bg-current" />
                  <ArrowRight className="-ml-1.5 size-4" />
                </span>
              )}
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
