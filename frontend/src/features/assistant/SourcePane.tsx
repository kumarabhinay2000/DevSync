import { Check, Copy, ExternalLink, FileSearch, GitBranch } from 'lucide-react'
import { CodeBlock } from '@/components/domain/CodeBlock'
import { BRANCH, REVISION, type Citation } from './data'
import { useCopy } from './useCopy'

export function SourcePane({ citation, note }: { citation: Citation | null; note: string }) {
  const { copied, copy } = useCopy()

  return (
    <aside
      aria-labelledby="source-title"
      className="flex min-w-0 flex-col rounded-2xl border border-obs-border bg-white shadow-soft"
    >
      <header className="border-b border-obs-border px-5 py-4">
        <div className="flex items-center justify-between">
          <h2 id="source-title" className="text-[20px] font-bold tracking-[-0.01em]">
            Source evidence
          </h2>
          {citation && (
            <span
              className="flex size-7 items-center justify-center rounded-md bg-cobalt text-[13px] font-bold text-white"
              aria-label={`Citation ${citation.n}`}
            >
              {citation.n}
            </span>
          )}
        </div>
        <p className="mt-0.5 text-[14px] text-obs-muted">Verify the answer against the code.</p>
      </header>

      {citation ? (
        <div className="flex flex-1 flex-col p-5">
          <p className="truncate font-mono text-[16px] font-bold">{citation.file}</p>
          <p className="mt-0.5 truncate font-mono text-[12.5px] text-obs-muted">{citation.dir}</p>

          <dl className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-[13px]">
            <div className="flex items-center gap-1.5">
              <dt className="sr-only">Revision</dt>
              <GitBranch className="size-3.5 text-obs-muted" aria-hidden />
              <dd className="font-mono font-medium">
                {BRANCH} · {REVISION}
              </dd>
            </div>
            <div className="flex items-center gap-1.5">
              <dt className="sr-only">Range</dt>
              <FileSearch className="size-3.5 text-obs-muted" aria-hidden />
              <dd className="font-medium">{citation.lines}</dd>
            </div>
          </dl>

          <div className="mt-4 overflow-hidden rounded-xl border border-obs-border">
            <CodeBlock
              key={citation.file}
              label={`${citation.file}, ${citation.lines}`}
              code={citation.code}
              startLine={citation.startLine}
              highlight={citation.highlight}
              tone="mint"
              className="text-[12.5px]"
            />
          </div>

          <div className="mt-4 rounded-xl border border-[#3F9E78]/50 bg-mint/25 px-4 py-3">
            <p className="text-[14px] font-bold">Referenced in answer [{citation.n}]</p>
            <p className="mt-0.5 text-[13.5px] text-obs-muted">{note}</p>
          </div>

          <div className="mt-4 flex flex-wrap gap-2.5">
            <button
              type="button"
              onClick={() => copy('source', citation.code.trimEnd())}
              className="inline-flex h-10 items-center gap-2 rounded-control border border-obs-border bg-white px-4 text-[14px] font-semibold transition-colors hover:bg-obs-selected"
            >
              {copied === 'source' ? <Check className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />}
              {copied === 'source' ? 'Copied' : 'Copy source'}
            </button>
            <button
              type="button"
              disabled
              title="Illustrative data: there is no live GitHub repository behind this view"
              className="inline-flex h-10 items-center gap-2 rounded-control border border-obs-border bg-white px-4 text-[14px] font-semibold opacity-60"
            >
              Open on GitHub
              <ExternalLink className="size-4" aria-hidden />
            </button>
          </div>

          <p className="mt-auto pt-4 text-[12.5px] text-obs-muted">Illustrative source preview · indexed revision</p>
        </div>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center px-6 py-14 text-center">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-ivory text-obs-muted">
            <FileSearch className="size-6" aria-hidden />
          </span>
          <p className="mt-3 text-[16px] font-bold">No source selected</p>
          <p className="mt-1 text-[14px] text-obs-muted">Cited source appears here once an answer has references.</p>
        </div>
      )}
    </aside>
  )
}
