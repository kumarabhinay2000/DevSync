import {
  ArrowUp,
  ChevronDown,
  CircleDot,
  Code2,
  FileText,
  Folder,
  FolderOpen,
  GitBranch,
  GitPullRequest,
  MessageSquare,
  Pause,
  Play,
  Search,
  Settings,
} from 'lucide-react'
import { BrandMark } from '@/components/domain/BrandMark'
import { CitationMarker, SourceRef } from '@/components/domain/Citation'
import { CodeBlock } from '@/components/domain/CodeBlock'
import { cn } from '@/lib/utils'
import { useHeroDemo } from './useHeroDemo'

const QUESTION = 'Where is project access checked?'

const nav = [
  { label: 'Chat', icon: MessageSquare, active: true },
  { label: 'Codebase', icon: Code2 },
  { label: 'Pull requests', icon: GitPullRequest },
  { label: 'Issues', icon: CircleDot },
  { label: 'Settings', icon: Settings },
]

const tree = [
  { name: 'api-service', depth: 0, folder: true, open: true },
  { name: 'src', depth: 1, folder: true },
  { name: 'tests', depth: 1, folder: true },
  { name: 'docs', depth: 1, folder: true },
  { name: 'README.md', depth: 1 },
  { name: 'pom.xml', depth: 1 },
]

const accessPolicy = `public void checkAccess(
    User user,
    Project project,
    ProjectAction action
) {
    if (user == null) {
        throw new AccessDeniedException(
            "User must be authenticated"
        );
    }

    if (!hasPermission(user, project, action)) {
        throw new AccessDeniedException(
            "Project access denied"
        );
    }
}`

