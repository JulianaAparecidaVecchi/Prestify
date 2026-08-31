import { Navigate } from 'react-router-dom'

import authService from '../services/authService'

function ProtectedRoute({
  children,
  allowedRoles,
}) {
  if (!authService.isAuthenticated()) {
    return (
      <Navigate
        to="/login"
        replace
      />
    )
  }

  const user =
    authService.getUser()

  if (!user) {
    authService.logout()

    return (
      <Navigate
        to="/login"
        replace
      />
    )
  }

  if (
    allowedRoles &&
    !allowedRoles.includes(user.role)
  ) {
    const destination =
      user.role === 'SUPER_ADMIN'
        ? '/platform'
        : '/dashboard'

    return (
      <Navigate
        to={destination}
        replace
      />
    )
  }

  return children
}

export default ProtectedRoute