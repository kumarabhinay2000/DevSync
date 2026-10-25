import { AlertTriangle, CheckCircle2, Loader } from 'lucide-react'
import type { RepoStatus } from './data'

/** Status is always icon + text, never color alone. */
export function StatusBadge({ status }: { status: RepoStatus }) {
  if (status === 'ready') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-success-bg px-3 py-1 text-[14px] font-semibold text-success">
        <CheckCircle2 className="size-4" aria-hidden />
        Ready
      </span>
    )
  }
  if (status === 'indexing') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-obs-selected px-3 py-1 text-[14px] font-semibold text-[#1d3fbf]">
        <Loader className="size-4 animate-spin motion-reduce:animate-none" aria-hidden />
        Indexing
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-warning-bg px-3 py-1 text-[14px] font-semibold text-warning">
      <AlertTriangle className="size-4" aria-hidden />
      Reindex failed
    </span>
  )
}
