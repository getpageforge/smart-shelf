'use client'

import { useState } from 'react'
import { createProfile } from '@/lib/actions'
import { useUser } from '@/lib/contexts/user-context'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/field'

export function OnboardingModal() {
  const { profile, loading, setProfile } = useUser()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Show modal if we finished loading and there's no profile
  const open = !loading && !profile

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const name = formData.get('name') as string
    const role = formData.get('role') as string
    const email = formData.get('email') as string
    const phone = formData.get('phone') as string

    const deviceId = localStorage.getItem('smart_shelf_device_id')
    if (!deviceId) return

    const { success, profile: newProfile, error: apiError } = await createProfile({
      id: deviceId,
      name,
      role,
      email,
      phone,
    })

    if (success && newProfile) {
      setProfile(newProfile)
    } else {
      setError(apiError || 'Ocorreu um erro ao salvar o perfil.')
    }
    
    setIsSubmitting(false)
  }

  // Se ainda estiver carregando, não renderiza nada para evitar piscar o modal
  if (loading) return null

  return (
    <Modal open={open} onClose={() => {}} hideClose title="Bem-vindo(a) à Smart Shelf">
      <div className="flex flex-col gap-4 py-4">
        <p className="text-sm text-muted-foreground">
          Por favor, preencha seus dados para configurar sua conta antes de continuar.
        </p>

        <form id="onboarding-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="ob-name">Nome completo</Label>
            <Input id="ob-name" name="name" required placeholder="Ex: Ana Ribeiro" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="ob-role">Cargo</Label>
            <Input id="ob-role" name="role" required placeholder="Ex: Supervisora de loja" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="ob-email">E-mail</Label>
            <Input id="ob-email" name="email" type="email" required placeholder="Ex: ana@empresa.com" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="ob-phone">Telefone</Label>
            <Input id="ob-phone" name="phone" type="tel" required placeholder="Ex: (11) 98888-0000" />
          </div>

          {error && <p className="text-sm text-destructive font-medium">{error}</p>}
        </form>

        <div className="flex justify-end gap-3 mt-4">
          <Button type="submit" form="onboarding-form" disabled={isSubmitting}>
            {isSubmitting ? 'Salvando...' : 'Salvar e continuar'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
