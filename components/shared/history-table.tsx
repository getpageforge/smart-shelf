import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { formatDateTime } from '@/lib/shelf-utils'
import type { HistoryEntry } from '@/lib/types'

function HistoryTable({
  entries,
  detailed = false,
}: {
  entries: HistoryEntry[]
  detailed?: boolean
}) {
  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center gap-1 rounded-xl border border-dashed border-border py-10 text-center">
        <p className="text-sm font-medium">Sem registros</p>
        <p className="text-sm text-muted-foreground">
          Os eventos aparecerão aqui conforme forem recebidos.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Data</TableHead>
            {detailed ? <TableHead>Shelf</TableHead> : null}
            <TableHead>Tipo</TableHead>
            <TableHead>Evento</TableHead>
            {detailed ? <TableHead>Qtd.</TableHead> : null}
            {detailed ? <TableHead>Temp.</TableHead> : null}
            {detailed ? <TableHead>Luz</TableHead> : null}
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((entry) => (
            <TableRow key={entry.id}>
              <TableCell className="whitespace-nowrap text-muted-foreground">
                {formatDateTime(entry.created_at)}
              </TableCell>
              {detailed ? (
                <TableCell className="font-medium text-xs font-mono">
                  {entry.shelf_token}
                </TableCell>
              ) : null}
              <TableCell>
                <Badge variant={entry.type === 'event' ? 'primary' : 'secondary'}>
                  {entry.type === 'event' ? 'Evento' : 'Sensor'}
                </Badge>
              </TableCell>
              <TableCell className="font-medium">
                {entry.event_type ? entry.event_type.replace(/_/g, ' ') : '—'}
              </TableCell>
              {detailed ? (
                <TableCell className="text-muted-foreground">
                  {entry.quantity ?? '—'}
                </TableCell>
              ) : null}
              {detailed ? (
                <TableCell className="text-muted-foreground">
                  {entry.temperature != null ? `${entry.temperature}°C` : '—'}
                </TableCell>
              ) : null}
              {detailed ? (
                <TableCell className="text-muted-foreground">
                  {entry.light != null ? `${entry.light} lux` : '—'}
                </TableCell>
              ) : null}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export { HistoryTable }
