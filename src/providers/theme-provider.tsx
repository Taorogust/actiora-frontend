'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { TooltipProvider } from '@/components/ui/tooltip';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Brand-aware ThemeProvider:
 * - Uses next-themes for persistent light/dark/system preferences
 * - Wraps children in TooltipProvider
 * - Adds smooth fade transition on theme change
 */
export function ThemeProvider({
  children,
}: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      storageKey="vite-theme"
      enableSystem
      disableTransitionOnChange
      enableColorScheme
      themes={["light", "dark", "brand-light", "brand-dark"]}
    >
      <AnimatePresence exitBeforeEnter>
        <motion.div
          key={document.documentElement.className}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="min-h-screen bg-background text-foreground transition-colors duration-300"
        >
          <TooltipProvider delayDuration={0}>
            {children}
          </TooltipProvider>
        </motion.div>
      </AnimatePresence>
    </NextThemesProvider>
  );
}
