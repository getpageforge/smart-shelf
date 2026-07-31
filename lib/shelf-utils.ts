import type { ShelfCategory, AlertLevel } from './types'

export const CATEGORIES: ShelfCategory[] = [
  'mercearia',
  'hortifruti',
  'limpeza',
  'frios_e_congelados',
]

export const CATEGORY_META: Record<ShelfCategory, { label: string }> = {
  mercearia: { label: 'Mercearia' },
  hortifruti: { label: 'Hortifruti' },
  limpeza: { label: 'Limpeza' },
  frios_e_congelados: { label: 'Frios e Congelados' },
}

export const ALERT_LEVEL_LABEL: Record<AlertLevel, string> = {
  high: 'Alta',
  medium: 'Média',
  low: 'Baixa',
}

export const STATUS_LABEL: Record<string, string> = {
  online: 'Online',
  offline: 'Offline',
  reconnecting: 'Reconectando',
}

export function isValidToken(token: string) {
  return /^SHLF-\d{4}-\d{4}$/.test(token)
}

export function formatTokenInput(value: string) {
  const digits = value.replace(/\D/g, '')
  if (digits.length <= 4) return `SHLF-${digits}`
  return `SHLF-${digits.slice(0, 4)}-${digits.slice(4, 8)}`
}

export function formatDateTime(isoStr: string) {
  const date = new Date(isoStr)
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function relativeTime(isoStr: string) {
  const date = new Date(isoStr)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return 'Agora mesmo'
  if (diffInSeconds < 3600) return `Há ${Math.floor(diffInSeconds / 60)} min`
  if (diffInSeconds < 86400) return `Há ${Math.floor(diffInSeconds / 3600)} h`
  return formatDateTime(isoStr)
}
