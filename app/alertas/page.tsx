'use client'

import { AlertsView } from '@/components/alerts/alerts-view'
import { DashboardShell } from '@/components/layout/dashboard-shell'

export default function AlertsPage() {
  return (
    <DashboardShell
      title="Alertas"
      breadcrumbs={[{ label: 'Início', href: '/' }, { label: 'Alertas' }]}
    >
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-balance">
            Central de alertas
          </h1>
          <p className="mt-1 text-sm text-muted-foreground text-pretty">
            Compartimentos lotados, sensores offline e falhas de conexão de todas
            as Smart Shelves.
          </p>
        </div>

        <AlertsView />
      </div>
    </DashboardShell>
  )
}
