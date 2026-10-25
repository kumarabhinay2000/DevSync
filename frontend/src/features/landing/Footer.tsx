import { ArrowRight, FolderGit2 } from 'lucide-react'
import { Link } from 'react-router'
import { Brand } from '@/components/domain/BrandMark'

const columns = [
  {
    title: 'Product',
    links: [
      { href: '#features', label: 'Features' },
      { href: '#how-it-works', label: 'How it works' },
      { href: '#integrations', label: 'Integrations' },
      { href: '#faq', label: 'FAQ' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { href: '#documentation', label: 'Documentation' },
      { href: '#privacy', label: 'Privacy' },
      { href: '#contact', label: 'Contact' },
    ],
  },
]

const principles = ['Source-linked answers', 'Controlled tool access', 'Human-reviewed changes']

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-ink text-white">
      {/* Fine mint line echoing the app's technical connectors */}
      <div aria-hidden className="h-px bg-gradient-to-r from-transparent via-mint/60 to-transparent" />

      <div className="container-page grid gap-14 pb-12 pt-16 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.2fr)]">
        <div>
          <Brand tone="dark" />
          <p className="mt-4 text-lg font-semibold text-mint">Understand. Verify. Build.</p>
          <p className="mt-3 max-w-xs text-[15px] leading-relaxed text-ink-muted">
            AI-assisted repository understanding, with answers you can trace to the exact file,
            line and revision.
          </p>
        </div>

        {columns.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted">
              {col.title}
            </h2>
            <ul className="mt-5 space-y-3">
              {col.links.map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    className="text-[15px] font-medium text-white/90 transition-colors hover:text-mint"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        ))}

        <div>
          <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted">
            Get started
          </h2>
          <p className="mt-5 text-[15px] leading-relaxed text-ink-muted">
            Connect an authorized repository and ask your first question.
          </p>
          <Link
            to="/app/dashboard"
            className="mt-5 inline-flex h-11 items-center gap-2 rounded-control bg-mint px-5 text-[15px] font-semibold text-ink transition-colors hover:bg-white"
          >
            <FolderGit2 className="size-4" aria-hidden />
            Connect repository
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      </div>

      <div className="border-t border-ink-border">
        <div className="container-page flex flex-col gap-4 py-7 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-ink-muted">© 2026 DevSync AI</p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-muted">
            {principles.map((p) => (
              <li key={p} className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-mint" aria-hidden />
                {p}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  )
}
