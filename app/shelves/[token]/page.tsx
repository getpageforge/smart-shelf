'use client'

import { notFound } from 'next/navigation'
import { use, useState } from 'react'
import { Pencil, Sun, Thermometer, Trash2, Wifi, WifiOff } from 'lucide-react'
import { DashboardShell } from '@/components/layout/dashboard-shell'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { StatusDot } from '@/components/shared/status-dot'
import { useShelfDetail } from '@/lib/hooks/use-shelves'
import { CATEGORY_META, formatDateTime, ALERT_LEVEL_LABEL } from '@/lib/shelf-utils'
import { resolveAlert } from '@/lib/actions'
import { EditShelfModal } from '@/components/dashboard/edit-shelf-modal'
import { DeleteShelfModal } from '@/components/dashboard/delete-shelf-modal'

export default function ShelfPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = use(params)
  const decodedToken = decodeURIComponent(token)
  const { shelf, readings, events, alerts, loading, refresh } = useShelfDetail(decodedToken)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  if (loading) {
    return (
      <DashboardShell title="Carregando..." breadcrumbs={[{ label: 'Dashboard', href: '/' }]}>
        <div className="flex items-center justify-center py-20">
          <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </DashboardShell>
    )
  }

  if (!shelf) {
    return (
      <DashboardShell title="Não encontrada" breadcrumbs={[{ label: 'Dashboard', href: '/' }]}>
        <div className="flex flex-col items-center gap-2 py-20 text-center">
          <p className="text-lg font-semibold">Smart Shelf não encontrada</p>
          <p className="text-sm text-muted-foreground">
            O token {decodedToken} não corresponde a nenhuma Smart Shelf cadastrada.
          </p>
        </div>
      </DashboardShell>
    )
  }

  const offline = shelf.status === 'offline'
  const activeAlerts = alerts.filter((a) => !a.resolved)
  const recentReadings = readings.slice(0, 10)
  const recentEvents = events.slice(0, 10)

  async function handleResolveAlert(alertId: string) {
    await resolveAlert(alertId)
    refresh()
  }

  return (
    <DashboardShell
      title={shelf.name}
      breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: shelf.name }]}
    >
      <div className="flex flex-col gap-6">
        {/* Header card */}
        <Card className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold">{shelf.name}</h2>
              <StatusDot status={shelf.status} />
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="font-mono">
                {shelf.token}
              </Badge>
              <Badge variant="outline">
                {CATEGORY_META[shelf.category]?.label ?? shelf.category}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditOpen(true)}
            >
              <Pencil className="size-3.5" />
              Editar
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 className="size-3.5" />
              Excluir
            </Button>
          </div>
        </Card>

        {/* Sensor overview cards */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Status
              </span>
              {offline ? (
                <WifiOff className="size-4 text-destructive" />
              ) : (
                <Wifi className="size-4 text-emerald-500" />
              )}
            </div>
            <p className="mt-2 text-2xl font-semibold tracking-tight capitalize">
              {shelf.status}
            </p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Temperatura
              </span>
              <Thermometer className="size-4 text-muted-foreground" />
            </div>
            <p className="mt-2 text-2xl font-semibold tracking-tight">
              {offline || shelf.temperature == null
                ? '--'
                : `${Number(shelf.temperature).toFixed(1)}°C`}
            </p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Luminosidade
              </span>
              <Sun className="size-4 text-muted-foreground" />
            </div>
            <p className="mt-2 text-2xl font-semibold tracking-tight">
              {offline || shelf.light == null
                ? '--'
                : `${Number(shelf.light)} lux`}
            </p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Ocupado
              </span>
            </div>
            <p className="mt-2 text-2xl font-semibold tracking-tight">
              {shelf.occupied == null
                ? '--'
                : shelf.occupied
                  ? 'Sim'
                  : 'Não'}
            </p>
          </Card>
        </div>

        {/* Alerts and Events side by side */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          {/* Active alerts */}
          <section className="flex flex-col gap-4">
            <h3 className="text-base font-semibold">
              Alertas ativos ({activeAlerts.length})
            </h3>
            {activeAlerts.length === 0 ? (
              <Card className="p-6 text-center text-sm text-muted-foreground">
                Nenhum alerta ativo para esta Smart Shelf.
              </Card>
            ) : (
              <div className="flex flex-col gap-2">
                {activeAlerts.map((alert) => (
                  <Card
                    key={alert.id}
                    className="flex items-start justify-between gap-3 p-4"
                  >
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            alert.level === 'high'
                              ? 'destructive'
                              : alert.level === 'medium'
                                ? 'secondary'
                                : 'outline'
                          }
                        >
                          {ALERT_LEVEL_LABEL[alert.level]}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDateTime(alert.created_at)}
                        </span>
                      </div>
                      <p className="text-sm">{alert.message}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleResolveAlert(alert.id)}
                    >
                      Resolver
                    </Button>
                  </Card>
                ))}
              </div>
            )}
          </section>

          {/* Recent events */}
          <section className="flex flex-col gap-4">
            <h3 className="text-base font-semibold">
              Eventos recentes ({recentEvents.length})
            </h3>
            {recentEvents.length === 0 ? (
              <Card className="p-6 text-center text-sm text-muted-foreground">
                Nenhum evento registrado para esta Smart Shelf.
              </Card>
            ) : (
              <div className="flex flex-col gap-2">
                {recentEvents.map((event) => (
                  <Card key={event.id} className="flex items-center justify-between p-4">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-medium capitalize">
                        {event.type.replace(/_/g, ' ')}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDateTime(event.created_at)}
                      </span>
                    </div>
                    <Badge variant="outline">Qtd: {event.quantity}</Badge>
                  </Card>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Recent sensor readings */}
        <section className="flex flex-col gap-4">
          <h3 className="text-base font-semibold">
            Últimas leituras dos sensores
          </h3>
          {recentReadings.length === 0 ? (
            <Card className="p-6 text-center text-sm text-muted-foreground">
              Nenhuma leitura registrada para esta Smart Shelf.
            </Card>
          ) : (
            <Card className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      Data
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      Temperatura
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      Luminosidade
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      Ocupado
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentReadings.map((r) => (
                    <tr
                      key={r.id}
                      className="border-b border-border last:border-0"
                    >
                      <td className="px-4 py-2.5 text-muted-foreground">
                        {formatDateTime(r.created_at)}
                      </td>
                      <td className="px-4 py-2.5">
                        {r.temperature != null
                          ? `${Number(r.temperature).toFixed(1)}°C`
                          : '--'}
                      </td>
                      <td className="px-4 py-2.5">
                        {r.light != null ? `${Number(r.light)} lux` : '--'}
                      </td>
                      <td className="px-4 py-2.5">
                        {r.occupied ? 'Sim' : 'Não'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}
        </section>
      </div>

      <EditShelfModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        shelfName={shelf.name}
        shelfToken={shelf.token}
        shelfCategory={shelf.category}
        onUpdated={refresh}
      />

      <DeleteShelfModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        shelfName={shelf.name}
        shelfToken={shelf.token}
        onDeleted={() => {
          window.location.href = '/'
        }}
      />
    </DashboardShell>
  )
}
