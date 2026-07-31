import { cn } from '@/lib/utils'

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'flex h-9 w-full min-w-0 rounded-lg border border-input bg-background/60 px-3 py-1 text-sm text-foreground shadow-sm transition-colors outline-none',
        'placeholder:text-muted-foreground',
        'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/30',
        'disabled:pointer-events-none disabled:opacity-50',
        'aria-invalid:border-destructive aria-invalid:ring-destructive/25',
        className,
      )}
      {...props}
    />
  )
}

export { Input }
