import { Link } from 'react-router'
import { Brand } from '@/components/domain/BrandMark'
import { Button } from '@/components/ui/button'

const links = [
  { href: '#features', label: 'Features' },
  { href: '#how-it-works', label: 'How it works' },
  { href: '#integrations', label: 'Integrations' },
  { href: '#faq', label: 'FAQ' },
]

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-surface">
      <div className="container-page flex h-[72px] items-center justify-between">
        <a href="#top" aria-label="DevSync AI home">
          <Brand />
        </a>

        <nav aria-label="Primary" className="hidden items-center gap-10 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-[15px] font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button asChild variant="link" size="sm" className="hidden sm:inline-flex">
            <Link to="/app/dashboard">Sign in</Link>
          </Button>
          <Button asChild size="sm">
            <Link to="/app/dashboard">Get started</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
