'use client'

import { DashboardShell } from '@/components/layout/dashboard-shell'
import { AccountForm } from '@/components/account/account-form'

export default function AccountPage() {
  return (
    <DashboardShell
      title="Conta"
      breadcrumbs={[{ label: 'Início', href: '/' }, { label: 'Conta' }]}
    >
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-balance">
            Minha conta
          </h1>
          <p className="mt-1 text-sm text-muted-foreground text-pretty">
            Gerencie seus dados de perfil e as credenciais de acesso.
          </p>
        </div>

        <AccountForm />
      </div>
    </DashboardShell>
  )
}
