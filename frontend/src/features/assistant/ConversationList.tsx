import { FolderLock, FolderGit2, Plus } from 'lucide-react'
import { Link } from 'react-router'
import { cn } from '@/lib/utils'
import { REPO } from './data'

export type ConvItem = { id: string; title: string }

export function ConversationList({
  items,
  activeId,
  onSelect,
  onNew,
}: {
  items: ConvItem[]
  activeId: string
  onSelect: (id: string) => void
  onNew: () => void
}) {
  return (
    <aside
      aria-labelledby="convs-title"
      className="flex flex-col rounded-2xl border border-obs-border bg-white p-5 shadow-soft"
    >
      <h2 id="convs-title" className="text-[20px] font-bold tracking-[-0.01em]">
        Your conversations
      </h2>

      <button
        type="button"
        onClick={onNew}
        className="mt-4 inline-flex h-11 items-center justify-center gap-2 rounded-control bg-cobalt text-[15px] font-semibold text-white transition-colors hover:bg-cobalt-hover"
      >
        <Plus className="size-4" aria-hidden />
        New conversation
      </button>

      <p className="mb-2 mt-6 text-[11px] font-semibold uppercase tracking-[0.14em] text-obs-muted">Today</p>
      <ul className="space-y-1.5">
        {items.map((c) => {
          const active = c.id === activeId
          return (
            <li key={c.id}>
              <button
                type="button"
                aria-current={active ? 'true' : undefined}
                onClick={() => onSelect(c.id)}
                className={cn(
                  'relative block w-full rounded-xl px-3.5 py-3 text-left transition-colors',
                  active ? 'bg-obs-selected' : 'hover:bg-ivory',
                )}
              >
                {active && <span aria-hidden className="absolute inset-y-2 left-0 w-1 rounded-r bg-cobalt" />}
                <span className="block truncate text-[15px] font-semibold">{c.title}</span>
                <span className="mt-0.5 flex items-center gap-1.5 font-mono text-[12.5px] text-obs-muted">
                  <FolderGit2 className="size-3.5" aria-hidden />
                  {REPO}
                </span>
              </button>
            </li>
          )
        })}
      </ul>

      <div className="mt-auto pt-6">
        <div className="rounded-xl bg-ivory p-4 text-center">
          <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-mint text-ink">
            <FolderLock className="size-6" strokeWidth={1.7} aria-hidden />
          </span>
          <p className="mt-3 text-[15px] font-bold">Scoped to {REPO}</p>
          <p className="mt-1 text-[13px] leading-snug text-obs-muted">
            Only your authorized repository context is used.
          </p>
          <Link to="/app/repositories" className="mt-3 inline-block text-[14px] font-semibold text-cobalt hover:underline">
            Choose another repository →
          </Link>
        </div>
      </div>
    </aside>
  )
}
