import React, { lazy, Suspense } from 'react';
import { RouteObject, Outlet } from 'react-router-dom';
import { ThemeProvider } from '@/providers/theme-provider';
import { BrandedLayout } from './layouts/branded';
import { ClassicLayout } from './layouts/classic';
import { CallbackPage } from './pages/callback-page';
import { motion } from 'framer-motion';
import LoadingSpinner from '@/components/common/LoadingSpinner';

// Lazy-loaded auth pages for optimal performance
const SignInPage = lazy(() => import('./pages/signin-page'));
const SignUpPage = lazy(() => import('./pages/signup-page'));
const ChangePasswordPage = lazy(() => import('./pages/change-password-page'));
const ResetPasswordPage = lazy(() => import('./pages/reset-password-page'));
const TwoFactorAuth = lazy(() => import('./pages/extended/tfa'));
const CheckEmail = lazy(() => import('./pages/extended/check-email'));
const ResetPasswordCheckEmail = lazy(() => import('./pages/extended/reset-password-check-email'));
const ResetPasswordChanged = lazy(() => import('./pages/extended/reset-password-changed'));

// Shared child routes for both branded and classic layouts
const childRoutes = [
  { path: 'signin', element: <SignInPage /> },
  { path: 'signup', element: <SignUpPage /> },
  { path: 'change-password', element: <ChangePasswordPage /> },
  { path: 'reset-password', element: <ResetPasswordPage /> },
  { path: '2fa', element: <TwoFactorAuth /> },
  { path: 'check-email', element: <CheckEmail /> },
  { path: 'reset-password/check-email', element: <ResetPasswordCheckEmail /> },
  { path: 'reset-password/changed', element: <ResetPasswordChanged /> },
];

// Factory to generate a RouteObject for a given layout prefix
function createLayoutRoute(
  prefix: string,
  LayoutComponent: React.FC<{ children: React.ReactNode }>,  // <-- comma instead of semicolon
): RouteObject {
  return {
    path: prefix,
    element: (
      <ThemeProvider>
        <LayoutComponent>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Suspense fallback={<LoadingSpinner />}>
              <Outlet />
            </Suspense>
          </motion.div>
        </LayoutComponent>
      </ThemeProvider>
    ),
    children: childRoutes.map(route => ({
      ...route,
      index: route.path === 'signin',
    })),
  };
}

// Exported authRoutes combining branded, classic, and callback
export const authRoutes: RouteObject[] = [
  // Branded layout at /auth/*
  createLayoutRoute('', BrandedLayout),
  // Classic layout at /auth/classic/*
  createLayoutRoute('classic', ClassicLayout),
  // OAuth callback (outside of themed layouts)
  {
    path: 'callback',
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        <CallbackPage />
      </Suspense>
    ),
  },
];
