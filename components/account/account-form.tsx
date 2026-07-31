'use client'

import { KeyRound, LogOut, UserCircle } from 'lucide-react'
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
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/shared/avatar'

function AccountForm() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Integração futura: persistir no Supabase Auth.
  }

  const employeeName = "Ana Ribeiro"

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <UserCircle className="size-4 text-primary" />
            <CardTitle className="text-base">Perfil</CardTitle>
          </div>
          <CardDescription>Seus dados pessoais e de acesso.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div className="flex items-center gap-4">
            <Avatar name={employeeName} size="lg" />
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{employeeName}</span>
                <Badge variant="primary">Supervisora</Badge>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">Nome completo</Label>
              <Input id="name" defaultValue={employeeName} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="role">Cargo</Label>
              <Input id="role" defaultValue="Supervisora de loja" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" defaultValue="ana.ribeiro@central.com" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="phone">Telefone</Label>
              <Input id="phone" type="tel" defaultValue="(11) 98888-0000" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <KeyRound className="size-4 text-primary" />
            <CardTitle className="text-base">Segurança</CardTitle>
          </div>
          <CardDescription>Atualize sua senha de acesso.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="current-password">Senha atual</Label>
            <Input id="current-password" type="password" placeholder="••••••••" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="new-password">Nova senha</Label>
            <Input id="new-password" type="password" placeholder="••••••••" />
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button
          type="button"
          variant="destructive"
          className="gap-2 sm:w-auto"
        >
          <LogOut className="size-4" />
          Sair da conta
        </Button>
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline">
            Cancelar
          </Button>
          <Button type="submit">Salvar alterações</Button>
        </div>
      </div>
    </form>
  )
}

export { AccountForm }
