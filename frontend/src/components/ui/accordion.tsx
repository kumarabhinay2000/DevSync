import * as AccordionPrimitive from '@radix-ui/react-accordion'
import { Minus, Plus } from 'lucide-react'
import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

export const Accordion = AccordionPrimitive.Root

export function AccordionItem({ className, ...props }: ComponentProps<typeof AccordionPrimitive.Item>) {
  return (
    <AccordionPrimitive.Item
      className={cn('border-b border-border first:border-t', className)}
      {...props}
    />
  )
}

export function AccordionTrigger({
  className,
  children,
  ...props
}: ComponentProps<typeof AccordionPrimitive.Trigger>) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        className={cn(
          'group flex flex-1 items-center justify-between gap-6 py-6 text-left text-xl font-semibold text-foreground transition-colors hover:text-primary',
          className,
        )}
        {...props}
      >
        {children}
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-muted-foreground group-data-[state=open]:border-primary group-data-[state=open]:bg-selected group-data-[state=open]:text-primary">
          <Plus className="size-4 group-data-[state=open]:hidden" aria-hidden />
          <Minus className="hidden size-4 group-data-[state=open]:block" aria-hidden />
        </span>
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
}

export function AccordionContent({
  className,
  children,
  ...props
}: ComponentProps<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content className="overflow-hidden" {...props}>
      <div className={cn('max-w-3xl pb-6 pr-14 text-lg text-muted-foreground', className)}>
        {children}
      </div>
    </AccordionPrimitive.Content>
  )
}
