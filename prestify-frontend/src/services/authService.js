import api from './api'

const login = async (email, password) => {
  const response = await api.post('/api/auth/login', {
    email,
    password,
  })

  return response.data
}

const forgotPassword = async (email) => {
  const response = await api.post(
    '/api/auth/forgot-password',
    {
      email,
    }
  )

  return response.data
}

const resetPassword = async (
  token,
  newPassword,
  confirmPassword
) => {
  const response = await api.post(
    '/api/auth/reset-password',
    {
      token,
      newPassword,
      confirmPassword,
    }
  )

  return response.data
}

const saveSession = (data, rememberMe) => {
  const storage = rememberMe
    ? localStorage
    : sessionStorage

  localStorage.removeItem('prestify_token')
  localStorage.removeItem('prestify_user')

  sessionStorage.removeItem('prestify_token')
  sessionStorage.removeItem('prestify_user')

  storage.setItem(
    'prestify_token',
    data.token
  )

  storage.setItem(
    'prestify_user',
    JSON.stringify({
      userId: data.userId,
      name: data.name,
      email: data.email,
      role: data.role,
      organizationId: data.organizationId,
      organizationName:
        data.organizationName,
    })
  )
}

const getToken = () => {
  return (
    localStorage.getItem(
      'prestify_token'
    ) ||
    sessionStorage.getItem(
      'prestify_token'
    )
  )
}

const getUser = () => {
  const user =
    localStorage.getItem(
      'prestify_user'
    ) ||
    sessionStorage.getItem(
      'prestify_user'
    )

  if (!user) {
    return null
  }

  try {
    return JSON.parse(user)
  } catch {
    return null
  }
}

const isAuthenticated = () => {
  return Boolean(getToken())
}

const logout = () => {
  localStorage.removeItem(
    'prestify_token'
  )

  localStorage.removeItem(
    'prestify_user'
  )

  sessionStorage.removeItem(
    'prestify_token'
  )

  sessionStorage.removeItem(
    'prestify_user'
  )
}

const authService = {
  login,
  forgotPassword,
  resetPassword,
  saveSession,
  getToken,
  getUser,
  isAuthenticated,
  logout,
}

export default authService