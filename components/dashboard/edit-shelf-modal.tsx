'use client'

import { useState } from 'react'
import { Loader2, Pencil } from 'lucide-react'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/field'
import { Badge } from '@/components/ui/badge'
import { updateShelfName } from '@/lib/actions'
import { CATEGORY_META } from '@/lib/shelf-utils'
import type { ShelfCategory } from '@/lib/types'

interface EditShelfModalProps {
  open: boolean
  onClose: () => void
  shelfName: string
  shelfToken: string
  shelfCategory: ShelfCategory
  onUpdated: () => void
}

function EditShelfModal({
  open,
  onClose,
  shelfName,
  shelfToken,
  shelfCategory,
  onUpdated,
}: EditShelfModalProps) {
  const [name, setName] = useState(shelfName)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function handleOpen() {
    setName(shelfName)
    setError('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = await updateShelfName(shelfToken, name)
    setLoading(false)

    if (!result.success) {
      setError(result.error || 'Erro ao atualizar.')
      return
    }

    onUpdated()
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Editar Smart Shelf"
      description="Altere apenas o nome da Smart Shelf. Token e categoria não podem ser modificados."
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="edit-shelf-name">Nome</Label>
          <Input
            id="edit-shelf-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nome da Smart Shelf"
            required
            autoFocus
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label>Token</Label>
          <div className="flex h-9 items-center rounded-md border border-border bg-secondary/50 px-3">
            <span className="font-mono text-sm text-muted-foreground">
              {shelfToken}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            O token não pode ser alterado após o cadastro.
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label>Categoria</Label>
          <div className="flex h-9 items-center gap-2 rounded-md border border-border bg-secondary/50 px-3">
            <Badge variant="outline">
              {CATEGORY_META[shelfCategory]?.label ?? shelfCategory}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            A categoria não pode ser alterada após o cadastro.
          </p>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="mt-1 flex justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={loading || !name.trim()}>
            {loading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Pencil className="size-4" />
            )}
            Salvar
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export { EditShelfModal }
