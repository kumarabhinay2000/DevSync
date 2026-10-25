import { ArrowRight, ArrowUp, Check, Copy, Database, Info, MessageSquareText, ShieldCheck, ThumbsDown, ThumbsUp, User } from 'lucide-react'
import { useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { BrandMark } from '@/components/domain/BrandMark'
import { cn } from '@/lib/utils'
import { BRANCH, REPO, REVISION, type Citation, type Conversation } from './data'
import { useCopy } from './useCopy'

export type ExtraMessage = { id: string; role: 'user' | 'assistant'; text: string; pending?: boolean }

function inline(text: string): ReactNode[] {
  return text.split('`').map((part, i) =>
    i % 2 === 1 ? (
      <code key={i} className="rounded bg-ivory px-1.5 py-0.5 font-mono text-[13.5px] font-semibold">
        {part}
      </code>
    ) : (
      part
    ),
  )
}

function Marker({ n, active, onClick }: { n: number; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Show source ${n}`}
      className={cn(
        'mx-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-md px-1 align-text-top text-[11.5px] font-bold transition-colors',
        active ? 'bg-cobalt text-white' : 'bg-obs-selected text-cobalt hover:bg-cobalt hover:text-white',
      )}
    >
      {n}
    </button>
  )
}

function FlowTile({ icon, title, body }: { icon: ReactNode; title: string; body: string }) {
  return (
    <li className="flex min-w-0 flex-1 items-center gap-2.5 rounded-xl bg-white px-3 py-3 ring-1 ring-obs-border">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-obs-selected text-cobalt">
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block whitespace-nowrap text-[14.5px] font-bold">{title}</span>
        <span className="block text-[12.5px] leading-snug text-obs-muted">{body}</span>
      </span>
    </li>
  )
}

function Arrow() {
  return (
    <li aria-hidden className="hidden shrink-0 items-center sm:flex">
      <svg width="30" height="14" viewBox="0 0 30 14">
        <line x1="0" y1="7" x2="22" y2="7" stroke="#B7C0BC" strokeWidth="2" />
        <path d="M18 2l7 5-7 5" fill="none" stroke="#64706D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </li>
  )
}

function CitationCard({ c, active, onClick }: { c: Citation; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'flex w-full items-center gap-3.5 rounded-xl border px-4 py-3 text-left transition-colors',
        active ? 'border-[#3F9E78] bg-mint/40' : 'border-obs-border bg-white hover:bg-ivory',
      )}
    >
      <span
        className={cn(
          'flex size-7 shrink-0 items-center justify-center rounded-md text-[13px] font-bold',
          active ? 'bg-cobalt text-white' : 'bg-obs-selected text-cobalt',
        )}
      >
        {c.n}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-mono text-[14.5px] font-bold">{c.file}</span>
        <span className="block font-mono text-[12.5px] text-obs-muted">
          {c.lines} · {REVISION}
        </span>
      </span>
      <ArrowRight className="size-4 shrink-0 text-obs-muted" aria-hidden />
    </button>
  )
}

export function ChatPane({
  title,
  conv,
  extra,
  citeN,
  onCite,
  onSend,
}: {
  title: string
  conv: Conversation | null
  extra: ExtraMessage[]
  citeN: number
  onCite: (n: number) => void
  onSend: (text: string) => void
}) {
  const [draft, setDraft] = useState('')
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null)
  const { copied, copy } = useCopy()
  const composing = useRef(false)

  const answerText = conv
    ? [conv.lead, ...conv.statements.map((s) => `${s.text.replaceAll('`', '')} [${s.cite}]`)].join('\n')
    : ''

  const submit = () => {
    const text = draft.trim()
    if (!text) return
    onSend(text)
    setDraft('')
  }

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !composing.current) {
      e.preventDefault()
      submit()
    }
  }

  return (
    <section
      aria-labelledby="chat-title"
      className="flex min-w-0 flex-col rounded-2xl border border-obs-border bg-white shadow-soft"
    >
      <header className="border-b border-obs-border px-6 py-4">
        <h2 id="chat-title" className="text-[22px] font-bold tracking-[-0.02em]">
          {title}
        </h2>
        <p className="mt-0.5 font-mono text-[13px] text-obs-muted">
          Pinned to {BRANCH} · {REVISION}
        </p>
      </header>

      <div className="flex-1 space-y-7 px-6 py-6" aria-live="polite">
        {conv ? (
          <>
            {/* Question */}
            <div className="flex items-start gap-3.5">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-ink text-[13px] font-bold text-mint">
                AK
              </span>
              <div>
                <p className="text-[13px] font-semibold text-obs-muted">You</p>
                <p className="mt-1 rounded-xl rounded-tl-sm bg-ivory px-4 py-3 text-[16px] font-medium">
                  {conv.question}
                </p>
              </div>
            </div>

            {/* Answer */}
            <div className="flex items-start gap-3.5">
              <BrandMark className="size-9" />
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-semibold text-obs-muted">DevSync AI</p>
                <p className="mt-1 text-[18px] font-bold leading-snug tracking-[-0.01em]">{conv.lead}</p>

                {conv.flow && (
                  <div className="mt-4 rounded-xl bg-ivory p-4">
                    <p className="mb-3 text-[12px] font-semibold uppercase tracking-[0.12em] text-obs-muted">
                      Illustrative request path
                    </p>
                    <ol className="flex flex-col gap-2.5 sm:flex-row sm:items-stretch">
                      <FlowTile icon={<User className="size-5" aria-hidden />} title="Request" body="User requests a repository read." />
                      <Arrow />
                      <FlowTile icon={<ShieldCheck className="size-5" aria-hidden />} title="Access policy" body="Checks membership and permission." />
                      <Arrow />
                      <FlowTile icon={<Database className="size-5" aria-hidden />} title="Repository read" body="Runs after the check succeeds." />
                    </ol>
                  </div>
                )}

                <ol className="mt-4 space-y-2.5">
                  {conv.statements.map((s, i) => (
                    <li key={s.cite} className="flex gap-3 text-[15.5px] leading-relaxed">
                      <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-ivory text-[12.5px] font-bold text-obs-muted">
                        {i + 1}
                      </span>
                      <span>
                        {inline(s.text)}
                        <Marker n={s.cite} active={citeN === s.cite} onClick={() => onCite(s.cite)} />
                      </span>
                    </li>
                  ))}
                </ol>

                <div className="mt-5 grid gap-2.5">
                  {conv.citations.map((c) => (
                    <CitationCard key={c.n} c={c} active={citeN === c.n} onClick={() => onCite(c.n)} />
                  ))}
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-obs-border pt-3">
                  <span className="text-[13px] text-obs-muted">Illustrative answer</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => copy('answer', answerText)}
                      className="inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-[13.5px] font-medium text-obs-muted hover:bg-ivory hover:text-obs-text"
                    >
                      {copied === 'answer' ? <Check className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />}
                      {copied === 'answer' ? 'Copied' : 'Copy answer'}
                    </button>
                    <button
                      type="button"
                      aria-pressed={feedback === 'up'}
                      onClick={() => setFeedback((f) => (f === 'up' ? null : 'up'))}
                      className={cn(
                        'inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-[13.5px] font-medium hover:bg-ivory',
                        feedback === 'up' ? 'bg-obs-selected text-cobalt' : 'text-obs-muted',
                      )}
                    >
                      <ThumbsUp className="size-4" aria-hidden />
                      Helpful
                    </button>
                    <button
                      type="button"
                      aria-pressed={feedback === 'down'}
                      onClick={() => setFeedback((f) => (f === 'down' ? null : 'down'))}
                      className={cn(
                        'inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-[13.5px] font-medium hover:bg-ivory',
                        feedback === 'down' ? 'bg-obs-selected text-cobalt' : 'text-obs-muted',
                      )}
                    >
                      <ThumbsDown className="size-4" aria-hidden />
                      Not helpful
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center py-10 text-center">
            <span className="flex size-14 items-center justify-center rounded-2xl bg-obs-selected text-cobalt">
              <MessageSquareText className="size-7" strokeWidth={1.7} aria-hidden />
            </span>
            <p className="mt-4 text-[18px] font-bold">Ask your first question</p>
            <p className="mt-1 max-w-sm text-[14.5px] text-obs-muted">
              Answers use {REPO} at {REVISION} and link to the exact source they rely on.
            </p>
          </div>
        )}

        {extra.map((m) =>
          m.role === 'user' ? (
            <div key={m.id} className="flex items-start gap-3.5">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-ink text-[13px] font-bold text-mint">
                AK
              </span>
              <div>
                <p className="text-[13px] font-semibold text-obs-muted">You</p>
                <p className="mt-1 whitespace-pre-wrap rounded-xl rounded-tl-sm bg-ivory px-4 py-3 text-[16px] font-medium">
                  {m.text}
                </p>
              </div>
            </div>
          ) : (
            <div key={m.id} className="flex items-start gap-3.5">
              <BrandMark className="size-9" />
              <div>
                <p className="text-[13px] font-semibold text-obs-muted">DevSync AI</p>
                {m.pending ? (
                  <p className="mt-1.5 flex items-center gap-3 font-mono text-[13.5px] text-obs-muted">
                    <span className="flex gap-1" aria-hidden>
                      {[0, 1, 2].map((i) => (
                        <span
                          key={i}
                          className="dot-bounce size-1.5 rounded-full bg-cobalt"
                          style={{ animationDelay: `${i * 160}ms` }}
                        />
                      ))}
                    </span>
                    Searching indexed code at {REVISION}…
                  </p>
                ) : (
                  <p className="mt-1 flex items-start gap-2.5 rounded-xl bg-warning-bg px-4 py-3 text-[15px] text-warning">
                    <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
                    <span>{m.text}</span>
                  </p>
                )}
              </div>
            </div>
          ),
        )}
      </div>

      {/* Composer */}
      <div className="border-t border-obs-border p-5">
        <div className="flex items-end gap-3 rounded-xl border border-obs-border bg-white p-3 focus-within:border-cobalt">
          <label className="flex-1">
            <span className="sr-only">Ask about this repository</span>
            <textarea
              rows={2}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={onKeyDown}
              onCompositionStart={() => (composing.current = true)}
              onCompositionEnd={() => (composing.current = false)}
              placeholder="Ask about this repository…"
              className="block max-h-40 w-full resize-none bg-transparent px-1 text-[15.5px] outline-none placeholder:text-obs-muted focus-visible:outline-none"
            />
          </label>
          <button
            type="button"
            onClick={submit}
            disabled={!draft.trim()}
            aria-label="Send question"
            className="flex size-11 shrink-0 items-center justify-center rounded-control bg-cobalt text-white transition-colors hover:bg-cobalt-hover disabled:opacity-40"
          >
            <ArrowUp className="size-5" aria-hidden />
          </button>
        </div>
        <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 text-[12.5px] text-obs-muted">
          <span>Enter to send · Shift + Enter for a new line</span>
          <span>
            Uses <span className="font-mono">{REPO}</span> at the indexed revision shown above.
          </span>
        </div>
      </div>
    </section>
  )
}
