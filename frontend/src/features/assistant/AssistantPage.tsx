import { Check, ChevronDown, CheckCircle2, Copy, FolderGit2, GitBranch, ShieldCheck } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { ChatPane, type ExtraMessage } from './ChatPane'
import { ConversationList, type ConvItem } from './ConversationList'
import { SourcePane } from './SourcePane'
import { BRANCH, REPO, REVISION, conversations } from './data'
import { useCopy } from './useCopy'

const INSUFFICIENT =
  'The indexed context does not establish that. This demo only contains answers for the sample conversations.'

export function AssistantPage() {
  const [items, setItems] = useState<ConvItem[]>(() => conversations.map(({ id, title }) => ({ id, title })))
  const [activeId, setActiveId] = useState(conversations[0].id)
  const [citeN, setCiteN] = useState(1)
  const [extra, setExtra] = useState<Record<string, ExtraMessage[]>>({})
  const { copied, copy } = useCopy()
  const timers = useRef<number[]>([])
  const counter = useRef(0)

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), [])

  const conv = useMemo(() => conversations.find((c) => c.id === activeId) ?? null, [activeId])
  const active = items.find((i) => i.id === activeId)
  const citation = conv?.citations.find((c) => c.n === citeN) ?? conv?.citations[0] ?? null

  const select = (id: string) => {
    setActiveId(id)
    setCiteN(1)
  }

  const newConversation = () => {
    counter.current += 1
    const id = `new-${counter.current}`
    setItems((prev) => [{ id, title: 'New conversation' }, ...prev])
    select(id)
  }

  const send = (text: string) => {
    const id = activeId
    const key = `${id}-${++counter.current}`
    const pendingId = `${key}-a`
    setExtra((prev) => ({
      ...prev,
      [id]: [
        ...(prev[id] ?? []),
        { id: `${key}-u`, role: 'user', text },
        { id: pendingId, role: 'assistant', text: '', pending: true },
      ],
    }))
    // Name an empty conversation after its first question.
    setItems((prev) =>
      prev.map((i) => (i.id === id && i.title === 'New conversation' ? { ...i, title: text.slice(0, 40) } : i)),
    )
    timers.current.push(
      window.setTimeout(() => {
        setExtra((prev) => ({
          ...prev,
          [id]: (prev[id] ?? []).map((m) =>
            m.id === pendingId ? { id: m.id, role: 'assistant', text: INSUFFICIENT } : m,
          ),
        }))
      }, 1500),
    )
  }

  return (
    <div className="mx-auto max-w-[1480px]">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cobalt">Repository intelligence</p>
          <h1 className="mt-3 text-[38px] font-bold leading-[1.05] tracking-[-0.03em] md:text-[40px]">
            Ask. Understand. Verify.
          </h1>
          <p className="mt-3 text-base text-obs-muted">Answers grounded in your indexed source.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label className="relative">
            <span className="sr-only">Repository</span>
            <FolderGit2 className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-cobalt" aria-hidden />
            <select
              defaultValue={REPO}
              className="h-11 appearance-none rounded-control border border-obs-border bg-white pl-9 pr-9 font-mono text-[14.5px] font-semibold focus:border-cobalt"
            >
              <option value={REPO}>{REPO}</option>
              <option disabled>web-client — indexing</option>
              <option disabled>ai-service — reindex failed</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-obs-muted" aria-hidden />
          </label>

          <span className="inline-flex h-11 items-center gap-1.5 rounded-control border border-obs-border bg-white px-3.5 font-mono text-[14px] font-medium">
            <GitBranch className="size-4 text-obs-muted" aria-hidden />
            {BRANCH}
          </span>

          <button
            type="button"
            onClick={() => copy('rev', REVISION)}
            aria-label={`Copy indexed revision ${REVISION}`}
            className="inline-flex h-11 items-center gap-2 rounded-control border border-obs-border bg-white px-3.5 font-mono text-[14px] font-medium transition-colors hover:bg-obs-selected"
          >
            {REVISION}
            {copied === 'rev' ? <Check className="size-4 text-success" aria-hidden /> : <Copy className="size-4 text-obs-muted" aria-hidden />}
          </button>

          <span className="inline-flex h-11 items-center gap-1.5 rounded-control bg-success-bg px-3.5 text-[14px] font-semibold text-success">
            <CheckCircle2 className="size-4" aria-hidden />
            Index ready
          </span>
        </div>
      </div>

      <div className="mt-8 grid items-stretch gap-5 xl:grid-cols-[250px_minmax(0,1fr)_470px]">
        <ConversationList items={items} activeId={activeId} onSelect={select} onNew={newConversation} />
        <ChatPane
          key={activeId}
          title={active?.title ?? 'Conversation'}
          conv={conv}
          extra={extra[activeId] ?? []}
          citeN={citation?.n ?? 1}
          onCite={setCiteN}
          onSend={send}
        />
        <SourcePane citation={citation} note={conv?.evidenceNote[citation?.n ?? 1] ?? ''} />
      </div>

      <p className="mt-8 flex items-center gap-2 text-[13px] text-obs-muted">
        <ShieldCheck className="size-4" aria-hidden />
        Project permissions apply to every source and tool request.
      </p>
    </div>
  )
}
