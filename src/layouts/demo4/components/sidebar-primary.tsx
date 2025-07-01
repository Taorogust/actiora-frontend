// src/layouts/demo4/components/sidebar-primary.tsx
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MENU_SIDEBAR } from '@/config/menu.config';
import { useSettings } from '@/providers/settings-provider';
import { classNames } from '@/utils/classNames';

/**
 * SidebarPrimary: renderiza la navegación principal (heading + items de nivel superior).
 */
export function SidebarPrimary() {
  const { pathname } = useLocation();
  const { options: { sidebarCollapsed } } = useSettings();

  // Determina si una ruta está activa
  const isActive = (path: string) => pathname.startsWith(path);

  return (
    <nav aria-label="Menú principal">
      {MENU_SIDEBAR.map(item => (
        'heading' in item ? (
          !sidebarCollapsed && (
            <div
              key={item.heading}
              className="mt-6 mb-2 px-4 text-xs font-semibold text-gray-500 uppercase"
            >
              {item.heading}
            </div>
          )
        ) : (
          <Link
            key={item.title}
            to={item.path}
            className={classNames(
              'flex items-center px-4 py-2 text-sm font-medium rounded transition-colors',
              isActive(item.path)
                ? 'bg-gray-200 text-gray-900'
                : 'text-gray-700 hover:bg-gray-100'
            )}
            aria-current={isActive(item.path) ? 'page' : undefined}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" aria-hidden />
            {!sidebarCollapsed && <span className="ml-3">{item.title}</span>}
          </Link>
        )
      ))}
    </nav>
  );
}