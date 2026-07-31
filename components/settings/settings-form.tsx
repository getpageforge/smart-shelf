'use client'

import { useState } from 'react'
import { Bell, Gauge, Store } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/field'
import { Switch } from '@/components/ui/switch'

interface ToggleRowProps {
  id: string
  label: string
  description: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}

function ToggleRow({ id, label, description, checked, onCheckedChange }: ToggleRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="flex flex-col gap-0.5">
        <Label htmlFor={id}>{label}</Label>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Switch
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        aria-label={label}
      />
    </div>
  )
}

function SettingsForm() {
  // Estado local apenas para a interface. Será conectado ao Supabase depois.
  const [alertsPush, setAlertsPush] = useState(true)
  const [alertsEmail, setAlertsEmail] = useState(false)
  const [alertsOffline, setAlertsOffline] = useState(true)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Integração futura: persistir no Supabase.
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Store className="size-4 text-primary" />
            <CardTitle className="text-base">Loja</CardTitle>
          </div>
          <CardDescription>
            Informações gerais exibidas no painel.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="store-name">Nome da loja</Label>
            <Input id="store-name" defaultValue="Supermercado Central" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="store-unit">Unidade</Label>
            <Input id="store-unit" defaultValue="Unidade Centro" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="store-timezone">Fuso horário</Label>
            <Input id="store-timezone" defaultValue="America/Sao_Paulo" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="store-contact">E-mail de contato</Label>
            <Input
              id="store-contact"
              type="email"
              defaultValue="operacoes@central.com"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="size-4 text-primary" />
            <CardTitle className="text-base">Notificações</CardTitle>
          </div>
          <CardDescription>
            Escolha como deseja ser avisado sobre eventos das cestas.
          </CardDescription>
        </CardHeader>
        <CardContent className="divide-y divide-border">
          <ToggleRow
            id="notif-push"
            label="Alertas no painel"
            description="Exibir notificações em tempo real no dashboard."
            checked={alertsPush}
            onCheckedChange={setAlertsPush}
          />
          <ToggleRow
            id="notif-email"
            label="Alertas por e-mail"
            description="Enviar um resumo diário dos alertas por e-mail."
            checked={alertsEmail}
            onCheckedChange={setAlertsEmail}
          />
          <ToggleRow
            id="notif-offline"
            label="Cesta offline"
            description="Avisar quando uma Smart Shelf ficar sem comunicação."
            checked={alertsOffline}
            onCheckedChange={setAlertsOffline}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Gauge className="size-4 text-primary" />
            <CardTitle className="text-base">Limites de ocupação</CardTitle>
          </div>
          <CardDescription>
            Percentuais que definem o status de cada compartimento.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="threshold-warning">Atenção (amarelo) a partir de %</Label>
            <Input id="threshold-warning" type="number" defaultValue={60} min={0} max={100} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="threshold-danger">Lotado (vermelho) a partir de %</Label>
            <Input id="threshold-danger" type="number" defaultValue={90} min={0} max={100} />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline">
          Cancelar
        </Button>
        <Button type="submit">Salvar alterações</Button>
      </div>
    </form>
  )
}

export { SettingsForm }
