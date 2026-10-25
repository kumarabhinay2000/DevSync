import { ContextDetail } from './ContextDetail'
import { Faq } from './Faq'
import { Features } from './Features'
import { FinalCta } from './FinalCta'
import { Footer } from './Footer'
import { Header } from './Header'
import { Hero } from './Hero'
import { Integrations } from './Integrations'
import { Trust } from './Trust'
import { Workflow } from './Workflow'

export function LandingPage() {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-control focus:bg-primary focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to content
      </a>
      <Header />
      <main id="main">
        <Hero />
        <Workflow />
        <Features />
        <ContextDetail />
        <Trust />
        <Integrations />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
    </>
  )
}
