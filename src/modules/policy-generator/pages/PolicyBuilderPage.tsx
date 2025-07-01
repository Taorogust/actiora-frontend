// src/pages/PolicyBuilderPage.tsx

import React, { useState, useMemo } from 'react'
import { useTemplates } from '@/hooks/useTemplates'
import { useGenerateDoc } from '@/hooks/useGenerateDoc'
import TemplateEditor from '@/components/TemplateEditor'
import DocPreview from '@/components/DocPreview'
import VersionHistory from '@/components/VersionHistory'
import { Template } from '@/services/policyService'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { toast } from 'react-toastify'

const PolicyBuilderPage: React.FC = () => {
  // 1️⃣ Gestión de plantillas
  const {
    templates,
    isLoading: loadingTemplates,
    isUpserting,
    upsertTemplate,
  } = useTemplates()

  // 2️⃣ Generación, verificación y descarga de documentos
  const {
    generate,
    document,
    isGenerating,
    generateError,
    verify,
    verifyResult,
    isVerifying,
    download,
    isDownloading,
  } = useGenerateDoc()

  // 3️⃣ Estado de la plantilla seleccionada
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)

  // 4️⃣ Extraer placeholders de la plantilla activa
  const placeholders = useMemo(() => {
    if (!selectedTemplate) return []
    const rx = /\{\{\s*([\w.]+)\s*\}\}/g
    return Array.from(
      new Set(
        Array.from(selectedTemplate.content.matchAll(rx)).map((m) => m[1])
      )
    )
  }, [selectedTemplate])

  // 5️⃣ Construir esquema Yup dinámico según placeholders
  const validationSchema = useMemo(() => {
    const shape: Record<string, any> = {}
    placeholders.forEach((key) => {
      shape[key] = Yup.string().required('Requerido')
    })
    return Yup.object().shape(shape)
  }, [placeholders])

  // 6️⃣ Handler tras guardar/crear plantilla
  const handleTemplateSaved = (tpl: Template) => {
    setSelectedTemplate(tpl)
    toast.info(`Plantilla "${tpl.name}" seleccionada`)
  }

  return (
    <div className="container mx-auto py-8 space-y-12">
      {/* ==== Selección y edición de plantilla ==== */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">1. Selecciona o crea tu plantilla</h2>
        {loadingTemplates ? (
          <p>Cargando plantillas…</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {templates.map((tpl) => (
              <button
                key={tpl.id}
                onClick={() => setSelectedTemplate(tpl)}
                className={`px-4 py-2 rounded ${
                  selectedTemplate?.id === tpl.id
                    ? 'bg-primary text-white'
                    : 'bg-gray-100'
                }`}
              >
                {tpl.name}
              </button>
            ))}
            <button
              onClick={() => setSelectedTemplate(null)}
              className="px-4 py-2 rounded bg-green-100"
            >
              + Nueva plantilla
            </button>
          </div>
        )}

        <TemplateEditor
          key={selectedTemplate?.id ?? 'new'}
          template={selectedTemplate ?? undefined}
          onSaved={handleTemplateSaved}
        />
      </section>

      {/* ==== Formulario dinámico de parámetros ==== */}
      {selectedTemplate && placeholders.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">2. Rellena parámetros</h2>
          <Formik
            initialValues={placeholders.reduce(
              (acc, key) => ({ ...acc, [key]: '' }),
              {}
            )}
            validationSchema={validationSchema}
            onSubmit={async (values) => {
              try {
                await generate(selectedTemplate.id, values)
              } catch {
                // el hook ya muestra toasts en onError
              }
            }}
          >
            {({ isValid, dirty }) => (
              <Form className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {placeholders.map((key) => (
                  <div key={key} className="flex flex-col">
                    <label className="font-medium">{key}</label>
                    <Field
                      name={key}
                      placeholder={`Introduce ${key}`}
                      className="form-input"
                    />
                    <ErrorMessage
                      name={key}
                      component="div"
                      className="text-red-500 text-sm"
                    />
                  </div>
                ))}
                <button
                  type="submit"
                  disabled={isGenerating || !isValid || !dirty}
                  className="btn btn-primary col-span-full w-max"
                >
                  {isGenerating ? 'Generando...' : 'Generar documento'}
                </button>
              </Form>
            )}
          </Formik>
        </section>
      )}
