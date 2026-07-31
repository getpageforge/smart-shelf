'use client'

import { cn } from '@/lib/utils'

interface SwitchProps {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  id?: string
  'aria-label'?: string
  disabled?: boolean
}

function Switch({
  checked,
  onCheckedChange,
  id,
  disabled,
  'aria-label': ariaLabel,
}: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      id={id}
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border border-transparent transition-colors outline-none',
        'focus-visible:ring-[3px] focus-visible:ring-ring/40 disabled:pointer-events-none disabled:opacity-50',
        checked ? 'bg-primary' : 'bg-input',
      )}
    >
      <span
        className={cn(
          'pointer-events-none inline-block size-5 translate-x-0.5 rounded-full bg-background shadow-sm transition-transform',
          checked && 'translate-x-[22px]',
        )}
      />
    </button>
  )
}

export { Switch }
