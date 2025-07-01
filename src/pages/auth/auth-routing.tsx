import { Navigate, Route, Routes } from 'react-router-dom';
import { authRoutes } from './auth-routes';
import { ThemeProvider } from '@/providers/theme-provider';
import { motion } from 'framer-motion';
import illustration from '@/assets/auth-illustration.svg';

/**
 * Handles all authentication related routes with branded layout, animations,
 * and illustration for a top-tier user experience.
 * Mounted at /auth/* in the main application router.
 */
export function AuthRouting() {
  return (
    <ThemeProvider>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="min-h-screen flex bg-auth-bg"
      >
        {/* Side illustration panel (hidden on small screens) */}
        <div className="hidden md:flex flex-1 items-center justify-center p-8 bg-brand-50">
          <img
            src={illustration}
            alt="Ilustración de autenticación"
            className="max-w-xs"
          />
        </div>

        {/* Auth forms container */}
        <div className="flex flex-1 items-center justify-center p-8">
          <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 120, duration: 0.5 }}
            className="w-full max-w-md bg-white p-6 rounded-2xl shadow-lg"
          >
            <Routes>
              {/* Redirect base /auth to signin */}
              <Route index element={<Navigate to="signin" replace />} />

              {authRoutes.map((route) => {
                const basePath = route.path?.replace('auth/', '') || '';
                return (
                  <Route key={route.path} path={basePath} element={route.element}>
                    {route.children?.map((child) => (
                      <Route
                        key={child.path}
                        path={child.path}
                        element={child.element}
                      />
                    ))}
                  </Route>
                );
              })}
            </Routes>
          </motion.div>
        </div>
      </motion.div>
    </ThemeProvider>
  );
}
