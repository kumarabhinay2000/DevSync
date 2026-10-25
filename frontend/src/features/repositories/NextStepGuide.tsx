import { FileCode2, FileSearch, FolderGit2, MessageSquareText } from 'lucide-react'
import type { ReactNode } from 'react'

const steps: { icon: ReactNode; tone: string; title: string; body: string }[] = [
  {
    icon: <FolderGit2 className="size-7" strokeWidth={1.7} aria-hidden />,
    tone: 'bg-obs-selected text-cobalt',
    title: 'Choose a repository',
    body: 'Select a connected repository from the list.',
  },
  {
    icon: <FileSearch className="size-7" strokeWidth={1.7} aria-hidden />,
    tone: 'bg-mint text-ink',
    title: 'Inspect indexed code',
    body: 'Check its state and source layout.',
  },
  {
    icon: (
      <span className="relative">
        <MessageSquareText className="size-7" strokeWidth={1.7} aria-hidden />
        <span className="absolute -bottom-1.5 -right-2 flex size-[18px] items-center justify-center rounded-full bg-mint text-ink ring-2 ring-cobalt">
          <FileCode2 className="size-2.5" aria-hidden />
        </span>
      </span>
    ),
    tone: 'bg-cobalt text-white',
    title: 'Ask with evidence',
    body: 'Get answers with cited source code.',
  },
]

export function NextStepGuide() {
  return (
    <section aria-labelledby="next-title" className="rounded-2xl border border-obs-border bg-white p-6 shadow-soft">
      <h2 id="next-title" className="text-[22px] font-bold tracking-[-0.02em]">
        Your next step, made clear
      </h2>

      <ol className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-stretch">
        {steps.map((s, i) => (
          <li key={s.title} className="flex flex-1 items-stretch gap-3">
            <div className="flex flex-1 items-center gap-4 rounded-xl bg-ivory px-4 py-4">
              <span className={`flex size-14 shrink-0 items-center justify-center rounded-2xl ${s.tone}`}>
                {s.icon}
              </span>
              <span>
                <span className="block text-[15.5px] font-bold leading-snug">
                  {i + 1}. {s.title}
                </span>
                <span className="mt-0.5 block text-[13.5px] leading-snug text-obs-muted">{s.body}</span>
              </span>
            </div>
            {i < steps.length - 1 && (
              <svg aria-hidden width="26" height="14" viewBox="0 0 26 14" className="hidden shrink-0 self-center sm:block">
                <line x1="0" y1="7" x2="20" y2="7" stroke="#DCE1DC" strokeWidth="2" />
                <path d="M16 2l6 5-6 5" fill="none" stroke="#275DFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </li>
        ))}
      </ol>
    </section>
  )
}
