// src/modules/explainability/components/ExplanationViewer.tsx
import React, { useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ClipboardCopy } from 'lucide-react';
import { VisuallyHidden } from '@react-aria/utils';
import { useDPToast } from '@/components/common/toaster';

interface Props {
  text: string;
}

/**
 * Muestra la explicación IA formateada con Markdown,
 * permite copiarla al portapapeles y es totalmente accesible.
 */
export const ExplanationViewer: React.FC<Props> = ({ text }) => {
  const toast = useDPToast();

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Explicación copiada al portapapeles', { 
        position: 'top-right', 
        duration: 3000 
      });
    } catch (err) {
      toast.error('Error al copiar', { position: 'top-right', duration: 3000 });
    }
  }, [text, toast]);

  return (
    <section
      role="region"
      aria-label="Explicación en lenguaje natural"
      aria-live="polite"
      className="prose dark:prose-invert bg-white dark:bg-gray-900 p-6 rounded-lg shadow relative"
    >
      <VisuallyHidden>Explicación detallada del modelo</VisuallyHidden>

      {/* Botón para copiar toda la explicación */}
      <button
        onClick={handleCopy}
        aria-label="Copiar explicación al portapapeles"
        className="absolute top-4 right-4 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-dp-blue"
      >
        <ClipboardCopy className="w-5 h-5 text-gray-600 dark:text-gray-300" />
      </button>

      {/* Renderizado Markdown con soporte GFM */}
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ inline, children, className }) {
            return inline ? (
              <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">{children}</code>
            ) : (
              <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded overflow-auto">
                <code className={className}>{children}</code>
              </pre>
            );
          },
          a({ href, children }) {
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-dp-blue hover:underline"
              >
                {children}
              </a>
            );
          },
        }}
      >
        {text}
      </ReactMarkdown>
    </section>
  );
};
