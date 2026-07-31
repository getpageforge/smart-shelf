'use client'

import { useState } from 'react'
import { CheckCircle2, Loader2, ShieldCheck, XCircle } from 'lucide-react'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/field'
import { cn } from '@/lib/utils'
import { createShelf, validateTokenAvailability } from '@/lib/actions'
import { formatTokenInput, isValidToken, CATEGORIES, CATEGORY_META } from '@/lib/shelf-utils'
import type { ShelfCategory } from '@/lib/types'

type TokenState = 'idle' | 'validating' | 'valid' | 'invalid'

interface CreateShelfModalProps {
  open: boolean
  onClose: () => void
  onCreated: () => void
}

function CreateShelfModal({ open, onClose, onCreated }: CreateShelfModalProps) {
  const [name, setName] = useState('')
  const [category, setCategory] = useState<ShelfCategory | ''>('')
  const [token, setToken] = useState('SHLF-')
  const [tokenState, setTokenState] = useState<TokenState>('idle')
  const [tokenMessage, setTokenMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  function resetAndClose() {
    setName('')
    setCategory('')
    setToken('SHLF-')
    setTokenState('idle')
    setTokenMessage('')
    setSubmitting(false)
    setSubmitError('')
    onClose()
  }

  function handleTokenChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value
    const formatted = formatTokenInput(raw)
    setToken(formatted)
    setTokenState('idle')
    setTokenMessage('')
  }

  async function validateToken() {
    const cleaned = token.trim()
    if (!isValidToken(cleaned)) {
      setTokenState('invalid')
      setTokenMessage('Formato inválido. Use SHLF-XXXX-XXXX (8 dígitos).')
      return
    }

    setTokenState('validating')
    setTokenMessage('')

    const result = await validateTokenAvailability(cleaned)

    if (!result.valid) {
      setTokenState('invalid')
      setTokenMessage('Formato inválido.')
    } else if (!result.available) {
      setTokenState('invalid')
      setTokenMessage('Token já utilizado por outra Smart Shelf.')
    } else {
      setTokenState('valid')
      setTokenMessage('Token válido e disponível.')
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitError('')
    setSubmitting(true)

    const result = await createShelf({
      name: name.trim(),
      token: token.trim(),
      category: category,
    })

    setSubmitting(false)

    if (!result.success) {
      setSubmitError(result.error || 'Erro ao criar Smart Shelf.')
      return
    }

    onCreated()
    resetAndClose()
  }

  const canSubmit =
    name.trim() &&
    category &&
    tokenState === 'valid' &&
    !submitting

  return (
    <Modal
      open={open}
      onClose={resetAndClose}
      title="Nova Smart Shelf"
      description="Cadastre uma nova estação de devolução vinculando o token do dispositivo."
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="shelf-name">Nome da cesta</Label>
          <Input
            id="shelf-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex.: Smart Shelf 05"
            required
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="shelf-category">Categoria</Label>
          <select
            id="shelf-category"
            value={category}
            onChange={(e) => setCategory(e.target.value as ShelfCategory)}
            required
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="" disabled>
              Selecione uma categoria
            </option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {CATEGORY_META[cat].label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="shelf-token">Shelf Token</Label>
          <div className="flex gap-2">
            <Input
              id="shelf-token"
              value={token}
              onChange={handleTokenChange}
              placeholder="SHLF-XXXX-XXXX"
              className="font-mono"
              aria-invalid={tokenState === 'invalid'}
              required
              maxLength={14}
            />
            <Button
              type="button"
              variant="outline"
              onClick={validateToken}
              disabled={
                !token.trim() ||
                token === 'SHLF-' ||
                tokenState === 'validating'
              }
            >
              {tokenState === 'validating' ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <ShieldCheck className="size-4" />
              )}
              Validar
            </Button>
          </div>
          {tokenState === 'valid' && (
            <span className="flex items-center gap-1.5 text-xs text-emerald-500">
              <CheckCircle2 className="size-3.5" /> {tokenMessage}
            </span>
          )}
          {tokenState === 'invalid' && (
            <span className="flex items-center gap-1.5 text-xs text-destructive">
              <XCircle className="size-3.5" /> {tokenMessage}
            </span>
          )}
        </div>

        {submitError && (
          <p className="text-sm text-destructive">{submitError}</p>
        )}

        <div className="mt-1 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={resetAndClose}>
            Cancelar
          </Button>
          <Button
            type="submit"
            className={cn(!canSubmit && 'pointer-events-none opacity-50')}
            disabled={!canSubmit}
          >
            {submitting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : null}
            Criar cesta
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export { CreateShelfModal }
