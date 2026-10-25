import {
  ArrowRight,
  FileText,
  FolderGit2,
  GitBranch,
  GitCommitHorizontal,
  Info,
  Lock,
  Plug,
  Settings2,
  ShieldCheck,
} from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { Link, useParams } from 'react-router'
import { NotConnected } from '../ConfigList'
import { environments, type Environment, type EnvId } from '../data'
import { envIcon } from '../envIcons'

// Illustrative, non-secret values only. Nothing here is applied anywhere.
const exampleConfig: Record<EnvId, { name: string; value: string; type: string }[]> = {
  development: [
    { name: 'APP_ENV', value: 'development', type: 'Text' },
    { name: 'LOG_LEVEL', value: 'INFO', type: 'Text' },
    { name: 'FEATURE_AI_ASSISTANT', value: 'false', type: 'Boolean' },
    { name: 'VECTOR_PROVIDER', value: 'PGVECTOR', type: 'Text' },
  ],
  staging: [
    { name: 'APP_ENV', value: 'staging', type: 'Text' },
    { name: 'LOG_LEVEL', value: 'INFO', type: 'Text' },
    { name: 'FEATURE_AI_ASSISTANT', value: 'false', type: 'Boolean' },
    { name: 'VECTOR_PROVIDER', value: 'PGVECTOR', type: 'Text' },
  ],
  production: [
    { name: 'APP_ENV', value: 'production', type: 'Text' },
    { name: 'LOG_LEVEL', value: 'WARN', type: 'Text' },
    { name: 'FEATURE_AI_ASSISTANT', value: 'false', type: 'Boolean' },
    { name: 'VECTOR_PROVIDER', value: 'PGVECTOR', type: 'Text' },
  ],
}

function NoRuntimeIllustration() {
  return (
    <svg viewBox="0 0 260 130" className="mx-auto h-[120px] w-auto" role="img" aria-label="Server and plug, disconnected">
      <g fill="none" stroke="#BAE4D0" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        {/* server */}
        <rect x="158" y="18" width="82" height="76" rx="10" />
        <line x1="172" y1="42" x2="226" y2="42" />
        <line x1="172" y1="62" x2="226" y2="62" />
        <circle cx="174" cy="78" r="1.5" fill="#BAE4D0" />
        <circle cx="184" cy="78" r="1.5" fill="#BAE4D0" />
        {/* plug */}
        <rect x="38" y="48" width="44" height="32" rx="7" />
        <line x1="82" y1="58" x2="98" y2="58" />
        <line x1="82" y1="70" x2="98" y2="70" />
        <path d="M38 64C20 64 12 78 8 100" />
      </g>
      {/* gap */}
      <line x1="108" y1="64" x2="148" y2="64" stroke="#5B6B7A" strokeWidth="2.5" strokeDasharray="4 6" strokeLinecap="round" />
      <g stroke="#BAE4D0" strokeWidth="3" strokeLinecap="round">
        <line x1="122" y1="56" x2="134" y2="72" />
        <line x1="134" y1="56" x2="122" y2="72" />
      </g>
    </svg>
  )
}

function KV({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <dt className="flex items-center gap-2.5 text-[14.5px] text-obs-muted">
        {icon}
        {label}
      </dt>
      <dd className="text-right text-[14.5px] font-semibold">{children}</dd>
    </div>
  )
}

