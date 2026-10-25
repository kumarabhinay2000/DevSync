import {
  Building2,
  ChevronsUpDown,
  ChevronUp,
  CreditCard,
  FolderGit2,
  Layers,
  LayoutDashboard,
  Plug,
  Settings,
  Sparkles,
  Users,
} from 'lucide-react'
import { NavLink } from 'react-router'
import { cn } from '@/lib/utils'

function ObservatoryMark() {
  return (
    <svg viewBox="0 0 32 32" className="size-8 shrink-0" role="img" aria-label="DevSync AI">
      <rect width="32" height="32" rx="8" fill="#275DFF" />
      <path
        d="M12 11l-5 5 5 5M20 11l5 5-5 5"
        fill="none"
        stroke="#fff"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M17.5 9l-3 14" stroke="#BAE4D0" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  )
}

const workspaceNav = [
  { to: '/app/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/app/repositories', label: 'Repositories', icon: FolderGit2 },
  { to: '/app/environments', label: 'Environments', icon: Layers },
  { to: '/app/assistant', label: 'AI Assistant', icon: Sparkles },
  { to: '/app/team', label: 'Team members', icon: Users },
  { to: '/app/billing', label: 'Billing & usage', icon: CreditCard },
]

const secondaryNav = [
  { to: '/app/integrations', label: 'Integrations', icon: Plug },
  { to: '/app/settings', label: 'Settings', icon: Settings },
]

function NavItem({
  to,
  label,
  icon: Icon,
  onNavigate,
}: {
  to: string
  label: string
  icon: typeof LayoutDashboard
  onNavigate?: () => void
}) {
  return (
    <li>
      <NavLink
        to={to}
        onClick={onNavigate}
        className={({ isActive }) =>
          cn(
            'group relative flex items-center gap-3 rounded-control px-3 py-2.5 text-[14.5px] font-medium transition-colors',
            isActive
              ? 'bg-cobalt text-white'
              : 'text-ink-muted hover:bg-ink-raised/60 hover:text-white',
          )
        }
      >
        <Icon className="size-[18px]" strokeWidth={1.8} aria-hidden />
        {label}
      </NavLink>
    </li>
  )
}

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex h-full w-full flex-col bg-ink px-4 pb-4 pt-5 text-white">
      <div className="flex items-center gap-2.5 px-1">
        <ObservatoryMark />
        <span className="text-[19px] font-bold tracking-tight">DevSync AI</span>
      </div>

      <button
        type="button"
        className="mt-6 flex w-full items-center justify-between rounded-control border border-ink-border bg-ink-raised px-3 py-2.5 text-left transition-colors hover:border-ink-muted/50"
        aria-label="Switch workspace, current workspace Acme Engineering"
      >
        <span className="flex min-w-0 items-center gap-2.5">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-ink text-mint">
            <Building2 className="size-4" aria-hidden />
          </span>
          <span className="truncate text-sm font-semibold">Acme Engineering</span>
        </span>
        <ChevronsUpDown className="size-4 shrink-0 text-ink-muted" aria-hidden />
      </button>

      <nav aria-label="Workspace" className="mt-8 flex-1">
        <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted">
          Your workspace
        </p>
        <ul className="mt-3 space-y-1">
          {workspaceNav.map((n) => (
            <NavItem key={n.to} {...n} onNavigate={onNavigate} />
          ))}
        </ul>
      </nav>

      <div className="border-t border-ink-border pt-4">
        <ul className="space-y-1">
          {secondaryNav.map((n) => (
            <NavItem key={n.to} {...n} onNavigate={onNavigate} />
          ))}
        </ul>

        <p className="mt-4 flex items-center gap-2 px-3 text-xs text-ink-muted">
          <span className="size-2 rounded-full bg-mint" aria-hidden />
          GitHub connected
        </p>

        <button
          type="button"
          aria-label="Account menu for Abhinay Kumar"
          className="mt-4 flex w-full items-center gap-3 rounded-control bg-ink-raised px-3 py-3 text-left transition-colors hover:bg-ink-border"
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-mint text-sm font-bold text-ink">
            AK
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold">Abhinay Kumar</span>
            <span className="block truncate text-xs text-ink-muted">Workspace admin</span>
          </span>
          <ChevronUp className="size-4 shrink-0 text-ink-muted" aria-hidden />
        </button>
      </div>
    </div>
  )
}
