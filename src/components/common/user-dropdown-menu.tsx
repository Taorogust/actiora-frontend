// src/components/common/user-dropdown-menu.tsx
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { LogOut, Settings, User as UserIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export interface UserDropdownMenuProps {
  user: {
    name: string;
    email: string;
    avatarUrl?: string;
  };
  onLogout: () => void;
}

export function UserDropdownMenu({ user, onLogout }: UserDropdownMenuProps) {
  const navigate = useNavigate();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Menú de usuario"
          className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-dp-blue"
        >
          <Avatar>
            {user.avatarUrl ? (
              <AvatarImage src={user.avatarUrl} alt={user.name} />
            ) : (
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            )}
          </Avatar>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-48 bg-white dark:bg-gray-900 rounded-md shadow-lg py-1"
      >
        <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {user.name}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {user.email}
          </p>
        </div>

        <DropdownMenuItem asChild>
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 px-4 py-2 text-sm"
            onClick={() => navigate('/profile')}
          >
            <UserIcon className="h-4 w-4" /> Perfil
          </Button>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 px-4 py-2 text-sm"
            onClick={() => navigate('/settings')}
          >
            <Settings className="h-4 w-4" /> Ajustes
          </Button>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 px-4 py-2 text-sm"
            onClick={onLogout}
          >
            <LogOut className="h-4 w-4" /> Cerrar sesión
          </Button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
