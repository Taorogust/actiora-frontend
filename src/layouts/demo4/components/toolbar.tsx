// src/layouts/demo4/components/toolbar.tsx
import React, { useState, useEffect, ReactNode, memo, useMemo, Suspense } from 'react';
import { Container } from '@/components/common/container';
import { useMenu } from '@/hooks/useMenu';
import { Link, useLocation } from 'react-router-dom';
import { MENU_SIDEBAR } from '@/config/menu.config';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tooltip } from '@/components/ui/tooltip';
import { Popover } from '@/components/ui/popover';
import { DateRangePicker, DateRange } from '@/components/common/date-range-picker';
import { ExportMenu } from '@/components/common/export-menu';
import { NotificationsDropdown } from '@/components/common/notifications-dropdown';
import { ThemeSwitcher } from '@/components/common/theme-switcher';
import { Calendar, RefreshCw, HelpCircle, MoreHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';
import { HotKeys } from 'react-hotkeys';
import ErrorBoundary from '@/components/common/ErrorBoundary';

interface ToolbarProps {
  titleOverride?: ReactNode;
  description?: ReactNode;
  showDateFilter?: boolean;
  onDateRangeChange?: (range: DateRange) => void;
  extraActions?: ReactNode;
}

const keyMap = {
  REFRESH: 'ctrl+r',
  SEARCH: 'ctrl+f',
};

const handlers = {
  REFRESH: () => window.dispatchEvent(new Event('refresh-data')),
  SEARCH: () => document.getElementById('toolbar-search')?.focus(),
};

const Toolbar: React.FC<ToolbarProps> = ({
  titleOverride,
  description,
  showDateFilter = false,
  onDateRangeChange,
  extraActions,
}) => {
  const { pathname } = useLocation();
  const { getBreadcrumb, isActive } = useMenu(pathname);
  const crumbs = useMemo(() => getBreadcrumb(MENU_SIDEBAR), [pathname]);
  const pageTitle = titleOverride ?? crumbs.at(-1)?.title ?? 'DataPort';

  const [dateRange, setDateRange] = useState<DateRange>({});
  useEffect(() => {
    onDateRangeChange?.(dateRange);
  }, [dateRange, onDateRangeChange]);

  // Group overflow actions
  const [moreOpen, setMoreOpen] = useState(false);
  const mainActions = useMemo(() => [
    showDateFilter,
    extraActions,
    true, // search
    true, // notifications
    true, // export
    true, // refresh
    true, // theme
  ], [showDateFilter, extraActions]);

  return (
    <ErrorBoundary>
      <HotKeys keyMap={keyMap} handlers={handlers} style={{ outline: 'none' }}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          <Container
            as="section"
            aria-labelledby="toolbar-title"
            className="bg-white border-b border-gray-200 px-6 py-4"
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              {/* Left: Breadcrumbs & Title */}
              <div className="flex-1 space-y-1">
                <nav
                  aria-label="Breadcrumb"
                  className="flex items-center text-sm text-gray-500 space-x-2"
                >
                  {crumbs.map((crumb, idx) => (
                    <React.Fragment key={crumb.path || idx}>
                      {idx > 0 && <span aria-hidden className="text-gray-300">/</span>}
                      {crumb.path ? (
                        <Link
                          to={crumb.path}
                          className={
                            isActive(crumb.path)
                              ? 'font-medium text-gray-900'
                              : 'hover:text-gray-900'
                          }
                          aria-current={isActive(crumb.path) ? 'page' : undefined}
                        >
                          {crumb.title}
                        </Link>
                      ) : (
                        <span className="font-medium text-gray-900">{crumb.title}</span>
                      )}
                    </React.Fragment>
                  ))}
                </nav>
                <div className="flex items-center space-x-3">
                  <h1 id="toolbar-title" className="text-2xl font-semibold text-dp-blue">
                    {pageTitle}
                  </h1>
                  {description && <p className="text-gray-500">{description}</p>}
                  <Tooltip content="Ayuda">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Ayuda"
                      as={Link}
                      to="/help"
                    >
                      <HelpCircle className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                    </Button>
                  </Tooltip>
                </div>
              </div>

              {/* Right: Actions */}
              <div className="flex flex-wrap items-center gap-2 lg:gap-3">
                {/* Date filter */}
                {showDateFilter && (
                  <DateRangePicker
                    selected={dateRange}
                    onChange={(from, to) => setDateRange({ from, to })}
                    renderAnchor={({ selected, onClick }) => (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={onClick}
                        className="flex items-center gap-2"
                        aria-label="Seleccionar rango de fechas"
                      >
                        <Calendar className="h-4 w-4" />
                        <span className="text-sm whitespace-nowrap">
                          {selected.from
                            ? selected.from.toLocaleDateString()
                            : 'Desde'}
                          {' – '}
                          {selected.to
                            ? selected.to.toLocaleDateString()
                            : 'Hasta'}
                        </span>
                      </Button>
                    )}
                  />
                )}

                {/* Search */}
                <Input
                  id="toolbar-search"
                  placeholder="Buscar en DataPort…"
                  className="w-full max-w-xs"
                  type="search"
                  aria-label="Buscar"
                  onKeyDown={e => {
                    if (e.key === 'Enter') console.log('Search:', (e.target as HTMLInputElement).value);
                  }}
                />

                {/* Notifications */}
                <NotificationsDropdown />

                {/* Export menu */}
                <ExportMenu label="Exportar" />

                {/* Refresh */}
                <Tooltip content="Refrescar datos">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Refrescar datos"
                    onClick={handlers.REFRESH}
                  >
                    <RefreshCw className="w-5 h-5" />
                  </Button>
                </Tooltip>

                {/* Theme switcher */}
                <ThemeSwitcher aria-label="Alternar tema claro/oscuro" />

                {/* More actions dropdown on small */}
                <Popover>
                  <Popover.Trigger asChild>
                    <Button variant="ghost" size="icon" aria-label="Más acciones">
                      <MoreHorizontal className="w-5 h-5" />
                    </Button>
                  </Popover.Trigger>
                  <Popover.Content side="bottom" align="end" className="py-2">
                    {extraActions}
                  </Popover.Content>
                </Popover>
              </div>
            </div>
          </Container>
        </motion.div>
      </HotKeys>
    </ErrorBoundary>
  );
};

export default memo(Toolbar);
