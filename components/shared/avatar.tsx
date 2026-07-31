'use client'

import { cn } from '@/lib/utils'

/**
 * Generates a deterministic HSL background color from a string.
 * Same name always produces the same color.
 */
function nameToColor(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  const h = Math.abs(hash) % 360
  return `hsl(${h}, 60%, 45%)`
}

interface AvatarProps {
  name: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeClasses = {
  sm: 'size-8 text-xs',
  md: 'size-9 text-sm',
  lg: 'size-16 text-xl',
}

function Avatar({ name, size = 'md', className }: AvatarProps) {
  const initial = (name || '?').charAt(0).toUpperCase()
  const bg = nameToColor(name || 'default')

  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full font-semibold text-white select-none',
        sizeClasses[size],
        className,
      )}
      style={{ backgroundColor: bg }}
      aria-hidden="true"
    >
      {initial}
    </div>
  )
}

export { Avatar }
