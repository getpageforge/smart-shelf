'use client'

import { Boxes, Clock, Siren, Thermometer, Sun } from 'lucide-react'
import { DashboardShell } from '@/components/layout/dashboard-shell'
import { StatCard } from '@/components/shared/stat-card'
import { ShelvesSection } from '@/components/dashboard/shelves-section'
import { useShelves } from '@/lib/hooks/use-shelves'

export default function DashboardPage() {
  const { shelves, loading, refresh } = useShelves()

  const totalShelves = shelves.length
  const onlineShelves = shelves.filter((s) => s.status !== 'offline')
  const offlineShelves = shelves.filter((s) => s.status === 'offline').length
  const avgTemp =
    onlineShelves.length > 0
      ? (
          onlineShelves.reduce(
            (acc, s) => acc + (Number(s.temperature) || 0),
            0,
          ) / onlineShelves.length
        ).toFixed(1)
      : '--'
  const avgLight =
    onlineShelves.length > 0
      ? Math.round(
          onlineShelves.reduce(
            (acc, s) => acc + (Number(s.light) || 0),
            0,
          ) / onlineShelves.length,
        )
      : '--'

  return (
    <DashboardShell title="Dashboard" breadcrumbs={[{ label: 'Início' }]}>
      <div className="flex flex-col gap-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-5">
              <StatCard
                label="Smart Shelves"
                value={String(totalShelves)}
                hint="Estações cadastradas"
                icon={Boxes}
                tone="primary"
              />
              <StatCard
                label="Online"
                value={String(onlineShelves.length)}
                hint="Conectadas agora"
                icon={Clock}
                tone="success"
              />
              <StatCard
                label="Offline"
                value={String(offlineShelves)}
                hint="Sem comunicação"
                icon={Siren}
                tone="danger"
              />
              <StatCard
                label="Temp. média"
                value={avgTemp === '--' ? '--' : `${avgTemp}°C`}
                hint="Estações online"
                icon={Thermometer}
                tone="warning"
              />
              <StatCard
                label="Luz média"
                value={avgLight === '--' ? '--' : `${avgLight} lux`}
                hint="Estações online"
                icon={Sun}
                tone="info"
              />
            </div>

            <ShelvesSection shelves={shelves} onRefresh={refresh} />
          </>
        )}
      </div>
    </DashboardShell>
  )
}
