import { ArrowRight, ChevronDown, FileCode2, Sparkles } from 'lucide-react'
import { Link } from 'react-router'
import { BrandMark } from '@/components/domain/BrandMark'

function StepLabel({ children }: { children: string }) {
  return (
    <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted">{children}</p>
  )
}

export function AiPreviewPanel() {
  return (
    <section
      aria-labelledby="ai-preview-title"
      className="flex flex-col rounded-2xl bg-ink p-6 text-white shadow-panel"
    >
      <h2 id="ai-preview-title" className="flex items-center gap-2.5 text-[24px] font-bold tracking-[-0.02em]">
        <Sparkles className="size-6 text-mint" aria-hidden />
        Ask with context
      </h2>

      <p className="mt-4 inline-flex w-fit items-center gap-2 rounded-control border border-ink-border bg-ink-raised px-3.5 py-2 font-mono text-[13px] text-mint">
        api-service · main
        <ChevronDown className="size-3.5 text-ink-muted" aria-hidden />
      </p>

      <div className="mt-7 flex-1 space-y-6">
        <div>
          <StepLabel>Question</StepLabel>
          <p className="rounded-xl border border-ink-border bg-ink-raised px-4 py-3 text-[16px] font-medium">
            Where is project access checked?
          </p>
        </div>

        <div>
          <StepLabel>Answer</StepLabel>
          <div className="flex gap-3">
            <BrandMark className="mt-0.5 size-8" />
            <p className="text-[16px] leading-relaxed">
              The access policy checks permissions before repository operations.
            </p>
          </div>
        </div>

        <div>
          <StepLabel>Source evidence</StepLabel>
          <Link
            to="/app/assistant"
            className="group flex items-center gap-3.5 rounded-xl bg-mint/15 px-4 py-3.5 ring-1 ring-mint/40 transition-colors hover:bg-mint/25"
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-control bg-mint text-ink">
              <FileCode2 className="size-5" aria-hidden />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate font-mono text-[14.5px] font-bold">ProjectAccessPolicy.java</span>
              <span className="block font-mono text-[12.5px] text-mint">Lines 12–25 · a3f82c1</span>
            </span>
            <ArrowRight className="size-5 text-mint transition-transform group-hover:translate-x-0.5" aria-hidden />
          </Link>
        </div>
      </div>

      <p className="mt-6 text-center text-[13px] text-ink-muted">Illustrative answer preview</p>

      <Link
        to="/app/assistant"
        className="mt-3 inline-flex h-12 items-center justify-center gap-2 rounded-control bg-cobalt px-5 text-[16px] font-semibold text-white transition-colors hover:bg-cobalt-hover"
      >
        Open AI Assistant
        <ArrowRight className="size-4" aria-hidden />
      </Link>
    </section>
  )
}
