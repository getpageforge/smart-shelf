import { cn } from '@/lib/utils'

function Label({ className, ...props }: React.ComponentProps<'label'>) {
  return (
    <label
      data-slot="label"
      className={cn('text-sm font-medium text-foreground', className)}
      {...props}
    />
  )
}

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'flex min-h-20 w-full rounded-lg border border-input bg-background/60 px-3 py-2 text-sm text-foreground shadow-sm transition-colors outline-none',
        'placeholder:text-muted-foreground',
        'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/30',
        'disabled:pointer-events-none disabled:opacity-50',
        className,
      )}
      {...props}
    />
  )
}

export { Label, Textarea }
