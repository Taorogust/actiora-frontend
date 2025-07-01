// src/modules/audit-log/components/AuditFilter.tsx
import React, { useEffect, useRef } from 'react'
import { useForm, Controller, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { DateRangePicker } from '@/components/common/date-range-picker'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

// 1) Schema con validación y refinamiento de fechas
const schema = z
  .object({
    entity: z.string().max(100, 'Máx. 100 caracteres').optional(),
    from: z.date().optional(),
    to: z.date().optional(),
  })
  .refine(
    data =>
      !data.from ||
      !data.to ||
      data.from.getTime() <= data.to.getTime(),
    {
      message: "La fecha 'Desde' debe ser anterior o igual a 'Hasta'",
      path: ['to'],
    }
  )

type FormValues = z.infer<typeof schema>

interface Props {
  onFilter: (vals: FormValues) => void
}

export const AuditFilter: React.FC<Props> = ({ onFilter }) => {
  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { entity: '', from: undefined, to: undefined },
  })

  // 2) Debounce automático al cambiar cualquier campo
  const watchValues = useWatch({ control })
  const debounceRef = useRef<number>()
  useEffect(() => {
    // Limpia el timeout anterior
    window.clearTimeout(debounceRef.current)
    // Vuelve a disparar el submit validado
    debounceRef.current = window.setTimeout(() => {
      handleSubmit(onFilter)()
    }, 300)
    return () => window.clearTimeout(debounceRef.current)
  }, [watchValues, handleSubmit, onFilter])

  // 3) Para aria-live con la selección de fechas
  const { from, to } = watchValues

  return (
    <form
      onSubmit={handleSubmit(onFilter)}
      className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow grid grid-cols-1 sm:grid-cols-4 gap-4"
      aria-label="Filtrar registros de auditoría"
      noValidate
    >
      {/* Entidad */}
      <div className="col-span-1">
        <label htmlFor="entity-input" className="sr-only">
          Entidad
        </label>
        <Input
          id="entity-input"
          placeholder="Entidad"
          {...register('entity')}
          aria-invalid={!!errors.entity}
          aria-describedby={errors.entity ? 'entity-error' : undefined}
        />
        {errors.entity && (
          <p id="entity-error" className="text-sm text-red-600 mt-1">
            {errors.entity.message}
          </p>
        )}
      </div>

      {/* Rango de fechas */}
      <div className="col-span-2 sm:col-span-1">
        <Controller
          control={control}
          name="from"
          render={({ field: { value: fromValue, onChange } }) => (
            <DateRangePicker
              names={{ from: 'from', to: 'to' }}
              control={control}
              aria-label="Rango de fechas de auditoría"
              aria-live="polite"
              renderAnchor={({ selected, onClick }) => (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onClick}
                  className="w-full"
                  aria-label={
                    selected.from && selected.to
                      ? `Desde ${selected.from.toLocaleDateString()} hasta ${selected.to.toLocaleDateString()}`
                      : 'Seleccionar rango de fechas'
                  }
                >
                  {selected.from
                    ? selected.from.toLocaleDateString()
                    : 'Desde'}{' '}
                  –{' '}
                  {selected.to
                    ? selected.to.toLocaleDateString()
                    : 'Hasta'}
                </Button>
              )}
            />
          )}
        />
        {errors.to && (
          <p className="text-sm text-red-600 mt-1">{errors.to.message}</p>
        )}
      </div>

      {/* Botón (sólo para accesibilidad de “submit” manual) */}
      <div className="col-span-1 flex items-end">
        <Button
          type="submit"
          variant="solid"
          size="sm"
          className="w-full"
          loading={isSubmitting}
          aria-disabled={isSubmitting}
        >
          Aplicar
        </Button>
      </div>

      {/* Aviso ARIA del rango seleccionado */}
      {(from || to) && (
        <div role="status" aria-live="polite" className="sr-only">
          {from && to
            ? `Filtrando desde ${from.toLocaleDateString()} hasta ${to.toLocaleDateString()}`
            : from
            ? `Filtrando desde ${from.toLocaleDateString()}`
            : to
            ? `Filtrando hasta ${to.toLocaleDateString()}`
            : ''}
        </div>
      )}
    </form>
  )
}

export default AuditFilter
