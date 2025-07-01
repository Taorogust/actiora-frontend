// src/layouts/demo4/components/sidebar-secondary.tsx
import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { MENU_SIDEBAR } from '@/config/menu.config';
import { useSettings } from '@/providers/settings-provider';
import { AnimatePresence, motion } from 'framer-motion';
import { classNames } from '@/utils/classNames';

/**
 * SidebarSecondary: renderiza el submenú del módulo activo.
 */
export function SidebarSecondary() {
  const { pathname } = useLocation();
  const { options: { sidebarCollapsed } } = useSettings();

  // Encuentra el item principal activo con children
  const activeSection = MENU_SIDEBAR.find(
    item => !('heading' in item) &&
      item.children?.some(child => pathname.startsWith(child.path))
  );
  if (!activeSection || !activeSection.children || sidebarCollapsed) return null;

  return (
    <AnimatePresence>
      <motion.ul
        key={activeSection.title}
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.2 }}
        className="mt-2 space-y-1 overflow-hidden"
        aria-label={`Submenú de ${activeSection.title}`}
      >
        {activeSection.children.map(child => (
          <li key={child.title}>
            <Link
              to={child.path}
              className={classNames(
                'block px-8 py-1 text-sm rounded transition-colors',
                pathname === child.path
                  ? 'bg-gray-200 text-gray-900'
                  : 'text-gray-600 hover:bg-gray-100'
              )}
              aria-current={pathname === child.path ? 'page' : undefined}
            >
              {child.title}
            </Link>
          </li>
        ))}
      </motion.ul>
    </AnimatePresence>
  );
}
