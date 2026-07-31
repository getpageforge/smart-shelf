'use client'

import { useEffect, useState } from 'react'
import { KeyRound, LogOut, UserCircle, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
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
import { useUserProfile } from '@/lib/contexts/user-profile-context'
import { saveUserProfile } from '@/lib/actions'

type SaveStatus = 'idle' | 'saving' | 'success' | 'error'

function AccountForm() {
  const { profile, profileId, loading, setProfile } = useUserProfile()

  const [name, setName] = useState('')
  const [role, setRole] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  // Populate fields when profile loads
  useEffect(() => {
    if (profile) {
      setName(profile.name ?? '')
      setRole(profile.role ?? '')
      setEmail(profile.email ?? '')
      setPhone(profile.phone ?? '')
    }
  }, [profile])

  const previewName = name.trim() || profile?.name || 'Usuário'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setSaveStatus('saving')
    setErrorMsg('')

    const result = await saveUserProfile({
      id: profileId,
      name,
      role,
      email,
      phone,
    })

    if (result.success && result.data) {
      setProfile(result.data)
      setSaveStatus('success')
      setTimeout(() => setSaveStatus('idle'), 3000)
    } else {
      setErrorMsg(result.error ?? 'Erro ao salvar.')
      setSaveStatus('error')
    }
  }

  function handleCancel() {
    if (profile) {
      setName(profile.name ?? '')
      setRole(profile.role ?? '')
      setEmail(profile.email ?? '')
      setPhone(profile.phone ?? '')
    }
    setSaveStatus('idle')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

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
            <Avatar name={previewName} size="lg" />
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{previewName}</span>
                {role.trim() && (
                  <Badge variant="primary">{role}</Badge>
                )}
              </div>
              <span className="text-xs text-muted-foreground">
                O avatar atualiza conforme você digita o nome.
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">Nome completo</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome completo"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="role">Cargo</Label>
              <Input
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="Ex: Supervisora de loja"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ex: ana@empresa.com"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Ex: (11) 98888-0000"
              />
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

      {/* Status feedback */}
      {saveStatus === 'success' && (
        <div className="flex items-center gap-2 rounded-lg bg-green-500/10 px-4 py-3 text-sm text-green-400">
          <CheckCircle2 className="size-4 shrink-0" />
          Perfil salvo com sucesso!
        </div>
      )}
      {saveStatus === 'error' && (
        <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="size-4 shrink-0" />
          {errorMsg}
        </div>
      )}

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
          <Button type="button" variant="outline" onClick={handleCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={saveStatus === 'saving' || !name.trim()}>
            {saveStatus === 'saving' ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Salvando…
              </>
            ) : (
              'Salvar alterações'
            )}
          </Button>
        </div>
      </div>
    </form>
  )
}

export { AccountForm }
