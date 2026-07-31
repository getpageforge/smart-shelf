'use client'

import { BarChart3, Package, RotateCcw, Thermometer } from 'lucide-react'
import { DashboardShell } from '@/components/layout/dashboard-shell'
import { StatCard } from '@/components/shared/stat-card'
import { StatsCharts } from '@/components/stats/charts'
import { useStats } from '@/lib/hooks/use-shelves'

export default function StatisticsPage() {
  const { stats, loading } = useStats()
  return (
    <DashboardShell
      title="Estatísticas"
      breadcrumbs={[{ label: 'Início', href: '/' }, { label: 'Estatísticas' }]}
    >
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-balance">
            Visão geral de desempenho
          </h1>
          <p className="mt-1 text-sm text-muted-foreground text-pretty">
            Métricas agregadas de todas as Smart Shelves nos últimos 7 dias.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                label="Devoluções na semana"
                value={stats?.totalDevolucoes?.toString() ?? '--'}
                icon={RotateCcw}
                tone="primary"
              />
              <StatCard
                label="Recolhimentos"
                value={stats?.totalRecolhimentos?.toString() ?? '--'}
                icon={Package}
                tone="info"
              />
              <StatCard
                label="Temperatura média"
                value={stats?.avgTemp !== '--' ? `${stats.avgTemp} °C` : '--'}
                icon={Thermometer}
                tone="warning"
              />
              <StatCard
                label="Taxa de ocupação"
                value={stats?.hasData ? 'Dados em tempo real' : '--'}
                icon={BarChart3}
                tone="success"
              />
            </div>

            <StatsCharts stats={stats} />
          </>
        )}
      </div>
    </DashboardShell>
  )
}
