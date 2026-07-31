'use client'

import { useState } from 'react'
import { AlertTriangle, Loader2, Trash2 } from 'lucide-react'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { deleteShelf } from '@/lib/actions'

interface DeleteShelfModalProps {
  open: boolean
  onClose: () => void
  shelfName: string
  shelfToken: string
  onDeleted: () => void
}

function DeleteShelfModal({
  open,
  onClose,
  shelfName,
  shelfToken,
  onDeleted,
}: DeleteShelfModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleDelete() {
    setLoading(true)
    setError('')

    const result = await deleteShelf(shelfToken)
    setLoading(false)

    if (!result.success) {
      setError(result.error || 'Erro ao excluir.')
      return
    }

    onDeleted()
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Excluir Smart Shelf"
      description="Esta ação não pode ser desfeita."
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4">
          <AlertTriangle className="mt-0.5 size-5 shrink-0 text-destructive" />
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium">
              Tem certeza que deseja excluir?
            </p>
            <p className="text-sm text-muted-foreground">
              A Smart Shelf <strong>{shelfName}</strong>{' '}
              <span className="font-mono text-xs">({shelfToken})</span> será
              removida permanentemente junto com todas as leituras, eventos e
              alertas associados.
            </p>
          </div>
        </div>

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Trash2 className="size-4" />
            )}
            Excluir
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export { DeleteShelfModal }
