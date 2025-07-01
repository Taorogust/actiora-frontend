// src/layouts/demo4/components/header.tsx
import React, { useState, useEffect, useRef, memo, Suspense } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu as MenuIcon,
  X as CloseIcon,
  Settings as SettingsIcon,
  Search as SearchIcon,
  Globe,
  LogOut,
} from 'lucide-react';
import LogoDP from '@/assets/logo.png';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Popover } from '@/components/ui/popover';
import { Avatar } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { useSettings } from '@/providers/settings-provider';
import { useAuth } from '@/providers/auth-provider';
import NotificationsDropdown from '@/components/common/notifications-dropdown';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import { SidebarPrimary } from './sidebar-primary';
import { SidebarSecondary } from './sidebar-secondary';

interface HeaderProps {
  onMenuToggle?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuToggle }) => {
  const { pathname } = useLocation();
  const {
    options: { theme },
    setOption,
  } = useSettings();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);

  // Close overlays on route change
  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  // Focus search input when opened
  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  // Mock notifications
  const notifications = React.useMemo(
    () => [
      { id: 1, title: 'Transacción completada', time: '2m ago' },
      { id: 2, title: 'Solicitud revisión', time: '1h ago' },
    ],
    []
  );

  return (
    <motion.header
      className="fixed inset-x-0 top-0 z-30 flex items-center justify-between bg-white dark:bg-gray-900 shadow px-4 lg:px-6 h-[var(--header-height)]"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      {/* Left: Mobile toggle & Logo */}
      <div className="flex items-center space-x-4 lg:hidden">
        <Button
          variant="ghost"
          size="icon"
          aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
          onClick={() => {
            setMobileOpen(o => !o);
            onMenuToggle?.();
          }}
        >
          {mobileOpen ? <CloseIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
        </Button>
        <Link to="/dashboard" aria-label="Ir al Dashboard">
          <img src={LogoDP} alt="DataPort Wallet Logo" className="h-8 w-auto" />
        </Link>
      </div>

      {/* Desktop Logo */}
      <div className="hidden lg:flex items-center space-x-4">
        <Link to="/dashboard" aria-label="Ir al Dashboard">
          <img src={LogoDP} alt="DataPort Wallet Logo" className="h-8 w-auto" />
        </Link>
      </div>

      {/* Search */}
      <div className="flex-1 flex justify-center lg:justify-start px-4">
        <div className="relative">
          <Button
            variant="outline"
            size="icon"
            aria-label="Buscar"
            onClick={() => setSearchOpen(o => !o)}
          >
            <SearchIcon className="w-5 h-5" />
          </Button>
          <AnimatePresence>
            {searchOpen && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 240, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute left-10 top-0"
              >
                <Input
                  ref={searchRef}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Buscar en DataPort..."
                  aria-label="Campo de búsqueda"
                  className="w-full"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center space-x-4">
        {/* Theme */}
        <Popover>
          <Popover.Trigger asChild>
            <Button variant="ghost" size="icon" aria-label="Cambiar tema">
              <SettingsIcon className="w-5 h-5" />
            </Button>
          </Popover.Trigger>
          <Popover.Content side="bottom" align="end" className="p-2">
            <Button
              onClick={() => setOption('theme', theme === 'dark' ? 'light' : 'dark')}
              className="w-full"
            >
              Alternar tema
            </Button>
          </Popover.Content>
        </Popover>

        {/* Language */}
        <Popover>
          <Popover.Trigger asChild>
            <Button variant="ghost" size="icon" aria-label="Seleccionar idioma">
              <Globe className="w-5 h-5" />
            </Button>
          </Popover.Trigger>
          <Popover.Content side="bottom" align="end" className="p-2">
            <button className="block w-full text-left px-2 py-1 rounded hover:bg-gray-100">EN</button>
            <button className="block w-full text-left px-2 py-1 rounded hover:bg-gray-100">ES</button>
          </Popover.Content>
        </Popover>

        {/* Notifications */}
        <NotificationsDropdown notifications={notifications} />

        {/* Settings */}
        <Button as={Link} to="/settings" variant="ghost" size="icon" aria-label="Configuración">
          <SettingsIcon className="w-5 h-5" />
        </Button>

        {/* User */}
        <Popover>
          <Popover.Trigger asChild>
            <Avatar size="sm" src={user.avatarUrl} alt={user.name} />
          </Popover.Trigger>
          <Popover.Content side="bottom" align="end" className="w-48 p-2">
            <Link to="/profile" className="block px-2 py-1 rounded hover:bg-gray-100">
              Mi Perfil
            </Link>
            <Link to="/account" className="block px-2 py-1 rounded hover:bg-gray-100">
              Mi Cuenta
            </Link>
            <button
              onClick={logout}
              className="flex items-center w-full text-left px-2 py-1 rounded hover:bg-gray-100"
            >
              <LogOut className="mr-2 w-4 h-4" />Cerrar sesión
            </button>
          </Popover.Content>
        </Popover>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild><span /></SheetTrigger>
            <SheetContent side="left" className="w-[var(--sidebar-width)] p-0 bg-white dark:bg-gray-800">
              <div className="flex justify-end p-4">
                <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)}>
                  <CloseIcon className="w-6 h-6" />
                </Button>
              </div>
              <nav className="px-4 space-y-6" aria-label="Navegación principal móvil">
                <ErrorBoundary>
                  <Suspense fallback={<div className="animate-pulse h-4 bg-gray-200 rounded" />}>
                    <SidebarPrimary />
                  </Suspense>
                </ErrorBoundary>
                <ErrorBoundary>
                  <Suspense fallback={<div className="animate-pulse h-4 bg-gray-200 rounded" />}>
                    <SidebarSecondary />
                  </Suspense>
                </ErrorBoundary>
              </nav>
            </SheetContent>
          </Sheet>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default memo(Header);
