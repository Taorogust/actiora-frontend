// src/modules/audit-log/components/ExportButtons.tsx
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Download as DownloadIcon, FileText } from 'lucide-react';
import type { AuditRecord } from '../types';
import { exportToCSV, exportToJSON } from '@/utils/export';

interface Props {
  records: AuditRecord[];
}

export const ExportButtons: React.FC<Props> = ({ records }) => {
  const [exporting, setExporting] = useState<'csv' | 'json' | null>(null);
  const [announce, setAnnounce] = useState<string | null>(null);
  const csvRef = useRef<HTMLButtonElement>(null);
  const jsonRef = useRef<HTMLButtonElement>(null);

  const handleCSV = async () => {
    setExporting('csv');
    try {
      exportToCSV(records, ['id', 'entity', 'entityId', 'timestamp', 'userId', 'modelVersion'], `audit-${Date.now()}.csv`);
      setAnnounce('CSV descargado');
    } catch {
      setAnnounce('Error al exportar CSV');
    } finally {
      setExporting(null);
      csvRef.current?.focus();
    }
  };

  const handleJSON = async () => {
    setExporting('json');
    try {
      exportToJSON(records, `audit-${Date.now()}.json`);
      setAnnounce('JSON descargado');
    } catch {
      setAnnounce('Error al exportar JSON');
    } finally {
      setExporting(null);
      jsonRef.current?.focus();
    }
  };

  return (
    <div className="flex gap-2">
      <Button
        ref={csvRef}
        onClick={handleCSV}
        variant="outline"
        size="sm"
        aria-label="Exportar registros como CSV"
        disabled={!!exporting}
      >
        {exporting === 'csv' ? (
          <span className="animate-spin block w-4 h-4" aria-hidden />
        ) : (
          <DownloadIcon className="w-4 h-4 mr-1" aria-hidden />
        )}
        CSV
      </Button>

      <Button
        ref={jsonRef}
        onClick={handleJSON}
        variant="outline"
        size="sm"
        aria-label="Exportar registros como JSON"
        disabled={!!exporting}
      >
        {exporting === 'json' ? (
          <span className="animate-spin block w-4 h-4" aria-hidden />
        ) : (
          <FileText className="w-4 h-4 mr-1" aria-hidden />
        )}
        JSON
      </Button>

      {/* Live region para lectores de pantalla */}
      {announce && (
        <div role="status" aria-live="assertive" className="sr-only">
          {announce}
        </div>
      )}
    </div>
  );
};

export default ExportButtons;
