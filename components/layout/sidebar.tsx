'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { NAV_ITEMS } from '@/lib/nav'
import { cn } from '@/lib/utils'
import { Logo } from './logo'
import { Avatar } from '@/components/shared/avatar'
import { useUserProfile } from '@/lib/contexts/user-profile-context'

interface SidebarProps {
  open: boolean
  onNavigate?: () => void
}

function isActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/' || pathname.startsWith('/shelves')
  return pathname.startsWith(href)
}

function Sidebar({ open, onNavigate }: SidebarProps) {
  const pathname = usePathname()
  const { profile, loading } = useUserProfile()
  
  const previewName = profile?.name ?? ''
  const previewRole = profile?.role ?? ''

  return (
    <aside
      className={cn(
        'flex h-full w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar',
      )}
    >
      <div className="flex h-16 items-center border-b border-sidebar-border px-5">
        <Logo />
      </div>

      <div className="flex items-center gap-3 border-b border-sidebar-border px-5 py-4">
        {loading ? (
          <div className="flex items-center gap-3 w-full">
            <div className="size-8 shrink-0 rounded-full bg-sidebar-accent animate-pulse" />
            <div className="flex flex-col gap-1.5 flex-1">
              <div className="h-3 w-24 rounded bg-sidebar-accent animate-pulse" />
              <div className="h-2.5 w-16 rounded bg-sidebar-accent animate-pulse" />
            </div>
          </div>
        ) : previewName ? (
          <>
            <Avatar name={previewName} size="sm" />
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-medium text-sidebar-foreground">
                {previewName}
              </span>
              {previewRole && (
                <span className="text-xs text-muted-foreground">{previewRole}</span>
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center gap-3">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-sidebar-accent text-muted-foreground">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4"><circle cx="12" cy="8" r="4"/><path d="M6 20v-2a6 6 0 0 1 12 0v2"/></svg>
            </div>
            <span className="text-sm text-muted-foreground">Sem perfil</span>
          </div>
        )}
      </div>


      <nav className="flex-1 space-y-1 overflow-y-auto p-3 no-scrollbar">
        <p className="px-3 pb-2 pt-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Menu principal
        </p>
        {NAV_ITEMS.map((item) => {
          const active = isActive(pathname, item.href)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                active
                  ? 'bg-primary/15 text-primary'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
              )}
            >
              <Icon
                className={cn(
                  'size-4.5 shrink-0 transition-transform group-hover:scale-110',
                  active ? 'text-primary' : 'text-muted-foreground',
                )}
              />
              {item.label}
              {active ? (
                <span className="ml-auto size-1.5 rounded-full bg-primary" />
              ) : null}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-destructive/15 hover:text-destructive"
        >
          <LogOut className="size-4.5 shrink-0" />
          Sair
        </button>
      </div>
    </aside>
  )
}

export { Sidebar }
