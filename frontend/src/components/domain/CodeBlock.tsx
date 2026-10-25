import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

const TOKEN =
  /("(?:[^"\\]|\\.)*")|(\/\/.*$)|(@[A-Z]\w*)|(\b(?:public|private|protected|void|if|else|throw|new|return|null|final|class|this|boolean|var|static|const|let|function|export|import|from|def)\b)|(\b[A-Z][A-Za-z0-9_]*\b)|(\b[a-z][A-Za-z0-9_]*)(?=\()/g

/** Minimal highlighter (Java-flavoured, tolerant of TS/Python) for illustrative snippets. */
function highlightJava(line: string): ReactNode[] {
  const out: ReactNode[] = []
  let last = 0
  let key = 0
  for (const m of line.matchAll(TOKEN)) {
    const index = m.index ?? 0
    if (index > last) out.push(line.slice(last, index))
    const cls = m[1] ? 'tok-str' : m[2] ? 'tok-com' : m[3] ? 'tok-ann' : m[4] ? 'tok-kw' : m[5] ? 'tok-type' : 'tok-fn'
    out.push(
      <span key={key++} className={cls}>
        {m[0]}
      </span>,
    )
    last = index + m[0].length
  }
  if (last < line.length) out.push(line.slice(last))
  return out
}

type CodeBlockProps = {
  code: string
  /** Line number shown for the first line. */
  startLine?: number
  /** Inclusive range, in real line numbers, marked as the cited source. */
  highlight?: [number, number]
  /** Lets a caller reveal the cited range later (animated sweep). */
  highlightOn?: boolean
  /** Colour of the cited range. */
  tone?: 'blue' | 'mint'
  label: string
  className?: string
}

export function CodeBlock({
  code,
  startLine = 1,
  highlight,
  highlightOn = true,
  tone = 'blue',
  label,
  className,
}: CodeBlockProps) {
  const mint = tone === 'mint'
  const lines = code.split('\n')
  return (
    <div
      role="region"
      aria-label={label}
      tabIndex={0}
      className={cn('overflow-x-auto bg-surface py-3 font-mono text-[12.5px] leading-[22px]', className)}
    >
      <table className="w-full border-collapse">
        <tbody>
          {lines.map((line, i) => {
            const n = startLine + i
            const cited = highlight && highlightOn ? n >= highlight[0] && n <= highlight[1] : false
            return (
              <tr
                key={n}
                className={cn('transition-colors duration-700', cited && (mint ? 'bg-mint/45' : 'bg-selected'))}
                style={cited ? { transitionDelay: `${(n - (highlight?.[0] ?? n)) * 90}ms` } : undefined}
              >
                <td
                  className={cn(
                    'w-12 select-none border-r py-0 pr-3 text-right align-top tabular-nums transition-colors duration-700',
                    cited
                      ? mint
                        ? 'border-[#2E8B66] text-[#1f6b4d]'
                        : 'border-primary text-primary'
                      : 'border-transparent text-slate-500',
                  )}
                  aria-hidden
                >
                  {n}
                </td>
                <td className="whitespace-pre py-0 pl-4 pr-6 text-foreground">
                  {highlightJava(line)}
                  {line === '' && ' '}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
