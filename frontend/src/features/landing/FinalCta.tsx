import { FolderGit2 } from 'lucide-react'
import { Link } from 'react-router'
import { Reveal } from '@/components/domain/Reveal'
import { Button } from '@/components/ui/button'

export function FinalCta() {
  return (
    <section id="get-started" aria-labelledby="cta-title" className="scroll-mt-20 pb-24">
      <Reveal className="container-page">
        <div className="flex flex-col items-start justify-between gap-8 rounded-[20px] bg-gradient-to-br from-primary to-primary-hover px-8 py-14 text-white md:flex-row md:items-center md:px-16">
          <div className="max-w-2xl">
            <h2 id="cta-title" className="text-[32px] font-bold leading-[1.15] tracking-[-0.015em] md:text-[40px]">
              Your codebase, clearly understood.
            </h2>
            <p className="mt-4 text-lg text-blue-100">
              Explore your repository, get answers grounded in your code, and review changes with
              confidence.
            </p>
          </div>
          <Button asChild variant="inverse" size="lg" className="shrink-0">
            <Link to="/app/dashboard">
              <FolderGit2 aria-hidden />
              Get started
            </Link>
          </Button>
        </div>
      </Reveal>
    </section>
  )
}
