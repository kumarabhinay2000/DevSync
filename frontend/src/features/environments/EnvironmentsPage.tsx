import { Info, Link2, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { ConfigList } from './ConfigList'
import { EnvInspector } from './EnvInspector'
import { JourneyPanel } from './JourneyPanel'
import { environments, type EnvId } from './data'

export function EnvironmentsPage() {
  const [selectedId, setSelectedId] = useState<EnvId>('development')
  const [guideOpen, setGuideOpen] = useState(false)
  const selected = environments.find((e) => e.id === selectedId) ?? environments[0]

  return (
    <div className="mx-auto max-w-[1480px]">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cobalt">Workspace environments</p>
          <h1 className="mt-3 text-[38px] font-bold leading-[1.05] tracking-[-0.03em] md:text-[40px]">
            A clear space for every stage.
          </h1>
          <p className="mt-3 text-base text-obs-muted">
            Map your repositories to development, staging, and production contexts.
          </p>
        </div>

        <button
          type="button"
          aria-expanded={guideOpen}
          aria-controls="env-guide"
          onClick={() => setGuideOpen((o) => !o)}
          className="inline-flex h-11 items-center gap-2 rounded-control border border-obs-border bg-white px-4 text-[15px] font-semibold transition-colors hover:bg-obs-selected"
        >
          <Info className="size-4" aria-hidden />
          Environment guide
        </button>
      </div>

      <div className="mt-6 flex items-center gap-3 rounded-xl border border-cobalt/20 bg-obs-selected px-5 py-3.5 text-[15px]">
        <Link2 className="size-5 shrink-0 text-cobalt" aria-hidden />
        <p>
          <span className="font-semibold">Configuration overview</span> · Runtime connections are not set up.
        </p>
      </div>

      {guideOpen && (
        <dl
          id="env-guide"
          className="mt-4 grid gap-4 rounded-xl border border-obs-border bg-white p-5 text-[14.5px] md:grid-cols-3"
        >
          {[
            ['Development', 'Where changes are built and explored.'],
            ['Staging', 'Where changes are validated before release.'],
            ['Production', 'The live-service context. Releases here need authorization.'],
          ].map(([t, d]) => (
            <div key={t}>
              <dt className="font-bold">{t}</dt>
              <dd className="mt-0.5 text-obs-muted">{d}</dd>
            </div>
          ))}
        </dl>
      )}

      <div className="mt-6">
        <JourneyPanel selectedId={selectedId} onSelect={setSelectedId} />
      </div>

      <div className="mt-6 grid items-start gap-6 xl:grid-cols-[minmax(0,65fr)_minmax(0,35fr)]">
        <ConfigList selectedId={selectedId} onSelect={setSelectedId} />
        <EnvInspector env={selected} />
      </div>

      <section
        aria-labelledby="note-title"
        className="mt-6 flex items-start gap-3.5 rounded-xl bg-obs-selected/70 px-5 py-4"
      >
        <ShieldCheck className="mt-0.5 size-5 shrink-0 text-cobalt" aria-hidden />
        <div>
          <h2 id="note-title" className="text-[16px] font-bold">
            Configuration is not deployment
          </h2>
          <p className="mt-0.5 text-[14.5px] text-obs-muted">
            This page describes environment mappings. It does not start services or publish changes.
          </p>
        </div>
      </section>
    </div>
  )
}
