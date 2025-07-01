// src/components/common/export-menu.tsx
import { useState } from 'react';
import { Download } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

export function ExportMenu({ label = 'Exportar' }: { label?: string }) {
  const [formats] = useState(['CSV', 'XLSX', 'PDF']);

  const handleExport = (fmt: string) => {
    // Aquí implementa tu lógica real de exportación
    console.log(`Exportando como ${fmt}`);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Download className="h-4 w-4" /> {label}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40 bg-white dark:bg-gray-800 shadow-lg rounded-md">
        {formats.map(fmt => (
          <DropdownMenuItem
            key={fmt}
            className="px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
            onSelect={() => handleExport(fmt)}
          >
            {fmt}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
