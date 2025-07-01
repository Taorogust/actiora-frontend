import {
  LayoutGrid,
  FileText,
  ScrollText,
  Book,
  UserCheck,
  Bell,
  CalendarCheck,
  ShieldCheck,
  HelpCircle,
} from 'lucide-react';
import { type MenuConfig } from './types';

export const MENU_SIDEBAR: MenuConfig = [
  {
    title: 'Dashboard',
    icon: LayoutGrid,
    path: '/dashboard',
  },
  {
    heading: 'DataPort Modules',
  },
  {
    title: 'Registro Inmutable',
    icon: FileText,
    path: '/audit-records',
  },
  {
    title: 'Generador de Políticas',
    icon: ScrollText,
    path: '/policies',
  },
  {
    title: 'Explicador IA',
    icon: Book,
    path: '/explain',
  },
  {
    title: 'Supervisión Humana',
    icon: UserCheck,
    path: '/review-tasks',
  },
  {
    title: 'Monitor de Incidencias',
    icon: Bell,
    path: '/incidents',
  },
  {
    title: 'Actualizador Normativo',
    icon: CalendarCheck,
    path: '/norm-updater',
  },
  {
    title: 'Panel de Cumplimiento',
    icon: ShieldCheck,
    path: '/compliance',
  },
];

// Compact sidebar uses the same structure without headings
export const MENU_SIDEBAR_COMPACT: MenuConfig = MENU_SIDEBAR.map(item =>
  'heading' in item ? { title: item.heading } : { ...item }
);

// Mega menu for wider layouts
export const MENU_MEGA: MenuConfig = [
  ...MENU_SIDEBAR,
  {
    heading: 'Help & Support',
  },
  {
    title: 'Documentation',
    icon: HelpCircle,
    path: '/docs',
  },
  {
    title: 'Community Support',
    icon: HelpCircle,
    path: 'https://support.dataport.ai',
  },
];

// Mobile mega menu same as mega
export const MENU_MEGA_MOBILE: MenuConfig = MENU_MEGA;

// Help menu for standalone help sections
export const MENU_HELP: MenuConfig = [
  {
    title: 'Documentation',
    icon: HelpCircle,
    path: '/docs',
  },
  {
    title: 'Support Center',
    icon: HelpCircle,
    path: 'https://support.dataport.ai',
  },
];

// Root quick links for header navigation
export const MENU_ROOT: MenuConfig = [
  {
    title: 'Dashboard',
    icon: LayoutGrid,
    rootPath: '/dashboard',
    path: '/dashboard',
    childrenIndex: 0,
  },
  {
    title: 'Audit Records',
    icon: FileText,
    rootPath: '/audit-records',
    path: '/audit-records',
    childrenIndex: 2,
  },
  {
    title: 'Policies',
    icon: ScrollText,
    rootPath: '/policies',
    path: '/policies',
    childrenIndex: 3,
  },
  {
    title: 'Compliance',
    icon: ShieldCheck,
    rootPath: '/compliance',
    path: '/compliance',
    childrenIndex: 9,
  },
];