const fade = (on: boolean) =>
  cn('transition-all duration-500 ease-out', on ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0')

/** Illustrative, self-playing product demo. Content is sample data, not a live repository. */
export function AppPreview() {
  const demo = useHeroDemo(QUESTION)
  const showUser = demo.reached('sent')
  const searching = demo.stage === 'searching'
  const showAnswer = demo.reached('answer')
  const showSource = demo.reached('source')
  const typing = demo.stage === 'typing'

  return (
    <figure aria-label="Illustrative DevSync AI chat view with a cited source file">
      <div className="overflow-hidden rounded-dialog border border-border bg-surface shadow-panel">
        {/* App header */}
        <div className="flex h-12 items-center justify-between border-b border-border bg-surface px-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex items-center gap-2 text-sm font-bold text-foreground">
              <BrandMark className="size-6" />
              <span className="hidden sm:inline">DevSync AI</span>
            </span>
            <span className="h-5 w-px bg-border" aria-hidden />
            <span className="flex items-center gap-1 truncate rounded-md border border-border bg-surface-muted px-2.5 py-1 font-mono text-xs font-medium text-foreground">
              devsync / api-service
              <ChevronDown className="size-3 text-muted-foreground" aria-hidden />
            </span>
            <span className="hidden items-center gap-1.5 rounded-md bg-selected px-2.5 py-1 font-mono text-xs font-medium text-primary md:flex">
              <GitBranch className="size-3" aria-hidden />
              main · a3f82c1
            </span>
          </div>
          <div className="flex items-center gap-3 text-muted-foreground">
            <span className="hidden items-center gap-2 rounded-md border border-border px-2.5 py-1 text-xs sm:flex">
              <Search className="size-3.5" aria-hidden />
              Search
            </span>
            <span className="flex size-7 items-center justify-center rounded-full bg-foreground text-[11px] font-semibold text-white">
              AK
            </span>
          </div>
        </div>

        <div className="flex">
          {/* Sidebar */}
          <aside className="hidden w-[176px] shrink-0 border-r border-border bg-surface-muted/60 p-3 lg:block">
            <ul className="space-y-0.5">
              {nav.map(({ label, icon: Icon, active }) => (
                <li
                  key={label}
                  className={cn(
                    'flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] font-medium',
                    active ? 'bg-selected text-primary' : 'text-muted-foreground',
                  )}
                >
                  <Icon className="size-4" aria-hidden />
                  {label}
                </li>
              ))}
            </ul>

            <p className="mb-2 mt-6 px-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Repository
            </p>
            <ul className="space-y-0.5 font-mono text-xs text-foreground">
              {tree.map((n) => (
                <li
                  key={n.name}
                  className="flex items-center gap-1.5 rounded px-2 py-1"
                  style={{ paddingLeft: 8 + n.depth * 14 }}
                >
                  {n.folder ? (
                    n.open ? (
                      <FolderOpen className="size-3.5 text-primary" aria-hidden />
                    ) : (
                      <Folder className="size-3.5 text-muted-foreground" aria-hidden />
                    )
                  ) : (
                    <FileText className="size-3.5 text-muted-foreground" aria-hidden />
                  )}
                  {n.name}
                </li>
              ))}
            </ul>
          </aside>

          {/* Main */}
          <div className="min-w-0 flex-1">
            <div className="space-y-4 p-5">
              <div className={cn('flex justify-end', fade(showUser))}>
                <p className="rounded-xl rounded-tr-sm bg-foreground px-4 py-2.5 text-[14px] text-white">
                  {QUESTION}
                </p>
              </div>

              <div className={cn('flex gap-3', fade(showUser))}>
                <BrandMark className="mt-0.5 size-7" />
                {/* Pending and complete states share one slot so the layout never jumps. */}
                <div className="relative min-w-0 flex-1">
                  <div
                    aria-hidden={!searching}
                    className={cn(
                      'absolute inset-x-0 top-0 flex items-center gap-3 transition-opacity duration-300',
                      searching ? 'opacity-100' : 'opacity-0',
                    )}
                  >
                    <span className="flex gap-1" aria-hidden>
                      {[0, 1, 2].map((i) => (
                        <span
                          key={i}
                          className="dot-bounce size-1.5 rounded-full bg-primary"
                          style={{ animationDelay: `${i * 160}ms` }}
                        />
                      ))}
                    </span>
                    <span className="font-mono text-[13px] text-muted-foreground">
                      Searching indexed code at a3f82c1…
                    </span>
                  </div>

                  <div className={cn('space-y-2', fade(showAnswer))}>
                    <p className="text-[15px] font-semibold text-foreground">
                      Project access is validated before repository operations.
                      <CitationMarker n={1} className={cn(showAnswer && 'animate-pop [animation-delay:350ms]')} />
                      <CitationMarker n={2} className={cn(showAnswer && 'animate-pop [animation-delay:500ms]')} />
                    </p>
                    <p className="text-[14px] leading-relaxed text-muted-foreground">
                      The access policy checks the current user’s permissions before allowing access
                      to repository resources.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Source viewer */}
            <div className={cn('mx-5 overflow-hidden rounded-control border border-border', fade(showSource))}>
              <div className="flex items-center justify-between border-b border-border bg-surface-muted px-3.5 py-2">
                <span className="flex items-center gap-2 font-mono text-[13px] font-semibold text-foreground">
                  <FileText className="size-3.5 text-muted-foreground" aria-hidden />
                  ProjectAccessPolicy.java
                </span>
                <span className="font-mono text-xs text-muted-foreground">Lines 24–40 · a3f82c1</span>
              </div>
              <CodeBlock
                label="ProjectAccessPolicy.java, lines 24 to 40"
                code={accessPolicy}
                startLine={24}
                highlight={[35, 39]}
                highlightOn={showSource}
                className="py-2"
              />
            </div>

            <div className={cn('grid gap-2 px-5 pt-4', fade(showSource))}>
              <SourceRef n={1} file="ProjectAccessPolicy.java" lines="L35–39" revision="main · a3f82c1" active />
              <SourceRef n={2} file="ProjectService.java" lines="L123–131" revision="main · a3f82c1" />
            </div>

            {/* Composer */}
            <div className="p-5">
              <div className="flex items-center justify-between rounded-control border border-border bg-surface px-4 py-2.5 shadow-soft">
                <span className={cn('text-sm', typing ? 'text-foreground' : 'text-muted-foreground')}>
                  {typing ? (
                    <>
                      {demo.typed}
                      <span className="caret ml-px inline-block h-4 w-px translate-y-0.5 bg-foreground" aria-hidden />
                    </>
                  ) : (
                    'Ask a question about your code…'
                  )}
                </span>
                <span
                  className={cn(
                    'flex size-8 items-center justify-center rounded-md bg-primary text-white transition-transform duration-300',
                    demo.stage === 'sent' && 'scale-90',
                  )}
                >
                  <ArrowUp className="size-4" aria-label="Send" />
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <figcaption className="mt-3 flex items-center justify-between text-[13px] text-muted-foreground">
        <span>Illustrative demo · sample data, not a live repository</span>
        {!demo.reduced && (
          <button
            type="button"
            onClick={demo.toggle}
            className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border bg-surface px-3 font-medium text-foreground transition-colors hover:bg-surface-muted"
            aria-label={demo.paused ? 'Play demo animation' : 'Pause demo animation'}
          >
            {demo.paused ? <Play className="size-3.5" aria-hidden /> : <Pause className="size-3.5" aria-hidden />}
            {demo.paused ? 'Play' : 'Pause'}
          </button>
        )}
      </figcaption>
    </figure>
  )
}
