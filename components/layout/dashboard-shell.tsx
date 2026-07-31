'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Header, type Breadcrumb } from './header'
import { Sidebar } from './sidebar'

interface DashboardShellProps {
  title: string
  breadcrumbs?: Breadcrumb[]
  children: React.ReactNode
}

function DashboardShell({ title, breadcrumbs, children }: DashboardShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex h-dvh overflow-hidden bg-background">
      {/* Sidebar fixa (desktop) */}
      <div className="hidden lg:block">
        <Sidebar open />
      </div>

      {/* Sidebar drawer (mobile) */}
      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-in fade-in"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full animate-in slide-in-from-left duration-200">
            <Sidebar open onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          title={title}
          breadcrumbs={breadcrumbs}
          onToggleSidebar={() => setMobileOpen((v) => !v)}
        />
        <main className={cn('flex-1 overflow-y-auto p-4 md:p-6')}>{children}</main>
      </div>
    </div>
  )
}

export { DashboardShell }
