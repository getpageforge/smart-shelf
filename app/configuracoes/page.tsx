import { DashboardShell } from '@/components/layout/dashboard-shell'
import { SettingsForm } from '@/components/settings/settings-form'

export default function SettingsPage() {
  return (
    <DashboardShell
      title="Configurações"
      breadcrumbs={[{ label: 'Início', href: '/' }, { label: 'Configurações' }]}
    >
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-balance">
            Configurações do sistema
          </h1>
          <p className="mt-1 text-sm text-muted-foreground text-pretty">
            Ajuste as preferências da loja, notificações e limites de ocupação.
          </p>
        </div>

        <SettingsForm />
      </div>
    </DashboardShell>
  )
}
