// src/routing/AppRouting.tsx
import { useEffect, useState } from 'react';
import { useRoutes, Navigate, useLocation } from 'react-router-dom';
import { useLoadingBar } from 'react-top-loading-bar';
import { motion } from 'framer-motion';
import { useAuth } from '@/auth/context/auth-context';
import { authRoutes } from '@/pages/auth/auth-routes';
import { RequireAuth } from '@/pages/auth/require-auth';
import { RequireAdmin } from '@/pages/auth/require-admin';
import { DashboardPage } from '@/pages/dashboard/dashboard-page';
import { ProfilePage }   from '@/pages/profile/profile-page';
import { AdminDashboardPage } from '@/pages/admin/dashboard-page';
import { AdminUsersPage }     from '@/pages/admin/users-page';
import { NotFoundPage }  from '@/pages/not-found-page';

export function AppRouting() {
  const { start, complete } = useLoadingBar({
    color: 'var(--color-primary)',
    shadow: false,
    waitingTime: 400,
    transitionTime: 200,
    height: 2,
  });

  const { verify, loading: authLoading, setLoading } = useAuth();
  const [firstLoad, setFirstLoad] = useState(true);
  const [prevPath, setPrevPath] = useState('');
  const location = useLocation();
  const path = location.pathname;

  // Initial verification on first load
  useEffect(() => {
    if (firstLoad) {
      verify().finally(() => {
        setLoading(false);
        setFirstLoad(false);
      });
    }
  }, [verify, firstLoad, setLoading]);

  // On route change, show loading bar and re-verify
  useEffect(() => {
    if (!firstLoad) {
      start('static');
      verify()
        .catch(() => {
          console.error('User verify request failed!');
        })
        .finally(() => {
          complete();
          setPrevPath(path);
        });
    }
  }, [location, firstLoad, path, verify, start, complete]);

  // Scroll to top on navigation
  useEffect(() => {
    if (prevPath && prevPath !== path) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [prevPath, path]);

  // Define your route structure
  const routes = useRoutes([
    // 1) All /auth/* routes (signin, signup, reset-password, MFA, etc.)
    ...authRoutes,

    // 2) Protected app routes
    {
      path: '/',
      element: <RequireAuth />,
      children: [
        { index: true, element: <Navigate to="dashboard" replace /> },
        { path: 'dashboard', element: <DashboardPage /> },
        { path: 'profile',   element: <ProfilePage /> },
      ],
    },

    // 3) Admin routes under /admin/*
    {
      path: 'admin',
      element: <RequireAdmin />,
      children: [
        { index: true, element: <AdminDashboardPage /> },
        { path: 'users', element: <AdminUsersPage /> },
      ],
    },

    // 4) 404 fallback
    { path: '*', element: <NotFoundPage /> },
  ]);

  // While auth is loading, you could show a loader; RequireAuth covers this too
  if (authLoading) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-background"
    >
      {routes}
    </motion.div>
  );
}
