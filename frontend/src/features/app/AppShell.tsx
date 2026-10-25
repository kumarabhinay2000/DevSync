import { CircleHelp, Menu, Moon, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router'
import { Sidebar } from './Sidebar'

const titles: Record<string, string> = {
  dashboard: 'Dashboard',
  repositories: 'Repositories',
  environments: 'Environments',
  assistant: 'AI Assistant',
  team: 'Team members',
  billing: 'Billing & usage',
  integrations: 'Integrations',
  settings: 'Settings',
}

export function AppShell() {
  const [drawer, setDrawer] = useState(false)
  const { pathname } = useLocation()
  const [, , section = '', sub] = pathname.split('/')
  const page = titles[section] ?? 'Dashboard'

  useEffect(() => {
    if (!drawer) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setDrawer(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [drawer])

  return (
    <div className="min-h-screen bg-ivory text-obs-text">
      <a
        href="#workspace-main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-control focus:bg-cobalt focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to content
      </a>

      {/* Permanent sidebar (desktop) */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[240px] lg:block">
        <Sidebar />
      </aside>

      {/* Drawer (tablet / mobile) */}
      {drawer && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation">
          <button
            type="button"
            className="absolute inset-0 bg-ink/60"
            aria-label="Close navigation"
            onClick={() => setDrawer(false)}
          />
          <div className="absolute inset-y-0 left-0 w-[260px] shadow-panel">
            <Sidebar onNavigate={() => setDrawer(false)} />
            <button
              type="button"
              onClick={() => setDrawer(false)}
              className="absolute right-3 top-4 flex size-9 items-center justify-center rounded-control text-ink-muted hover:text-white"
              aria-label="Close navigation"
              autoFocus
            >
              <X className="size-5" />
            </button>
          </div>
        </div>
      )}

      <div className="lg:pl-[240px]">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-obs-border bg-ivory/95 px-6 lg:px-8">
          <button
            type="button"
            className="flex size-10 items-center justify-center rounded-control border border-obs-border bg-white lg:hidden"
            aria-label="Open navigation"
            onClick={() => setDrawer(true)}
          >
            <Menu className="size-5" />
          </button>

          <nav aria-label="Breadcrumb" className="hidden text-sm text-obs-muted sm:block">
            Workspace <span aria-hidden>/</span>{' '}
            {sub ? (
              <>
                <Link to={`/app/${section}`} className="hover:text-obs-text">
                  {page}
                </Link>{' '}
                <span aria-hidden>/</span>{' '}
                <span
                  className={section === 'environments' ? 'font-semibold text-obs-text' : 'font-mono font-semibold text-obs-text'}
                  aria-current="page"
                >
                  {sub === 'connect'
                    ? 'Connect repository'
                    : section === 'environments'
                      ? sub.charAt(0).toUpperCase() + sub.slice(1)
                      : sub}
                </span>
              </>
            ) : (
              <span className="font-semibold text-obs-text" aria-current="page">
                {page}
              </span>
            )}
          </nav>

          <div className="ml-auto flex items-center gap-3">
            <button
              type="button"
              disabled
              className="flex size-10 items-center justify-center rounded-control border border-obs-border bg-white text-obs-muted disabled:opacity-60"
              aria-label="Theme (dark theme is not available yet)"
              title="Dark theme is not available yet"
            >
              <Moon className="size-[18px]" />
            </button>
            <button
              type="button"
              className="flex size-10 items-center justify-center rounded-control border border-obs-border bg-white text-obs-muted hover:text-obs-text"
              aria-label="Help"
            >
              <CircleHelp className="size-[18px]" />
            </button>
            <span
              className="flex size-10 items-center justify-center rounded-full bg-ink text-sm font-bold text-mint"
              role="img"
              aria-label="Abhinay Kumar"
            >
              AK
            </span>
          </div>
        </header>

        <main id="workspace-main" className="px-6 pb-16 pt-10 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
