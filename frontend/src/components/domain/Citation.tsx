import { ExternalLink, FileCode2 } from 'lucide-react'
import { cn } from '@/lib/utils'

/** Small numbered reference marker used inline in answers. */
export function CitationMarker({ n, className }: { n: number; className?: string }) {
  return (
    <span
      className={cn(
        'mx-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-md bg-selected px-1 align-text-top text-[11px] font-semibold text-primary',
        className,
      )}
      aria-label={`Source ${n}`}
    >
      {n}
    </span>
  )
}

type SourceRefProps = {
  n: number
  file: string
  path?: string
  lines: string
  revision: string
  active?: boolean
}

/** Source reference row: file, line range, branch · commit, link icon. */
export function SourceRef({ n, file, path, lines, revision, active }: SourceRefProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-control border bg-surface px-3.5 py-3',
        active ? 'border-primary/40 bg-selected/40' : 'border-border',
      )}
    >
      <CitationMarker n={n} className="mx-0 size-6 shrink-0 text-xs" />
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1.5 truncate font-mono text-[13px] font-semibold text-foreground">
          <FileCode2 className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
          {file}
        </p>
        <p className="truncate font-mono text-xs text-muted-foreground">
          {path ? `${path} · ` : ''}
          {lines} · {revision}
        </p>
      </div>
      <ExternalLink className="size-4 shrink-0 text-muted-foreground" aria-label="Open exact revision" />
    </div>
  )
}
