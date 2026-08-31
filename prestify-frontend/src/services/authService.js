import api from './api'

const AUTH_CHANGE_EVENT =
  'prestify-auth-change'

let syncStarted = false

const login = async (
  email,
  password
) => {
  const response =
    await api.post(
      '/api/auth/login',
      {
        email,
        password,
      }
    )

  return response.data
}

const forgotPassword = async (
  email
) => {
  const response =
    await api.post(
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
  const response =
    await api.post(
      '/api/auth/reset-password',
      {
        token,
        newPassword,
        confirmPassword,
      }
    )

  return response.data
}

const getCurrentSession =
  async () => {
    const response =
      await api.get(
        '/api/auth/me'
      )

    return response.data
  }

const notifyAuthChange = () => {
  window.dispatchEvent(
    new Event(
      AUTH_CHANGE_EVENT
    )
  )
}

const getCurrentStorage =
  () => {
    if (
      localStorage.getItem(
        'prestify_user'
      )
    ) {
      return localStorage
    }

    if (
      sessionStorage.getItem(
        'prestify_user'
      )
    ) {
      return sessionStorage
    }

    return null
  }

const saveSession = (
  data,
  rememberMe
) => {
  const storage =
    rememberMe
      ? localStorage
      : sessionStorage

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

  const enabledModules =
    Array.isArray(
      data.enabledModules
    )
      ? data.enabledModules
      : []

  storage.setItem(
    'prestify_token',
    data.token
  )

  storage.setItem(
    'prestify_user',
    JSON.stringify({
      userId:
        data.userId,

      name:
        data.name,

      email:
        data.email,

      role:
        data.role,

      organizationId:
        data.organizationId,

      organizationName:
        data.organizationName,

      enabledModules,
    })
  )

  notifyAuthChange()
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

const updateUser = (
  changes
) => {
  const storage =
    getCurrentStorage()

  if (!storage) {
    return null
  }

  const currentUser =
    getUser()

  if (!currentUser) {
    return null
  }

  const updatedUser = {
    ...currentUser,
    ...changes,
  }

  storage.setItem(
    'prestify_user',
    JSON.stringify(
      updatedUser
    )
  )

  notifyAuthChange()

  return updatedUser
}

const replaceUser = (
  userData
) => {
  const storage =
    getCurrentStorage()

  if (!storage) {
    return null
  }

  const enabledModules =
    Array.isArray(
      userData.enabledModules
    )
      ? userData.enabledModules
      : []

  const updatedUser = {
    userId:
      userData.userId,

    name:
      userData.name,

    email:
      userData.email,

    role:
      userData.role,

    organizationId:
      userData.organizationId,

    organizationName:
      userData.organizationName,

    enabledModules,
  }

  storage.setItem(
    'prestify_user',
    JSON.stringify(
      updatedUser
    )
  )

  notifyAuthChange()

  return updatedUser
}

const syncSession =
  async () => {
    if (!getToken()) {
      return null
    }

    try {
      const data =
        await getCurrentSession()

      return replaceUser(
        data
      )

    } catch (error) {
      /*
       * Um erro de rede não deve
       * desconectar o usuário.
       *
       * A invalidação de sessão por
       * 401 será tratada posteriormente
       * no interceptor global da API.
       */
      console.error(
        'Erro ao sincronizar sessão:',
        error
      )

      return null
    }
  }

const updateEnabledModules = (
  modules
) => {
  const normalizedModules =
    Array.isArray(modules)
      ? [...new Set(modules)]
      : []

  if (
    !normalizedModules.includes(
      'SERVICES'
    )
  ) {
    normalizedModules.push(
      'SERVICES'
    )
  }

  return updateUser({
    enabledModules:
      normalizedModules,
  })
}

const getEnabledModules =
  () => {
    const user =
      getUser()

    if (
      !user ||
      user.role ===
        'SUPER_ADMIN'
    ) {
      return []
    }

    if (
      !Array.isArray(
        user.enabledModules
      )
    ) {
      return []
    }

    return user.enabledModules
  }

const hasModule = (
  moduleName
) => {
  const user =
    getUser()

  if (!user) {
    return false
  }

  if (
    user.role ===
    'SUPER_ADMIN'
  ) {
    return false
  }

  if (
    moduleName ===
    'SERVICES'
  ) {
    return true
  }

  return getEnabledModules()
    .includes(
      moduleName
    )
}

const isAuthenticated =
  () => {
    return Boolean(
      getToken()
    )
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

  notifyAuthChange()
}

const handleWindowFocus =
  () => {
    if (
      isAuthenticated()
    ) {
      syncSession()
    }
  }

const handleVisibilityChange =
  () => {
    if (
      document.visibilityState ===
        'visible'
      &&
      isAuthenticated()
    ) {
      syncSession()
    }
  }

const startSessionSync =
  () => {
    if (syncStarted) {
      return
    }

    syncStarted = true

    /*
     * Consulta o backend assim que
     * alguma parte autenticada da
     * aplicação começa a escutar
     * mudanças na sessão.
     */
    if (
      isAuthenticated()
    ) {
      syncSession()
    }

    /*
     * Quando o usuário volta para
     * a janela do Prestify,
     * buscamos novamente plano,
     * organização, cargo e módulos.
     */
    window.addEventListener(
      'focus',
      handleWindowFocus
    )

    document.addEventListener(
      'visibilitychange',
      handleVisibilityChange
    )
  }

const subscribe = (
  callback
) => {
  startSessionSync()

  window.addEventListener(
    AUTH_CHANGE_EVENT,
    callback
  )

  return () => {
    window.removeEventListener(
      AUTH_CHANGE_EVENT,
      callback
    )
  }
}

const authService = {
  login,
  forgotPassword,
  resetPassword,

  getCurrentSession,
  syncSession,

  saveSession,
  getToken,
  getUser,

  updateUser,
  updateEnabledModules,

  getEnabledModules,
  hasModule,

  subscribe,

  isAuthenticated,
  logout,
}

export default authService