function Arrow() {
  return (
    <svg aria-hidden width="48" height="14" viewBox="0 0 48 14" className="hidden shrink-0 sm:block">
      <line x1="0" y1="7" x2="40" y2="7" stroke="#B7C0BC" strokeWidth="2" />
      <path d="M36 2l7 5-7 5" fill="none" stroke="#64706D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function DetailView({ env }: { env: Environment }) {
  const [guideOpen, setGuideOpen] = useState(false)
  const { Icon } = envIcon[env.id]
  const config = exampleConfig[env.id]

  const steps = [
    { icon: FolderGit2, title: 'Verify repository access', body: `Confirm access to ${env.repo}.` },
    { icon: GitBranch, title: 'Check the branch mapping', body: `Validate ${env.branch} before linking a runtime.` },
    { icon: Plug, title: 'Review integration support', body: 'Use an approved connection when available.' },
  ]

  return (
    <div className="mx-auto max-w-[1480px]">
      <Link to="/app/environments" className="text-[15px] font-semibold text-cobalt hover:underline">
        ← All environments
      </Link>

      <div className="mt-5 flex flex-wrap items-start justify-between gap-6">
        <div className="flex items-start gap-5">
          <span className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-obs-selected text-cobalt">
            <Icon className="size-8" strokeWidth={1.7} aria-hidden />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cobalt">Environment details</p>
            <div className="mt-2 flex flex-wrap items-center gap-4">
              <h1 className="text-[38px] font-bold leading-none tracking-[-0.03em] md:text-[40px]">{env.name}</h1>
              <NotConnected />
            </div>
            <p className="mt-3 text-base text-obs-muted">
              Inspect this environment’s mapping and non-secret configuration.
            </p>
          </div>
        </div>

        <button
          type="button"
          aria-expanded={guideOpen}
          aria-controls="config-guide"
          onClick={() => setGuideOpen((o) => !o)}
          className="inline-flex h-11 items-center gap-2 rounded-control border border-obs-border bg-white px-4 text-[15px] font-semibold transition-colors hover:bg-obs-selected"
        >
          <Info className="size-4" aria-hidden />
          Configuration guide
        </button>
      </div>

      {guideOpen && (
        <p id="config-guide" className="mt-4 rounded-xl border border-obs-border bg-white px-5 py-4 text-[14.5px] text-obs-muted">
          This page shows which repository and branch an environment is mapped to, and example non-secret
          configuration. It is read-only: nothing here is applied, and no service is started or changed.
        </p>
      )}

      <nav aria-label="Environment sections" className="mt-7 flex gap-8 border-b border-obs-border">
        <a href="#mapping" aria-current="page" className="-mb-px border-b-[3px] border-cobalt pb-3 text-[15.5px] font-semibold">
          Overview
        </a>
        <a href="#config" className="pb-3 text-[15.5px] font-medium text-obs-muted hover:text-obs-text">
          Configuration
        </a>
        <a href="#access" className="pb-3 text-[15.5px] font-medium text-obs-muted hover:text-obs-text">
          Access
        </a>
      </nav>

      {/* Upper row */}
      <div className="mt-6 grid items-stretch gap-6 xl:grid-cols-[minmax(0,62fr)_minmax(0,38fr)]">
        <section
          id="mapping"
          aria-labelledby="mapping-title"
          className="scroll-mt-24 rounded-2xl border border-obs-border bg-white p-6 shadow-soft"
        >
          <h2 id="mapping-title" className="text-[24px] font-bold tracking-[-0.02em]">
            Repository mapping
          </h2>
          <p className="mt-1 text-[15px] text-obs-muted">Source repository and branch mapped to this environment.</p>

          <div className="mt-6 flex flex-col items-stretch gap-3 rounded-2xl bg-ivory p-5 sm:flex-row sm:items-center">
            <div className="flex flex-1 items-center gap-4 rounded-xl bg-white px-4 py-4 ring-1 ring-obs-border">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-obs-selected text-cobalt">
                <FolderGit2 className="size-6" aria-hidden />
              </span>
              <span className="min-w-0">
                <span className="block truncate font-mono text-[16px] font-bold">{env.repo}</span>
                <span className="block text-[13px] text-obs-muted">Example repository</span>
              </span>
            </div>

            <Arrow />

            <div className="flex shrink-0 flex-col items-center gap-1.5 px-1">
              <span className="text-[12px] font-semibold uppercase tracking-[0.1em] text-obs-muted">Branch mapping</span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-obs-border bg-white px-3.5 py-1.5 font-mono text-[14px] font-semibold">
                <GitBranch className="size-4 text-obs-muted" aria-hidden />
                {env.branch}
              </span>
            </div>

            <Arrow />

            <div className="flex flex-1 items-center gap-4 rounded-xl bg-white px-4 py-4 ring-1 ring-obs-border">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-mint text-ink">
                <Icon className="size-6" aria-hidden />
              </span>
              <span>
                <span className="block text-[16px] font-bold">{env.name}</span>
                <span className="block text-[13px] text-obs-muted">This environment</span>
              </span>
            </div>
          </div>

          <p className="mt-4 flex items-center gap-2.5 rounded-control border border-cobalt/20 bg-obs-selected px-4 py-2.5 text-[14px]">
            <Info className="size-4 shrink-0 text-cobalt" aria-hidden />
            Example mapping · branch availability not verified.
          </p>

          <hr className="my-5 border-obs-border" />

          <dl className="divide-y divide-obs-border/70">
            <KV icon={<FolderGit2 className="size-4" aria-hidden />} label="Repository">
              <span className="font-mono">acme / {env.repo}</span>
            </KV>
            <KV icon={<GitBranch className="size-4" aria-hidden />} label="Branch pattern">
              <span className="font-mono">{env.branch}</span>
            </KV>
            <KV icon={<GitCommitHorizontal className="size-4" aria-hidden />} label="Verified commit">
              <span className="font-medium text-obs-muted">Not available</span>
            </KV>
            <KV icon={<FileText className="size-4" aria-hidden />} label="Configuration state">
              <span className="rounded-full border border-obs-border bg-ivory px-3 py-0.5 text-[13.5px]">
                Example only
              </span>
            </KV>
          </dl>

          <p className="mt-4 text-[14px] text-obs-muted">An environment mapping does not create a deployment.</p>
        </section>

        <section
          aria-labelledby="runtime-title"
          className="flex flex-col rounded-2xl bg-ink p-6 text-white shadow-panel"
        >
          <h2 id="runtime-title" className="text-[24px] font-bold tracking-[-0.02em]">
            Runtime connection
          </h2>
          <p className="mt-1 text-[15px] text-ink-muted">Live environment status and integration details.</p>

          <div className="mt-6 rounded-xl bg-ink-raised px-5 py-6 text-center">
            <NoRuntimeIllustration />
            <p className="mt-4 text-[19px] font-bold">No runtime connected</p>
            <p className="mx-auto mt-1.5 max-w-sm text-[14.5px] leading-relaxed text-ink-muted">
              Live status and deployed revisions are unavailable until an approved runtime integration is
              configured.
            </p>
          </div>

          <dl className="mt-5 divide-y divide-ink-border">
            <div className="flex items-center justify-between py-3">
              <dt className="text-[14.5px] text-ink-muted">Runtime status</dt>
              <dd className="text-[14.5px] font-semibold">Not available</dd>
            </div>
            <div className="flex items-center justify-between py-3">
              <dt className="text-[14.5px] text-ink-muted">Last verified revision</dt>
              <dd className="text-[14.5px] font-semibold">Not available</dd>
            </div>
          </dl>

          <div className="mt-auto pt-5">
            <button
              type="button"
              disabled
              aria-describedby="runtime-reason"
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-control border border-ink-border bg-ink-raised text-[15.5px] font-semibold text-ink-muted"
            >
              <Lock className="size-4" aria-hidden />
              Connect runtime
            </button>
            <p id="runtime-reason" className="mt-2 text-center text-[13.5px] text-ink-muted">
              Integration support required
            </p>
            <p className="mt-3 text-center">
              <Link to="/app/integrations" className="text-[15px] font-semibold text-mint hover:underline">
                View integration requirements →
              </Link>
            </p>
          </div>
        </section>
      </div>

      {/* Lower row */}
      <div className="mt-6 grid items-stretch gap-6 xl:grid-cols-[minmax(0,62fr)_minmax(0,38fr)]">
        <section
          id="config"
          aria-labelledby="config-title"
          className="scroll-mt-24 rounded-2xl border border-obs-border bg-white p-6 shadow-soft"
        >
          <h2 id="config-title" className="text-[24px] font-bold tracking-[-0.02em]">
            Non-secret configuration
          </h2>
          <p className="mt-1 text-[15px] text-obs-muted">Illustrative values for review — not applied settings.</p>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[460px] border-collapse text-left">
              <thead>
                <tr className="border-b border-obs-border text-[12px] font-semibold uppercase tracking-[0.1em] text-obs-muted">
                  <th scope="col" className="pb-3 pr-4 font-semibold">Variable</th>
                  <th scope="col" className="pb-3 pr-4 font-semibold">Example value</th>
                  <th scope="col" className="pb-3 font-semibold">Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-obs-border">
                {config.map((c) => (
                  <tr key={c.name}>
                    <td className="py-3.5 pr-4 font-mono text-[14.5px] font-bold">{c.name}</td>
                    <td className="py-3.5 pr-4">
                      <span className="rounded-md border border-obs-border bg-ivory px-2.5 py-1 font-mono text-[13.5px]">
                        {c.value}
                      </span>
                    </td>
                    <td className="py-3.5 text-[14.5px] text-obs-muted">{c.type}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-4 flex items-center gap-2 text-[13.5px] text-obs-muted">
            <Lock className="size-4" aria-hidden />
            Secrets are referenced separately and never displayed here.
          </p>
        </section>

        <section
          aria-labelledby="next-title"
          className="flex flex-col rounded-2xl border border-obs-border bg-white p-6 shadow-soft"
        >
          <h2 id="next-title" className="text-[24px] font-bold tracking-[-0.02em]">
            What to check next
          </h2>
          <p className="mt-1 text-[15px] text-obs-muted">Complete these steps before connecting a runtime.</p>

          <ol className="mt-5 divide-y divide-obs-border">
            {steps.map((s, i) => (
              <li key={s.title} className="flex items-center gap-4 py-4">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-ink text-[14px] font-bold text-mint">
                  {i + 1}
                </span>
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-ivory text-cobalt">
                  <s.icon className="size-5" aria-hidden />
                </span>
                <span>
                  <span className="block text-[15.5px] font-bold">{s.title}</span>
                  <span className="block text-[14px] text-obs-muted">{s.body}</span>
                </span>
              </li>
            ))}
          </ol>

          <p className="mt-auto flex items-center gap-2 rounded-control bg-ivory px-3.5 py-2.5 text-[13.5px] text-obs-muted">
            <Settings2 className="size-4 shrink-0" aria-hidden />
            No services are started from this page.
          </p>
        </section>
      </div>

      {/* Access strip */}
      <section
        id="access"
        aria-labelledby="access-title"
        className="mt-6 flex scroll-mt-24 flex-wrap items-center justify-between gap-4 rounded-xl bg-obs-selected/70 px-5 py-4"
      >
        <div className="flex items-start gap-3.5">
          <ShieldCheck className="mt-0.5 size-5 shrink-0 text-cobalt" aria-hidden />
          <div>
            <h2 id="access-title" className="text-[16px] font-bold">
              Access and change control
            </h2>
            <p className="mt-0.5 text-[14.5px] text-obs-muted">
              Environment changes require explicit workspace permissions. Repository source access is checked
              separately.
            </p>
          </div>
        </div>
        <span className="rounded-full border border-obs-border bg-white px-3.5 py-1 text-[13.5px] font-semibold text-obs-muted">
          Read-only example
        </span>
      </section>
    </div>
  )
}

export function EnvironmentDetailPage() {
  const { envId } = useParams()
  const env = environments.find((e) => e.id === envId)

  if (!env) {
    return (
      <div className="max-w-xl">
        <h1 className="text-[32px] font-bold tracking-[-0.02em]">Environment unavailable</h1>
        <p className="mt-3 text-base text-obs-muted">
          This environment does not exist or you do not have access to it.
        </p>
        <Link
          to="/app/environments"
          className="mt-6 inline-flex h-11 items-center gap-2 rounded-control border border-obs-border bg-white px-5 text-sm font-semibold hover:bg-obs-selected"
        >
          <ArrowRight className="size-4 rotate-180" aria-hidden />
          All environments
        </Link>
      </div>
    )
  }

  return <DetailView key={env.id} env={env} />
}
