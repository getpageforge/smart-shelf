import {
  BarChart3,
  Bell,
  History,
  LayoutDashboard,
  Settings,
  User,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface NavItem {
  label: string
  href: string
  icon: LucideIcon
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'Estatísticas', href: '/estatisticas', icon: BarChart3 },
  { label: 'Alertas', href: '/alertas', icon: Bell },
  { label: 'Histórico', href: '/historico', icon: History },
  { label: 'Configurações', href: '/configuracoes', icon: Settings },
  { label: 'Conta', href: '/conta', icon: User },
]
