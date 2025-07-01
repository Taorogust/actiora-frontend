// src/routing/app-routing-setup.tsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { RequireAuth } from '@/auth/require-auth';
import { AuthRouting } from '@/auth/auth-routing';
import { ErrorRouting } from '@/pages/errors/error-routing';

// Import named export Demo4Layout
import { Demo4Layout } from '@/layouts/demo4/layout';

// Páginas principales
import DashboardPage from '@/pages/dashboard';

// Ruteo de cada módulo DataPort (crea estos archivos bajo src/modules/…)
import AdminRouting from '@/modules/admin/AdminRouting';
import EudiIssuerRouting from '@/modules/eudi-issuer/EudiIssuerRouting';
import EdgeAgentRouting from '@/modules/edge-agent/EdgeAgentRouting';
import AiCopilotRouting from '@/modules/ai/CopilotRouting';
import ConsentVaultRouting from '@/modules/consent-vault/ConsentVaultRouting';
import BillingRouting from '@/modules/billing/BillingRouting';
import ToolboxRouting from '@/modules/toolbox/ToolboxRouting';

export function AppRoutingSetup() {
  return (
    <Routes>
      {/* Rutas que requieren autenticación */}
      <Route element={<RequireAuth />}>
        <Route element={<Demo4Layout />}>
          {/* Redirige “/” a “/dashboard” */}
          <Route index element={<Navigate to="dashboard" replace />} />

          {/* Dashboard */}
          <Route path="dashboard" element={<DashboardPage />} />

          {/* Módulos DataPort */}
          <Route path="admin/*"          element={<AdminRouting />} />
          <Route path="eudi-issuer/*"   element={<EudiIssuerRouting />} />
          <Route path="edge-agent/*"    element={<EdgeAgentRouting />} />
          <Route path="ai/*"            element={<AiCopilotRouting />} />
          <Route path="consent-vault/*" element={<ConsentVaultRouting />} />
          <Route path="billing/*"       element={<BillingRouting />} />
          <Route path="toolbox/*"       element={<ToolboxRouting />} />

          {/* Cualquier otra ruta dentro de Demo4Layout redirige a Dashboard */}
          <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Route>
      </Route>

      {/* Rutas públicas */}
      <Route path="auth/*"  element={<AuthRouting />} />
      <Route path="error/*" element={<ErrorRouting />} />

      {/* Fallback global */}
      <Route path="*" element={<Navigate to="/error/404" replace />} />
    </Routes>
  );
}
