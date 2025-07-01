// src/modules/audit-log/components/AuditTable.tsx
import React, { KeyboardEvent, memo } from 'react'
import { FixedSizeList as List, ListChildComponentProps } from 'react-window'
import { Link } from 'react-router-dom'
import type { AuditRecord } from '../types'

interface Props {
  records: AuditRecord[]
  isLoading: boolean
}

const ROW_HEIGHT = 48
const VISIBLE_ROWS = 5

export const AuditTable: React.FC<Props> = memo(({ records, isLoading }) => {
  // Placeholder skeleton while carga
  if (isLoading) {
    return (
      <div className="animate-pulse space-y-2">
        {Array.from({ length: VISIBLE_ROWS }).map((_, i) => (
          <div key={i} className="h-10 bg-gray-200 dark:bg-gray-700 rounded" />
        ))}
      </div>
    )
  }

  if (records.length === 0) {
    return <p className="text-center text-gray-500 dark:text-gray-400">No hay registros.</p>
  }

  // Renderiza cada fila como un "row" ARIA
  const Row = ({ index, style }: ListChildComponentProps) => {
    const rec = records[index]

    const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'Enter' || e.key === ' ') {
        // Navegar con teclado
        e.preventDefault()
        window.location.href = `/audit-log/${rec.id}`
      }
    }

    return (
      <div
        style={style}
        role="row"
        aria-rowindex={index + 2} // +1(header) +1(base-1)
        tabIndex={0}
        onKeyDown={onKeyDown}
        className="grid grid-cols-5 px-4 items-center hover:bg-gray-50 dark:hover:bg-gray-700 
                   focus:outline-none focus:ring-2 focus:ring-dp-blue transition-colors"
      >
        <div role="gridcell" className="font-mono text-sm truncate">
          {rec.id.slice(0, 8)}
        </div>
        <div role="gridcell" className="truncate">{rec.entity}</div>
        <div role="gridcell" className="truncate">
          {new Date(rec.timestamp).toLocaleString()}
        </div>
        <div role="gridcell" className="font-mono truncate">
          {rec.userId.slice(0, 8)}
        </div>
        <div role="gridcell">
          <Link
            to={`/audit-log/${rec.id}`}
            className="text-dp-blue hover:underline focus:outline-none focus:ring-2 focus:ring-dp-blue rounded"
            aria-label={`Ver detalles del registro ${rec.id}`}
          >
            →  
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div
      role="grid"
      aria-rowcount={records.length + 1}
      aria-colcount={5}
      className="border rounded bg-white dark:bg-gray-800 overflow-hidden shadow"
    >
      {/* Encabezado */}
      <div
        role="rowgroup"
        className="grid grid-cols-5 bg-gray-100 dark:bg-gray-700 px-4 py-2 font-semibold text-gray-800 dark:text-gray-200"
      >
        <div role="columnheader">ID</div>
        <div role="columnheader">Entidad</div>
        <div role="columnheader">Fecha</div>
        <div role="columnheader">Usuario</div>
        <div role="columnheader">Ver</div>
      </div>

      {/* Cuerpo virtualizado */}
      <div role="rowgroup">
        <List
          height={Math.min(VISIBLE_ROWS * ROW_HEIGHT, records.length * ROW_HEIGHT)}
          itemCount={records.length}
          itemSize={ROW_HEIGHT}
          width="100%"
        >
          {Row}
        </List>
      </div>
    </div>
  )
})

export default AuditTable
