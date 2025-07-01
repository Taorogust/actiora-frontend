// src/components/common/notifications-dropdown.tsx
import { useState } from 'react';
import { Bell } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

export function NotificationsDropdown() {
  const [notifications] = useState([
    { id: 1, text: 'Nuevo login en tu cuenta' },
    { id: 2, text: 'Pago recibido: $1,200' },
    { id: 3, text: 'Consentimiento aprobado' },
  ]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Notificaciones">
          <Bell className="h-6 w-6 text-gray-600" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72 bg-white dark:bg-gray-800 shadow-lg rounded-md">
        {notifications.map(n => (
          <DropdownMenuItem key={n.id} className="px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700">
            {n.text}
          </DropdownMenuItem>
        ))}
        {notifications.length === 0 && (
          <div className="px-4 py-2 text-sm text-gray-500">Sin notificaciones</div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
