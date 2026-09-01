import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from 'react-router-dom'

import ProtectedRoute
  from './components/ProtectedRoute'

import AppLayout
  from './layouts/AppLayout'

import LoginPage
  from './pages/auth/LoginPage'

import ForgotPasswordPage
  from './pages/auth/ForgotPasswordPage'

import ResetPasswordPage
  from './pages/auth/ResetPasswordPage'

import DashboardPage
  from './pages/dashboard/DashboardPage'

import AppointmentPage
  from './pages/appointments/AppointmentPage'

import ClientPage
  from './pages/clients/ClientPage'

import ServicePage
  from './pages/services/ServicePage'

import ProductPage
  from './pages/products/ProductPage'

import StockPage
  from './pages/stock/StockPage'

import SupplierPage
  from './pages/suppliers/SupplierPage'

import FinancialPage
  from './pages/financial/FinancialPage'

import ReportPage
  from './pages/reports/ReportPage'

import UserPage
  from './pages/users/UserPage'

import SettingsPage
  from './pages/settings/SettingsPage'

import PlatformDashboardPage
  from './pages/platform/PlatformDashboardPage'

import PlatformOrganizationsPage
  from './pages/platform/PlatformOrganizationsPage'

import PlatformSubscriptionsPage
  from './pages/platform/PlatformSubscriptionsPage'

import PlatformUsersPage
  from './pages/platform/PlatformUsersPage'

import authService
  from './services/authService'

const organizationRoles = [
  'OWNER',
  'ADMIN',
  'MANAGER',
  'EMPLOYEE',
]

function getAuthenticatedHome() {
  if (
    !authService
      .isAuthenticated()
  ) {
    return '/login'
  }

  const user =
    authService.getUser()

  if (
    user?.role ===
    'SUPER_ADMIN'
  ) {
    return '/platform'
  }

  return '/dashboard'
}

function ModuleRoute({
  module,
  children,
}) {
  if (
    !authService.hasModule(
      module
    )
  ) {
    return (
      <Navigate
        to="/dashboard"
        replace
      />
    )
  }

  return children
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <Navigate
              to={
                getAuthenticatedHome()
              }
              replace
            />
          }
        />

        <Route
          path="/login"
          element={
            <LoginPage />
          }
        />

        <Route
          path="/forgot-password"
          element={
            <ForgotPasswordPage />
          }
        />

        <Route
          path="/reset-password"
          element={
            <ResetPasswordPage />
          }
        />

        {/* ÁREA DA PLATAFORMA */}

        <Route
          element={
            <ProtectedRoute
              allowedRoles={[
                'SUPER_ADMIN',
              ]}
            >
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route
            path="/platform"
            element={
              <PlatformDashboardPage />
            }
          />

          <Route
            path="/platform/organizations"
            element={
              <PlatformOrganizationsPage />
            }
          />

          <Route
            path="/platform/subscriptions"
            element={
              <PlatformSubscriptionsPage />
            }
          />

          <Route
            path="/platform/users"
            element={
              <PlatformUsersPage />
            }
          />
        </Route>

        {/* ÁREA DAS EMPRESAS */}

        <Route
          element={
            <ProtectedRoute
              allowedRoles={
                organizationRoles
              }
            >
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route
            path="/dashboard"
            element={
              <DashboardPage />
            }
          />

          <Route
            path="/agenda"
            element={
              <ModuleRoute
                module="AGENDA"
              >
                <AppointmentPage />
              </ModuleRoute>
            }
          />

          <Route
            path="/clientes"
            element={
              <ModuleRoute
                module="CLIENTS"
              >
                <ClientPage />
              </ModuleRoute>
            }
          />

          <Route
            path="/servicos"
            element={
              <ModuleRoute
                module="SERVICES"
              >
                <ServicePage />
              </ModuleRoute>
            }
          />

          <Route
            path="/produtos"
            element={
              <ModuleRoute
                module="PRODUCTS"
              >
                <ProductPage />
              </ModuleRoute>
            }
          />

          <Route
            path="/estoque"
            element={
              <ModuleRoute
                module="STOCK"
              >
                <StockPage />
              </ModuleRoute>
            }
          />

          <Route
            path="/fornecedores"
            element={
              <ModuleRoute
                module="SUPPLIERS"
              >
                <SupplierPage />
              </ModuleRoute>
            }
          />

          <Route
            path="/financeiro"
            element={
              <ModuleRoute
                module="FINANCIAL"
              >
                <FinancialPage />
              </ModuleRoute>
            }
          />

          <Route
            path="/relatorios"
            element={
              <ModuleRoute
                module="REPORTS"
              >
                <ReportPage />
              </ModuleRoute>
            }
          />

          <Route
            path="/usuarios"
            element={
              <ModuleRoute
                module="USERS"
              >
                <UserPage />
              </ModuleRoute>
            }
          />

          <Route
            path="/configuracoes"
            element={
              <SettingsPage />
            }
          />
        </Route>

        <Route
          path="*"
          element={
            <Navigate
              to={
                getAuthenticatedHome()
              }
              replace
            />
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App