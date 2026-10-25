import type { ReactNode } from 'react'
import { Reveal } from '@/components/domain/Reveal'
import { cn } from '@/lib/utils'

type Props = {
  title: ReactNode
  description?: string
  align?: 'center' | 'left'
  id?: string
}

export function SectionHeading({ title, description, align = 'center', id }: Props) {
  return (
    <Reveal className={cn('max-w-3xl', align === 'center' && 'mx-auto text-center')}>
      <h2
        id={id}
        className="text-[32px] font-bold leading-[1.15] tracking-[-0.015em] text-foreground md:text-[40px]"
      >
        {title}
      </h2>
      {description && <p className="mt-4 text-lg text-muted-foreground">{description}</p>}
    </Reveal>
  )
}
