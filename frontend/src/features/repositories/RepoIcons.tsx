import { FolderGit2 } from 'lucide-react'

export function ReactMark({ className = 'size-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <g fill="none" stroke="#0E8FB0" strokeWidth="1.6">
        <ellipse cx="16" cy="16" rx="12" ry="4.6" />
        <ellipse cx="16" cy="16" rx="12" ry="4.6" transform="rotate(60 16 16)" />
        <ellipse cx="16" cy="16" rx="12" ry="4.6" transform="rotate(120 16 16)" />
      </g>
      <circle cx="16" cy="16" r="2.2" fill="#0E8FB0" />
    </svg>
  )
}

export function PythonMark({ className = 'size-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <rect x="4" y="4" width="15" height="15" rx="5" fill="#3776AB" />
      <rect x="13" y="13" width="15" height="15" rx="5" fill="#E8B923" />
    </svg>
  )
}

export type RepoIconKind = 'folder' | 'react' | 'python'

export function RepoIcon({ kind, className }: { kind: RepoIconKind; className?: string }) {
  if (kind === 'react') return <ReactMark className={className} />
  if (kind === 'python') return <PythonMark className={className} />
  return <FolderGit2 className={className ?? 'size-6'} aria-hidden style={{ color: '#275DFF' }} />
}
