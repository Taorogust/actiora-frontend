// src/layouts/demo4/layout.tsx
import React, { useEffect, lazy, Suspense } from 'react';
import { Helmet } from 'react-helmet-async';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useBodyClass } from '@/hooks/useBodyClass';
import { useMenu } from '@/hooks/useMenu';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useSettings } from '@/providers/settings-provider';
import { Container } from '@/components/common/container';
import ErrorBoundary from '@/components/common/ErrorBoundary';

// Prefetch and lazy-load subcomponents
const Header = lazy(() => import(/* webpackPrefetch: true */ './components/header'));
const Sidebar = lazy(() => import(/* webpackPrefetch: true */ './components/sidebar'));
const Toolbar = lazy(() => import(/* webpackPrefetch: true */ './components/toolbar'));
const Footer = lazy(() => import(/* webpackPrefetch: true */ './components/footer'));

export function Demo4Layout() {
  const { pathname } = useLocation();
  const { getBreadcrumb } = useMenu(pathname);
  const crumbs = getBreadcrumb();
  const currentTitle = crumbs.length > 0 ? crumbs[crumbs.length - 1].title : 'DataPort Wallet™';
  const isMobile = useIsMobile();
  const {
    setOption,
    options: { sidebarCollapsed, theme },
  } = useSettings();

  // Apply global classes and dynamic CSS variables
  useBodyClass(`
    bg-dp-gray-light
    lg:overflow-hidden
  `);

  // Persist selected layout
  useEffect(() => {
    setOption('layout', 'dataport4');
  }, [setOption]);

  // Reset scroll on route change
  useEffect(() => {
    const content = document.getElementById('page-content');
    content?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);

  // Inline CSS variables
  const rootStyles: React.CSSProperties = {
    '--header-height': '64px',
    '--sidebar-width': sidebarCollapsed ? '64px' : '280px',
    '--primary-color': theme.primary || '#005FCC',
  } as React.CSSProperties;

  return (
    <>
      <Helmet>
        <title>{currentTitle}</title>
        <meta name="description" content={`DataPort Wallet™ - ${currentTitle}`} />
        <html lang="en" />
      </Helmet>

      <a
        href="#page-content"
        className="sr-only focus:not-sr-only p-2 bg-white text-primary"
      >
        Skip to main content
      </a>

      <div className="flex h-screen" aria-labelledby="page-title" style={rootStyles}>
        {/* Sidebar */}
        <AnimatePresence>
          {!isMobile && (
            <motion.aside
              key="sidebar"
              initial={{ x: -Number(getComputedStyle(document.documentElement).getPropertyValue('--sidebar-width')) }}
              animate={{ x: 0 }}
              exit={{ x: -Number(getComputedStyle(document.documentElement).getPropertyValue('--sidebar-width')) }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              aria-label="Main navigation"
            >
              <ErrorBoundary fallback={<div className="p-4 animate-pulse bg-gray-200 h-full" />}>
                <Suspense fallback={<div className="p-4 animate-pulse bg-gray-200 h-full" />}>
                  <Sidebar />
                </Suspense>
              </ErrorBoundary>
            </motion.aside>
          )}
        </AnimatePresence>

        <div className="flex flex-1 flex-col">
          {/* Mobile Header */}
          {isMobile && (
            <motion.header
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <ErrorBoundary>
                <Suspense fallback={null}>
                  <Header />
                </Suspense>
              </ErrorBoundary>
            </motion.header>
          )}

          {/* Main Container */}
          <Container className="flex-1 flex flex-col p-0 lg:p-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex-1 flex flex-col bg-white rounded-2xl shadow-lg overflow-hidden"
            >
              {/* Toolbar */}
              <ErrorBoundary fallback={<div className="p-4 animate-pulse bg-gray-200" />}>
                <Suspense fallback={<div className="p-4 animate-pulse bg-gray-200" />}>
                  <Toolbar />
                </Suspense>
              </ErrorBoundary>

              {/* Page Content */}
              <motion.main
                id="page-content"
                tabIndex={-1}
                className="flex-1 overflow-y-auto px-6 py-4"
                role="main"
                aria-live="polite"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <ErrorBoundary>
                  <Suspense fallback={<div className="p-6 animate-pulse bg-gray-100 h-full" />}>
                    <Outlet />
                  </Suspense>
                </ErrorBoundary>
              </motion.main>

              {/* Footer */}
              <ErrorBoundary>
                <Suspense fallback={null}>
                  <Footer />
                </Suspense>
              </ErrorBoundary>
            </motion.div>
          </Container>
        </div>
      </div>
    </>
  );
}
