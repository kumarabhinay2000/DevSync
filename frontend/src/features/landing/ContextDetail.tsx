import { Check, FileText } from 'lucide-react'
import { CitationMarker, SourceRef } from '@/components/domain/Citation'
import { CodeBlock } from '@/components/domain/CodeBlock'
import { Reveal } from '@/components/domain/Reveal'

const points = [
  {
    title: 'Search code and documentation',
    body: 'Find relevant logic, configuration, and dependencies across your repository.',
  },
  {
    title: 'Follow exact file and revision references',
    body: 'See precise source links, line numbers, and commits for every answer.',
  },
  {
    title: 'Keep every action within project permissions',
    body: 'Repository access and tool actions follow explicit permissions.',
  },
]

const addMember = `@Transactional
public ProjectMember addMember(
    UUID projectId,
    UUID userId,
    ProjectRole role
) {
    Project project = projectRepository.getById(projectId);
    User actor = currentUser.require();

    accessPolicy.checkAccess(
        actor, project, ProjectAction.MANAGE_MEMBERS
    );

    if (memberRepository.exists(projectId, userId)) {
        throw new ConflictException(
            "User is already a project member"
        );
    }

    ProjectMember member = memberRepository.save(
        ProjectMember.of(project, userId, role)
    );
    audit.record("project.member.added", member.getId());
    return member;
}`

export function ContextDetail() {
  return (
    <section
      aria-labelledby="context-title"
      className="border-y border-border bg-surface-muted py-24"
    >
      <div className="container-page grid items-center gap-16 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <Reveal>
          <h2
            id="context-title"
            className="text-[32px] font-bold leading-[1.15] tracking-[-0.015em] text-foreground md:text-[40px]"
          >
            The right context.
            <br />
            Before the next change.
          </h2>
          <p className="mt-5 max-w-[34rem] text-lg text-muted-foreground">
            Get answers grounded in your actual code, with clear references and the context you need
            to make decisions.
          </p>

          <ul className="mt-10 space-y-7">
            {points.map((p) => (
              <li key={p.title} className="flex gap-4">
                <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-white">
                  <Check className="size-3.5" strokeWidth={3} aria-hidden />
                </span>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{p.title}</h3>
                  <p className="mt-1 text-base text-muted-foreground">{p.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={150}>
        <figure
          aria-label="Illustrative chat answer with the cited ProjectService source"
          className="overflow-hidden rounded-dialog border border-border bg-surface shadow-panel"
        >
          <div className="space-y-4 border-b border-border p-6">
            <div className="flex justify-end">
              <p className="rounded-xl rounded-tr-sm bg-foreground px-4 py-2.5 text-[14px] text-white">
                What happens when a user is added to a project?
              </p>
            </div>
            <p className="text-[15px] leading-relaxed text-foreground">
              <code className="rounded bg-surface-muted px-1.5 py-0.5 font-mono text-[13px] font-medium">
                ProjectService.addMember()
              </code>{' '}
              validates the user’s permission before creating the project member record.
              <CitationMarker n={1} />
            </p>
          </div>

          <div className="flex items-center justify-between border-b border-border bg-surface-muted px-4 py-2.5">
            <span className="flex items-center gap-2 font-mono text-[13px] font-semibold text-foreground">
              <FileText className="size-3.5 text-muted-foreground" aria-hidden />
              ProjectService.java
            </span>
            <span className="font-mono text-xs text-muted-foreground">Illustrative source</span>
          </div>
          <CodeBlock
            label="ProjectService.java, lines 123 to 147"
            code={addMember}
            startLine={123}
            highlight={[132, 132]}
          />

          <div className="border-t border-border p-4">
            <SourceRef
              n={1}
              file="ProjectService.java"
              lines="Lines 123–147"
              revision="main · a3f82c1"
              active
            />
          </div>
        </figure>
        </Reveal>
      </div>
    </section>
  )
}
