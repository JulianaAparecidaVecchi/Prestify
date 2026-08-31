import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from 'react-router-dom'

import ProtectedRoute from './components/ProtectedRoute'

import AppLayout from './layouts/AppLayout'

import LoginPage from './pages/auth/LoginPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import ResetPasswordPage from './pages/auth/ResetPasswordPage'

import DashboardPage from './pages/dashboard/DashboardPage'
import AppointmentPage from './pages/appointments/AppointmentPage'

import ModulePlaceholderPage from './pages/common/ModulePlaceholderPage'

import authService from './services/authService'

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

        <Route
          element={
            <ProtectedRoute>
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
              <AppointmentPage />
            }
          />

          <Route
            path="/clientes"
            element={
              <ModulePlaceholderPage />
            }
          />

          <Route
            path="/servicos"
            element={
              <ModulePlaceholderPage />
            }
          />

          <Route
            path="/produtos"
            element={
              <ModulePlaceholderPage />
            }
          />

          <Route
            path="/estoque"
            element={
              <ModulePlaceholderPage />
            }
          />

          <Route
            path="/fornecedores"
            element={
              <ModulePlaceholderPage />
            }
          />

          <Route
            path="/financeiro"
            element={
              <ModulePlaceholderPage />
            }
          />

          <Route
            path="/relatorios"
            element={
              <ModulePlaceholderPage />
            }
          />

          <Route
            path="/usuarios"
            element={
              <ModulePlaceholderPage />
            }
          />

          <Route
            path="/configuracoes"
            element={
              <ModulePlaceholderPage />
            }
          />
        </Route>

        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App