// src/App.tsx
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { QueryClient, QueryClientProvider } from 'react-query';
import { DPToasterProvider } from '@/components/common/toaster';
import { SettingsProvider } from '@/providers/settings-provider';
import { ThemeProvider } from '@/providers/theme-provider';
import { I18nProvider } from '@/providers/i18n-provider';
import { AppRouting } from '@/routing/AppRouting';

export function App() {
  const queryClient = new QueryClient();
  const basename = import.meta.env.BASE_URL || '/';

  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <SettingsProvider>
          <ThemeProvider>
            <I18nProvider>
              <DPToasterProvider>
                <BrowserRouter basename={basename}>
                  <AppRouting />
                </BrowserRouter>
              </DPToasterProvider>
            </I18nProvider>
          </ThemeProvider>
        </SettingsProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}
