'use client'

import { useEffect, useState } from 'react'
import { Package, User, Briefcase, Mail, Phone, CheckCircle2, ChevronRight, ArrowLeft, Sparkles } from 'lucide-react'
import { saveUserProfile } from '@/lib/actions'
import { useUserProfile } from '@/lib/contexts/user-profile-context'

// ---------------------------------------------------------------------------
// Avatar preview (same logic as shared/avatar)
// ---------------------------------------------------------------------------
function nameToColor(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  const h = Math.abs(hash) % 360
  return `hsl(${h}, 60%, 45%)`
}

function AvatarPreview({ name }: { name: string }) {
  const display = name.trim() || '?'
  const initial = display.charAt(0).toUpperCase()
  const bg = nameToColor(display)
  return (
    <div
      className="flex size-20 shrink-0 items-center justify-center rounded-full text-3xl font-bold text-white shadow-lg transition-all duration-300"
      style={{ backgroundColor: bg }}
    >
      {initial}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Step indicators
// ---------------------------------------------------------------------------
const STEPS = ['Bem-vindo', 'Seu nome', 'Seus dados', 'Pronto!']

function StepDots({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-2">
      {STEPS.map((_, i) => (
        <div
          key={i}
          className={`h-2 rounded-full transition-all duration-300 ${
            i === current
              ? 'w-6 bg-primary'
              : i < current
              ? 'w-2 bg-primary/40'
              : 'w-2 bg-border'
          }`}
        />
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main wizard
// ---------------------------------------------------------------------------
interface FormData {
  name: string
  role: string
  email: string
  phone: string
}

export function OnboardingWizard() {
  const { profileId, onboardingDone, profile, loading, markOnboardingDone, setProfile } =
    useUserProfile()

  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [visible, setVisible] = useState(false)
  const [form, setForm] = useState<FormData>({ name: '', role: '', email: '', phone: '' })

  // Show only after loading is done and onboarding is not done and no profile yet
  useEffect(() => {
    if (!loading && !onboardingDone && !profile) {
      // Small delay for smooth entrance
      setTimeout(() => setVisible(true), 300)
    }
  }, [loading, onboardingDone, profile])

  if (!visible) return null

  function update(field: keyof FormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
    setError('')
  }

  function canGoNext(): boolean {
    if (step === 1) return form.name.trim().length >= 2
    if (step === 2) return true // fields are optional except name
    return true
  }

  async function handleNext() {
    if (step < 3) {
      setStep((s) => s + 1)
      return
    }
    // Final step — save
    setSaving(true)
    setError('')
    try {
      const result = await saveUserProfile({
        id: profileId,
        name: form.name,
        role: form.role,
        email: form.email,
        phone: form.phone,
      })
      if (!result.success) {
        setError(result.error ?? 'Erro desconhecido.')
        setSaving(false)
        return
      }
      if (result.data) setProfile(result.data)
      markOnboardingDone()
      // Animate out
      setVisible(false)
    } catch {
      setError('Erro ao conectar com o servidor.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 p-4 backdrop-blur-sm"
      style={{
        animation: 'fadeIn 0.3s ease',
      }}
    >
      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(24px) } to { opacity: 1; transform: translateY(0) } }
      `}</style>

      <div
        className="relative w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
        style={{ animation: 'slideUp 0.4s ease' }}
      >
        {/* Top accent bar */}
        <div className="h-1 w-full bg-gradient-to-r from-primary via-primary/60 to-transparent" />

        <div className="flex flex-col gap-8 p-6 sm:p-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="size-5 text-primary" />
              <span className="text-sm font-semibold text-primary">Smart Shelf</span>
            </div>
            <StepDots current={step} />
          </div>

          {/* Step content */}
          <div className="flex flex-col gap-6" key={step} style={{ animation: 'slideUp 0.25s ease' }}>
            {step === 0 && <StepWelcome />}
            {step === 1 && <StepName form={form} update={update} />}
            {step === 2 && <StepDetails form={form} update={update} />}
            {step === 3 && <StepConfirm form={form} saving={saving} />}
          </div>

          {/* Error */}
          {error && (
            <p className="rounded-lg bg-destructive/10 px-4 py-2 text-sm text-destructive">
              {error}
            </p>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between">
            {step > 0 ? (
              <button
                type="button"
                onClick={() => setStep((s) => s - 1)}
                disabled={saving}
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-50"
              >
                <ArrowLeft className="size-4" />
                Voltar
              </button>
            ) : (
              <div />
            )}

            <button
              type="button"
              onClick={handleNext}
              disabled={!canGoNext() || saving}
              className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? (
                <>
                  <span className="inline-block size-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                  Salvando...
                </>
              ) : step === 3 ? (
                <>
                  <CheckCircle2 className="size-4" />
                  Começar
                </>
              ) : (
                <>
                  Continuar
                  <ChevronRight className="size-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Step sub-components
// ---------------------------------------------------------------------------
function StepWelcome() {
  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10">
        <Sparkles className="size-8 text-primary" />
      </div>
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Bem-vindo ao Smart Shelf!</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Antes de começar, vamos configurar o seu perfil. Isso só vai levar alguns segundos.
        </p>
      </div>
    </div>
  )
}

function StepName({ form, update }: { form: FormData; update: (f: keyof FormData, v: string) => void }) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold tracking-tight">Como você se chama?</h2>
        <p className="text-sm text-muted-foreground">Seu nome aparecerá no cabeçalho e no perfil.</p>
      </div>

      <div className="flex items-center gap-4">
        <AvatarPreview name={form.name} />
        <div className="flex flex-1 flex-col gap-1.5">
          <label htmlFor="ob-name" className="text-sm font-medium">
            Nome completo
          </label>
          <div className="relative">
            <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              id="ob-name"
              type="text"
              placeholder="Ex: Ana Ribeiro"
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              autoFocus
              autoComplete="name"
              className="h-10 w-full rounded-lg border border-border bg-background pl-9 pr-4 text-sm outline-none ring-offset-background transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          {form.name.trim().length > 0 && form.name.trim().length < 2 && (
            <p className="text-xs text-destructive">Nome muito curto.</p>
          )}
        </div>
      </div>
    </div>
  )
}

function StepDetails({ form, update }: { form: FormData; update: (f: keyof FormData, v: string) => void }) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-xl font-bold tracking-tight">Mais alguns dados</h2>
        <p className="text-sm text-muted-foreground">Todos os campos abaixo são opcionais.</p>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="ob-role" className="text-sm font-medium">Cargo</label>
          <div className="relative">
            <Briefcase className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              id="ob-role"
              type="text"
              placeholder="Ex: Supervisora de loja"
              value={form.role}
              onChange={(e) => update('role', e.target.value)}
              autoComplete="organization-title"
              className="h-10 w-full rounded-lg border border-border bg-background pl-9 pr-4 text-sm outline-none ring-offset-background transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="ob-email" className="text-sm font-medium">E-mail</label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              id="ob-email"
              type="email"
              placeholder="Ex: ana@empresa.com"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
              autoComplete="email"
              className="h-10 w-full rounded-lg border border-border bg-background pl-9 pr-4 text-sm outline-none ring-offset-background transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="ob-phone" className="text-sm font-medium">Telefone</label>
          <div className="relative">
            <Phone className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              id="ob-phone"
              type="tel"
              placeholder="Ex: (11) 98888-0000"
              value={form.phone}
              onChange={(e) => update('phone', e.target.value)}
              autoComplete="tel"
              className="h-10 w-full rounded-lg border border-border bg-background pl-9 pr-4 text-sm outline-none ring-offset-background transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function StepConfirm({ form, saving }: { form: FormData; saving: boolean }) {
  return (
    <div className="flex flex-col items-center gap-5 text-center">
      <AvatarPreview name={form.name} />
      <div>
        <h2 className="text-xl font-bold tracking-tight">{form.name || 'Tudo pronto!'}</h2>
        {form.role && <p className="mt-1 text-sm text-muted-foreground">{form.role}</p>}
      </div>

      {(form.email || form.phone) && (
        <div className="w-full rounded-xl border border-border bg-secondary/30 p-4 text-left">
          {form.email && (
            <div className="flex items-center gap-2 text-sm">
              <Mail className="size-4 text-muted-foreground" />
              <span className="truncate">{form.email}</span>
            </div>
          )}
          {form.phone && (
            <div className="mt-2 flex items-center gap-2 text-sm">
              <Phone className="size-4 text-muted-foreground" />
              <span>{form.phone}</span>
            </div>
          )}
        </div>
      )}

      <p className="text-sm text-muted-foreground">
        {saving ? 'Salvando seu perfil…' : 'Clique em "Começar" para entrar no painel.'}
      </p>
    </div>
  )
}
