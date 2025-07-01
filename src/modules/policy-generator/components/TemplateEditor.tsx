// src/components/TemplateEditor.tsx

import React, { useState, useMemo, useEffect, useCallback } from 'react'
import DOMPurify from 'dompurify'
import debounce from 'lodash.debounce'
import { Template } from '@/services/policyService'
import type { ZodError } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { upsertTemplate } from '@/services/policyService'
import { toast } from 'react-toastify'

interface TemplateEditorProps {
  /** Plantilla a editar; si no existe, creamos una nueva */
  template?: Template
  /** Tras guardar, podemos refrescar la lista o navegar */
  onSaved?: (tpl: Template) => void
}

const TemplateEditor: React.FC<TemplateEditorProps> = ({ template, onSaved }) => {
  const [name, setName] = useState(template?.name || '')
  const [content, setContent] = useState(template?.content || '')
  const [previewHtml, setPreviewHtml] = useState<string>('')

  /** Extraemos placeholders únicos del contenido */
  const placeholders = useMemo(() => {
    const rx = /\{\{\s*([\w.]+)\s*\}\}/g
    return Array.from(new Set(Array.from(content.matchAll(rx)).map(m => m[1])))
  }, [content])

  /** Genera un HTML de ejemplo reemplazando placeholders por badges */
  const buildPreview = useCallback(() => {
    let html = content
    placeholders.forEach((key) => {
      const badge = `<span class="inline-block bg-yellow-100 text-yellow-800 px-1 rounded">${key}</span>`
      html = html.replace(new RegExp(`\\{\\{\\s*${key.replace('.', '\\.')}\\s*\\}\\}`, 'g'), badge)
    })
    setPreviewHtml(DOMPurify.sanitize(html, { USE_PROFILES: { html: true } }))
  }, [content, placeholders])

  /** Debounce para no regenerar preview en cada pulsación */
  const debouncedBuild = useMemo(() => debounce(buildPreview, 300), [buildPreview])

  useEffect(() => {
    debouncedBuild()
    return () => { debouncedBuild.cancel() }
  }, [content, debouncedBuild])

  /** Mutación para crear/actualizar plantilla */
  const { mutateAsync, isLoading: isSaving } = useMutation(
    () => upsertTemplate({ id: template?.id, name, content }),
    {
      onSuccess: (tpl) => {
        toast.success(`Plantilla ${template?.id ? 'actualizada' : 'creada'} ✔️`)
        onSaved?.(tpl)
      },
      onError: (err: unknown) => {
        if ((err as ZodError).issues) {
          toast.error('Error de validación en el servidor.')
        } else {
          toast.error((err as Error).message)
        }
      }
    }
  )

  const handleSave = async () => {
    if (!name.trim() || !content.trim()) {
      toast.warn('El nombre y el contenido no pueden estar vacíos.')
      return
    }
    await mutateAsync()
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Editor */}
      <div className="flex flex-col space-y-4">
        <label className="text-sm font-medium text-gray-700">Nombre de la plantilla</label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          className="form-input block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary/50"
          placeholder="Ej: Política de privacidad"
          disabled={isSaving}
        />

        <label className="text-sm font-medium text-gray-700">Contenido (Jinja Template)</label>
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          rows={18}
          className="form-textarea block w-full rounded-md border-gray-300 font-mono text-sm shadow-sm focus:border-primary focus:ring focus:ring-primary/50"
          placeholder="Usa {{ userName }}, {{ date }}, etc."
          disabled={isSaving}
        />

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="btn btn-primary w-max px-6 py-2 rounded-md shadow hover:opacity-90 disabled:opacity-50"
        >
          {isSaving ? 'Guardando...' : (template?.id ? 'Actualizar plantilla' : 'Crear plantilla')}
        </button>
      </div>

      {/* Preview */}
      <div className="border border-gray-200 rounded-lg p-4 bg-white overflow-auto">
        <h3 className="text-lg font-semibold mb-3">Vista previa en tiempo real</h3>
        {previewHtml ? (
          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: previewHtml }} />
        ) : (
          <p className="text-gray-400 italic">¡Empieza a escribir tu plantilla para ver la vista previa aquí!</p>
        )}
      </div>
    </div>
  )
}

export default TemplateEditor
