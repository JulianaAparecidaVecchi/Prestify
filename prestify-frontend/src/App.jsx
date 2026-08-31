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

import ModulePlaceholderPage
  from './pages/common/ModulePlaceholderPage'

import authService
  from './services/authService'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <Navigate
              to={
                authService.isAuthenticated()
                  ? '/dashboard'
                  : '/login'
              }
              replace
            />
          }
        />

        <Route
          path="/login"
          element={<LoginPage />}
        />

        <Route
          path="/forgot-password"
          element={<ForgotPasswordPage />}
        />

        <Route
          path="/reset-password"
          element={<ResetPasswordPage />}
        />

        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route
            path="/dashboard"
            element={<DashboardPage />}
          />

          <Route
            path="/agenda"
            element={<AppointmentPage />}
          />

          <Route
            path="/clientes"
            element={<ClientPage />}
          />

          <Route
            path="/servicos"
            element={<ServicePage />}
          />

          <Route
            path="/produtos"
            element={<ProductPage />}
          />

          <Route
            path="/estoque"
            element={<StockPage />}
          />

          <Route
            path="/fornecedores"
            element={<SupplierPage />}
          />

          <Route
            path="/financeiro"
            element={<FinancialPage />}
          />

          <Route
            path="/relatorios"
            element={<ReportPage />}
          />

          <Route
            path="/usuarios"
            element={<ModulePlaceholderPage />}
          />

          <Route
            path="/configuracoes"
            element={<ModulePlaceholderPage />}
          />
        </Route>

        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App