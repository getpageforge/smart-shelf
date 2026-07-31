'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMemo, useState, useEffect, useRef } from 'react'
import { ChevronRight, Menu, Search, Package } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Notifications } from './notifications'
import { Avatar } from '@/components/shared/avatar'
import { useShelves } from '@/lib/hooks/use-shelves'
import { CATEGORY_META } from '@/lib/shelf-utils'

export interface Breadcrumb {
  label: string
  href?: string
}

interface HeaderProps {
  title: string
  breadcrumbs?: Breadcrumb[]
  onToggleSidebar: () => void
}

function Header({ title, breadcrumbs = [], onToggleSidebar }: HeaderProps) {
  const router = useRouter()
  const { shelves } = useShelves()
  const [query, setQuery] = useState('')
  const [showResults, setShowResults] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  
  const now = new Date()
  const dateLabel = now.toLocaleDateString('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  })
  
  const employeeName = "Ana Ribeiro"

  // Handle click outside to close search results
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return shelves.filter((s) => {
      const categoryLabel = CATEGORY_META[s.category]?.label.toLowerCase() ?? ''
      return (
        s.name.toLowerCase().includes(q) ||
        s.token.toLowerCase().includes(q) ||
        categoryLabel.includes(q)
      )
    }).slice(0, 5) // limit to 5 results
  }, [shelves, query])

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-md md:px-6">
      <button
        type="button"
        onClick={onToggleSidebar}
        aria-label="Abrir menu"
        className="flex size-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:text-foreground lg:hidden"
      >
        <Menu className="size-4.5" />
      </button>

      <div className="flex min-w-0 flex-col">
        <h1 className="truncate text-base font-semibold leading-tight md:text-lg">
          {title}
        </h1>
        {breadcrumbs.length > 0 ? (
          <nav
            aria-label="Trilha de navegação"
            className="flex items-center gap-1 text-xs text-muted-foreground"
          >
            {breadcrumbs.map((crumb, i) => (
              <span key={crumb.label} className="flex items-center gap-1">
                {i > 0 ? <ChevronRight className="size-3" /> : null}
                {crumb.href ? (
                  <Link
                    href={crumb.href}
                    className="transition-colors hover:text-foreground"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-foreground">{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>
        ) : null}
      </div>

      <div className="ml-auto flex items-center gap-3">
        <div className="relative hidden md:block" ref={searchRef}>
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Pesquisar cestas, tokens, categorias..."
            aria-label="Pesquisa global"
            className="h-9 w-56 pl-9 lg:w-72"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setShowResults(true)
            }}
            onFocus={() => setShowResults(true)}
          />
          
          {showResults && query.trim().length > 0 && (
            <div className="absolute top-full mt-2 w-full rounded-md border border-border bg-popover shadow-md">
              <ul className="flex max-h-64 flex-col overflow-y-auto py-1">
                {filtered.length > 0 ? (
                  filtered.map((shelf) => (
                    <li key={shelf.id}>
                      <button
                        type="button"
                        className="flex w-full items-center gap-3 px-4 py-2 text-left hover:bg-secondary"
                        onClick={() => {
                          router.push(`/shelves/${encodeURIComponent(shelf.token)}`)
                          setShowResults(false)
                          setQuery('')
                        }}
                      >
                        <Package className="size-4 text-muted-foreground" />
                        <div className="flex flex-col overflow-hidden">
                          <span className="truncate text-sm font-medium">
                            {shelf.name}
                          </span>
                          <span className="truncate text-xs text-muted-foreground font-mono">
                            {shelf.token}
                          </span>
                        </div>
                      </button>
                    </li>
                  ))
                ) : (
                  <li className="px-4 py-3 text-center text-sm text-muted-foreground">
                    Nenhum resultado encontrado.
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>

        <Notifications />

        <div className="hidden items-center gap-2.5 border-l border-border pl-3 sm:flex">
          <div className="flex flex-col items-end leading-tight">
            <span className="text-sm font-medium">{employeeName}</span>
            <span className="text-xs text-muted-foreground">{dateLabel}</span>
          </div>
          <Avatar name={employeeName} size="md" />
        </div>
      </div>
    </header>
  )
}

export { Header }
