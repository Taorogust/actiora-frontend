// src/layouts/demo4/components/sidebar.tsx
import React, { useState, useEffect, memo, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MenuChevronDown, MenuChevronRight } from 'lucide-react';
import LogoDP from '@/assets/dataport-logo.svg';
import { MENU_SIDEBAR } from '@/config/menu.config';
import { Button } from '@/components/ui/button';
import { Tooltip } from '@/components/ui/tooltip';
import { useSettings } from '@/providers/settings-provider';
import { classNames } from '@/utils/classNames';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { options: { sidebarCollapsed }, setOption } = useSettings();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  // Toggle collapse in settings
  const toggleCollapse = useCallback(() => {
    setOption('sidebarCollapsed', !sidebarCollapsed);
  }, [sidebarCollapsed, setOption]);

  // Toggle submenu groups
  const toggleGroup = useCallback((title: string) => {
    setOpenGroups(prev => ({ ...prev, [title]: !prev[title] }));
  }, []);

  // Auto-open group with active route
  useEffect(() => {
    MENU_SIDEBAR.forEach(item => {
      if (!('heading' in item) && item.children) {
        const active = item.children.some(c => location.pathname.startsWith(c.path));
        if (active && !openGroups[item.title]) {
          setOpenGroups(prev => ({ ...prev, [item.title]: true }));
        }
      }
    });
  }, [location.pathname, openGroups]);

  return (
    <motion.aside
      role="navigation"
      aria-label="Navegación lateral"
      initial={false}
      animate={{ width: sidebarCollapsed ? 64 : 'var(--sidebar-width)' }}
      transition={{ type: 'spring', stiffness: 250, damping: 30 }}
      className={classNames(
        'hidden lg:flex flex-col fixed inset-y-0 left-0 z-20 bg-dp-gray-light border-r border-gray-200 overflow-hidden',
        'transition-width duration-300 ease-in-out'
      )}
    >
      {/* Brand & collapse control */}
      <div className="flex items-center justify-between p-4">
        {!sidebarCollapsed ? (
          <Link to="/dashboard" aria-label="Dashboard">
            <img src={LogoDP} alt="DataPort" className="h-8 w-auto" />
          </Link>
        ) : (
          <Tooltip content="Dashboard">
            <Link to="/dashboard" aria-label="Dashboard">
              <img src={LogoDP} alt="DP" className="h-6 w-auto" />
            </Link>
          </Tooltip>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleCollapse}
          aria-label={sidebarCollapsed ? 'Expandir menú' : 'Colapsar menú'}
        >
          {sidebarCollapsed ? <MenuChevronRight className="w-5 h-5" /> : <MenuChevronDown className="w-5 h-5" />}
        </Button>
      </div>

      {/* Navigation items */}
      <nav className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent" aria-label="Menú principal">
        {MENU_SIDEBAR.map(item => (
          'heading' in item ? (
            !sidebarCollapsed && (
              <div key={item.heading} className="mt-6 mb-2 px-4 text-xs font-semibold text-gray-500 uppercase">
                {item.heading}
              </div>
            )
          ) : (
            <div key={item.title} className="mb-1">
              <div className="flex items-center justify-between px-2">
                <Link
                  to={item.path}
                  className={classNames(
                    'flex items-center w-full py-2 rounded text-gray-800 hover:bg-gray-100',
                    location.pathname.startsWith(item.path) && 'bg-gray-200'
                  )}
                  aria-current={location.pathname.startsWith(item.path) ? 'page' : undefined}
                >
                  {sidebarCollapsed ? (
                    <Tooltip content={item.title}>
                      <item.icon className="w-6 h-6 mx-auto" />
                    </Tooltip>
                  ) : (
                    <>
                      <item.icon className="w-5 h-5" />
                      <span className="ml-3 text-sm font-medium">{item.title}</span>
                    </>
                  )}
                </Link>
                {!sidebarCollapsed && item.children && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleGroup(item.title)}
                    aria-expanded={openGroups[item.title] || false}
                    aria-controls={`group-${item.title}`}
                    className="p-1"
                  >
                    {openGroups[item.title] ? <MenuChevronDown className="w-4 h-4" /> : <MenuChevronRight className="w-4 h-4" />}
                  </Button>
                )}
              </div>
              {!sidebarCollapsed && item.children && (
                <AnimatePresence>
                  {openGroups[item.title] && (
                    <motion.ul
                      id={`group-${item.title}`}
                      initial="collapsed"
                      animate="open"
                      exit="collapsed"
                      variants={{
                        open: { opacity: 1, height: 'auto' },
                        collapsed: { opacity: 0, height: 0 },
                      }}
                      transition={{ duration: 0.2 }}
                      className="ml-8 mt-1 space-y-1"
                    >
                      {item.children.map(child => (
                        <li key={child.title}>
                          <Link
                            to={child.path}
                            className={classNames(
                              'block py-1 rounded text-sm text-gray-700 hover:bg-gray-100 px-2',
                              location.pathname === child.path && 'bg-gray-200'
                            )}
                          >
                            {child.title}
                          </Link>
                        </li>
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>
              )}
            </div>
          )
        ))}
      </nav>

      {/* Footer */}
      {!sidebarCollapsed && (
        <div className="p-4 text-xs text-gray-500 text-center">
          © {new Date().getFullYear()} DataPort
        </div>
      )}
    </motion.aside>
  );
};

export default memo(Sidebar);
