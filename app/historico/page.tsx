import { DashboardShell } from '@/components/layout/dashboard-shell'
import { HistoryView } from '@/components/history/history-view'

export default function HistoryPage() {
  return (
    <DashboardShell
      title="Histórico"
      breadcrumbs={[{ label: 'Início', href: '/' }, { label: 'Histórico' }]}
    >
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-balance">
            Histórico de eventos
          </h1>
          <p className="mt-1 text-sm text-muted-foreground text-pretty">
            Registros de devoluções, recolhimentos e leituras dos sensores de
            todas as Smart Shelves.
          </p>
        </div>

        <HistoryView />
      </div>
    </DashboardShell>
  )
}
