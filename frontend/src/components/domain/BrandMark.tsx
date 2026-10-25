import { cn } from '@/lib/utils'

export function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={cn('size-8 shrink-0', className)}
      role="img"
      aria-label="DevSync AI"
    >
      <rect width="32" height="32" rx="8" fill="#1D4ED8" />
      <path
        d="M12 11l-5 5 5 5M20 11l5 5-5 5"
        fill="none"
        stroke="#fff"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M17.5 9l-3 14" stroke="#DBEAFE" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export function Brand({ className, tone = 'light' }: { className?: string; tone?: 'light' | 'dark' }) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <BrandMark />
      <span
        className={cn(
          'text-[19px] font-bold tracking-tight',
          tone === 'dark' ? 'text-white' : 'text-foreground',
        )}
      >
        DevSync AI
      </span>
    </span>
  )
}
