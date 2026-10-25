import { ChevronDown, ChevronRight, FileText, Folder, FolderOpen } from 'lucide-react'
import { useState } from 'react'
import { CodeBlock } from '@/components/domain/CodeBlock'
import { cn } from '@/lib/utils'
import { previews, type FileNode } from './detailData'

function allFolderPaths(node: FileNode, prefix = ''): string[] {
  const path = `${prefix}/${node.name}`
  if (!node.children) return []
  return [path, ...node.children.flatMap((c) => allFolderPaths(c, path))]
}

function Branch({
  node,
  path,
  depth,
  open,
  toggle,
  selected,
  select,
}: {
  node: FileNode
  path: string
  depth: number
  open: Set<string>
  toggle: (p: string) => void
  selected: string
  select: (n: string) => void
}) {
  const isFile = !node.children && /\.\w+$/.test(node.name)
  const isFolder = !isFile
  const hasChildren = !!node.children?.length
  const isOpen = hasChildren && open.has(path)
  const isSelected = !isFolder && node.name === selected

  return (
    <li>
      <button
        type="button"
        aria-expanded={hasChildren ? isOpen : undefined}
        aria-current={isSelected ? 'true' : undefined}
        onClick={() => (isFolder ? hasChildren && toggle(path) : select(node.name))}
        className={cn(
          'flex w-full items-center gap-2 rounded-md py-1.5 pr-3 text-left font-mono text-[14px] transition-colors',
          isSelected ? 'bg-obs-selected font-semibold text-cobalt' : 'hover:bg-ivory',
        )}
        style={{ paddingLeft: depth === 0 ? 6 : 6 }}
      >
        {hasChildren ? (
          isOpen ? (
            <ChevronDown className="size-4 shrink-0 text-obs-muted" aria-hidden />
          ) : (
            <ChevronRight className="size-4 shrink-0 text-obs-muted" aria-hidden />
          )
        ) : (
          <span className="size-4 shrink-0" aria-hidden />
        )}
        {isFolder ? (
          isOpen ? (
            <FolderOpen className="size-4 shrink-0 text-cobalt" aria-hidden />
          ) : (
            <Folder className="size-4 shrink-0 text-cobalt" aria-hidden />
          )
        ) : (
          <FileText className={cn('size-4 shrink-0', isSelected ? 'text-cobalt' : 'text-obs-muted')} aria-hidden />
        )}
        <span className="truncate">{node.name}</span>
      </button>

      {hasChildren && isOpen && (
        <ul className="ml-[15px] border-l border-obs-border pl-3">
          {node.children!.map((c) => (
            <Branch
              key={c.name}
              node={c}
              path={`${path}/${c.name}`}
              depth={depth + 1}
              open={open}
              toggle={toggle}
              selected={selected}
              select={select}
            />
          ))}
        </ul>
      )}
    </li>
  )
}

export function StructurePanel({ tree, initialFile }: { tree: FileNode; initialFile: string }) {
  const [open, setOpen] = useState(() => new Set(allFolderPaths(tree)))
  const [selected, setSelected] = useState(initialFile)
  const code = previews[selected]

  const toggle = (p: string) =>
    setOpen((prev) => {
      const next = new Set(prev)
      if (next.has(p)) next.delete(p)
      else next.add(p)
      return next
    })

  return (
    <section
      id="structure"
      aria-labelledby="structure-title"
      className="scroll-mt-24 rounded-2xl border border-obs-border bg-white p-6 shadow-soft"
    >
      <div className="flex items-center justify-between">
        <h2 id="structure-title" className="text-[24px] font-bold tracking-[-0.02em]">
          Repository structure
        </h2>
        <span className="rounded-full bg-mint/60 px-3 py-1 text-[12.5px] font-semibold text-ink">Preview</span>
      </div>

      <ul className="mt-4 max-h-[400px] overflow-auto rounded-xl bg-ivory p-3" aria-label="Illustrative file tree">
        <Branch
          node={tree}
          path={`/${tree.name}`}
          depth={0}
          open={open}
          toggle={toggle}
          selected={selected}
          select={setSelected}
        />
      </ul>

      <div className="mt-5 overflow-hidden rounded-xl border border-obs-border">
        <div className="flex items-center justify-between gap-3 border-b border-obs-border bg-ivory px-4 py-2.5">
          <span className="flex min-w-0 items-center gap-2 truncate font-mono text-[14px] font-bold">
            <FileText className="size-4 shrink-0 text-obs-muted" aria-hidden />
            {selected}
          </span>
          <span className="shrink-0 text-[12.5px] text-obs-muted">Illustrative source preview</span>
        </div>
        {code ? (
          <CodeBlock label={`${selected}, illustrative preview`} code={code} className="text-[13.5px]" />
        ) : (
          <p className="px-4 py-8 text-center text-[14px] text-obs-muted">
            An illustrative preview is not available for this file.
          </p>
        )}
      </div>
    </section>
  )
}
