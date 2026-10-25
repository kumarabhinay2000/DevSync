import { ArrowRight, FolderGit2 } from 'lucide-react'
import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import { AppPreview } from './AppPreview'

const rise = (ms: number) => ({ animationDelay: `${ms}ms` })

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden">
      {/* Quiet dotted grid, fades out toward the bottom */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 [background-image:radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] [mask-image:linear-gradient(to_bottom,black,transparent_75%)] opacity-60"
      />
      <div className="container-page relative grid items-center gap-16 py-20 lg:grid-cols-2 lg:py-24">
        <div>
          <span
            className="animate-rise inline-flex items-center gap-2 rounded-full border border-primary/20 bg-selected px-3.5 py-1.5 text-[13px] font-semibold text-primary"
            style={rise(0)}
          >
            <span className="relative flex size-2" aria-hidden>
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-50 motion-reduce:animate-none" />
              <span className="relative inline-flex size-2 rounded-full bg-primary" />
            </span>
            AI-powered code intelligence
          </span>

          <h1
            className="animate-rise mt-7 text-[44px] font-bold leading-[1.05] tracking-[-0.02em] text-foreground sm:text-[56px] xl:whitespace-nowrap"
            style={rise(120)}
          >
            Understand your code.
            <br />
            <span className="text-primary">Build with confidence.</span>
          </h1>

          <p className="animate-rise mt-6 max-w-[34rem] text-lg leading-8 text-muted-foreground" style={rise(260)}>
            Explore your repository, get answers grounded in your code, and review changes with
            confidence.
          </p>

          <div className="animate-rise mt-9 flex flex-wrap items-center gap-3" style={rise(380)}>
            <Button asChild size="lg">
              <Link to="/app/dashboard">
                <FolderGit2 aria-hidden />
                Connect repository
              </Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <a href="#how-it-works">
                Explore the workflow
                <ArrowRight aria-hidden />
              </a>
            </Button>
          </div>

          <p className="animate-rise mt-8 text-sm font-medium text-muted-foreground" style={rise(500)}>
            Source-linked answers. Controlled tool access. Human-reviewed changes.
          </p>
        </div>

        <div className="animate-rise" style={rise(250)}>
          <AppPreview />
        </div>
      </div>
    </section>
  )
}
