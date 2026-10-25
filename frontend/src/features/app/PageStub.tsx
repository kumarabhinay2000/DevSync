import { Link } from 'react-router'

/** Destination reserved in the sidebar; the page itself is designed in a later step. */
export function PageStub({ title, page }: { title: string; page: string }) {
  return (
    <div className="max-w-2xl">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cobalt">Page {page}</p>
      <h1 className="mt-3 text-[36px] font-bold leading-tight tracking-[-0.025em]">{title}</h1>
      <p className="mt-4 text-base text-obs-muted">
        This page is not built yet. Navigation, workspace context and layout are in place; its
        content comes in a later step.
      </p>
      <Link
        to="/app/dashboard"
        className="mt-8 inline-flex h-11 items-center rounded-control border border-obs-border bg-white px-5 text-sm font-semibold hover:bg-obs-selected"
      >
        Back to Dashboard
      </Link>
    </div>
  )
}
