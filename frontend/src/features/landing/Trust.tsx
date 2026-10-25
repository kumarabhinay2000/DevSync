import { GitPullRequest, ShieldCheck, SlidersHorizontal } from 'lucide-react'
import { Reveal } from '@/components/domain/Reveal'
import { SectionHeading } from './SectionHeading'

const items = [
  {
    icon: ShieldCheck,
    title: 'Project-scoped access',
    body: 'Keep repository access tied to explicit permissions.',
  },
  {
    icon: SlidersHorizontal,
    title: 'Controlled tool use',
    body: 'Connect approved tools through a policy gateway.',
  },
  {
    icon: GitPullRequest,
    title: 'Human-reviewed changes',
    body: 'Review the exact patch before an authorized pull request.',
  },
]

export function Trust() {
  return (
    <section aria-labelledby="trust-title" className="py-24">
      <div className="container-page">
        <SectionHeading
          id="trust-title"
          title="AI assistance. Clear boundaries."
          description="Designed to work within your project permissions and review process."
        />

        <Reveal className="mt-14" delay={100}>
          <ul className="grid overflow-hidden rounded-dialog border border-border bg-surface shadow-soft md:grid-cols-3 md:divide-x md:divide-border">
            {items.map((it) => (
              <li
                key={it.title}
                className="group flex flex-col items-center border-b border-border px-8 py-10 text-center transition-colors last:border-b-0 hover:bg-background md:border-b-0"
              >
                <span className="flex size-14 items-center justify-center rounded-full bg-selected text-primary transition-transform duration-300 group-hover:-translate-y-1">
                  <it.icon className="size-6" strokeWidth={1.7} aria-hidden />
                </span>
                <h3 className="mt-5 text-xl font-semibold text-foreground">{it.title}</h3>
                <p className="mt-2 max-w-[17rem] text-base text-muted-foreground">{it.body}</p>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  )
}
