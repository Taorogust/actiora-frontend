// src/components/common/theme-switcher.tsx
'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sun, Moon } from 'lucide-react';

export function ThemeSwitcher({
  lightIcon,
  darkIcon,
  ...props
}: {
  lightIcon?: React.ReactNode;
  darkIcon?: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Al montar, leemos la preferencia del sistema o localStorage
  useEffect(() => {
    const stored = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (stored) {
      setTheme(stored);
      document.documentElement.classList.toggle('dark', stored === 'dark');
    } else {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(isDark ? 'dark' : 'light');
      document.documentElement.classList.toggle('dark', isDark);
    }
  }, []);

  const toggle = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    document.documentElement.classList.toggle('dark', next === 'dark');
    localStorage.setItem('theme', next);
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Alternar tema claro/oscuro"
      onClick={toggle}
      {...props}
    >
      {theme === 'light' ? darkIcon ?? <Moon className="h-5 w-5" /> : lightIcon ?? <Sun className="h-5 w-5" />}
    </Button>
  );
}
