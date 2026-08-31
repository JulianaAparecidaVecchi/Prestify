import axios from 'axios'

const AUTH_CHANGE_EVENT =
  'prestify-auth-change'

const api = axios.create({
  baseURL:
    import.meta.env
      .VITE_API_URL,

  headers: {
    'Content-Type':
      'application/json',
  },
})

const clearSession = () => {
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

  window.dispatchEvent(
    new Event(
      AUTH_CHANGE_EVENT
    )
  )
}

api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem(
        'prestify_token'
      ) ||
      sessionStorage.getItem(
        'prestify_token'
      )

    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`
    }

    return config
  },

  (error) =>
    Promise.reject(error)
)

api.interceptors.response.use(
  (response) => response,

  (error) => {
    const status =
      error.response?.status

    const requestUrl =
      error.config?.url || ''

    /*
     * Login pode retornar 401 por
     * credenciais incorretas.
     *
     * Nesse caso não queremos executar
     * a rotina global de sessão
     * expirada.
     */
    const isLoginRequest =
      requestUrl.includes(
        '/api/auth/login'
      )

    if (
      status === 401 &&
      !isLoginRequest
    ) {
      const hadToken =
        Boolean(
          localStorage.getItem(
            'prestify_token'
          ) ||
          sessionStorage.getItem(
            'prestify_token'
          )
        )

      if (hadToken) {
        clearSession()

        /*
         * Guardamos o motivo para a
         * tela de login poder informar
         * ao usuário o que aconteceu.
         */
        sessionStorage.setItem(
          'prestify_session_message',
          'Sua sessão expirou ou foi invalidada. Entre novamente.'
        )

        /*
         * Evita ficar preso em uma
         * página protegida.
         */
        if (
          window.location.pathname !==
          '/login'
        ) {
          window.location.replace(
            '/login'
          )
        }
      }
    }

    return Promise.reject(
      error
    )
  }
)

export default api