import { Plus, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'
import { Inspector } from './Inspector'
import { NextStepGuide } from './NextStepGuide'
import { RepositoryBrowser } from './RepositoryBrowser'
import { repos } from './data'

function GitHubMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="currentColor" aria-hidden>
      <path d="M12 .5C5.73.5.5 5.73.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56v-2c-3.2.7-3.87-1.37-3.87-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.76 2.69 1.25 3.34.96.1-.74.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.68 0-1.25.45-2.28 1.18-3.08-.12-.29-.51-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.78 0c2.2-1.49 3.17-1.18 3.17-1.18.62 1.59.23 2.76.11 3.05.74.8 1.18 1.83 1.18 3.08 0 4.41-2.69 5.38-5.25 5.67.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5Z" />
    </svg>
  )
}

export function RepositoriesPage() {
  const [selectedId, setSelectedId] = useState(repos[0].id)
  const selected = repos.find((r) => r.id === selectedId) ?? repos[0]

  return (
    <div className="mx-auto max-w-[1480px]">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cobalt">
            Your connected codebases
          </p>
          <h1 className="mt-3 text-[38px] font-bold leading-[1.05] tracking-[-0.03em] md:text-[40px]">
            Find your code. Know its state.
          </h1>
          <p className="mt-3 text-base text-obs-muted">
            Open a ready repository, check indexing, or connect something new.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-5">
          <p className="flex items-center gap-2.5 text-[14px] font-medium">
            <GitHubMark />
            <span className="size-2 rounded-full bg-success" aria-hidden />
            GitHub connected · Acme Engineering
          </p>
          <Link
            to="/app/repositories/connect"
            className="inline-flex h-12 items-center gap-2 rounded-control bg-cobalt px-5 text-[15px] font-semibold text-white transition-colors hover:bg-cobalt-hover"
          >
            <Plus className="size-4" aria-hidden />
            Connect repository
          </Link>
        </div>
      </div>

      <div className="mt-8 grid items-start gap-6 xl:grid-cols-[minmax(0,66fr)_minmax(0,34fr)]">
        <div className="space-y-6">
          <RepositoryBrowser selectedId={selected.id} onSelect={setSelectedId} />
          <NextStepGuide />
        </div>
        <Inspector repo={selected} />
      </div>

      <p className="mt-8 flex items-center gap-2 text-[13px] text-obs-muted">
        <ShieldCheck className="size-4" aria-hidden />
        Only repositories you have permission to access are listed.
      </p>
    </div>
  )
}
