import api from './api'

import authService
  from './authService'

const getSettings =
  async () => {
    const response =
      await api.get(
        '/api/settings'
      )

    return response.data
  }

const updateOrganization =
  async (data) => {
    const response =
      await api.put(
        '/api/settings/organization',
        data
      )

    /*
     * Atualiza o nome da organização
     * salvo na sessão.
     *
     * Isso faz o AppLayout atualizar
     * o nome da empresa imediatamente.
     */
    if (
      response.data?.name
    ) {
      authService.updateUser({
        organizationName:
          response.data.name,
      })
    }

    return response.data
  }

const updateModules =
  async (modules) => {
    const response =
      await api.put(
        '/api/settings/modules',
        {
          modules,
        }
      )

    /*
     * Utiliza a lista devolvida
     * pelo backend.
     *
     * O backend é responsável por
     * validar quais módulos realmente
     * podem ser utilizados.
     */
    const updatedModules =
      Array.isArray(
        response.data
          ?.enabledModules
      )
        ? response.data
            .enabledModules
        : modules

    authService
      .updateEnabledModules(
        updatedModules
      )

    return response.data
  }

const getBilling =
  async () => {
    const response =
      await api.get(
        '/api/settings/billing'
      )

    return response.data
  }

const updateBilling =
  async (data) => {
    /*
     * Primeiro alteramos o plano
     * e/ou ciclo de faturamento.
     */
    const response =
      await api.put(
        '/api/settings/billing',
        data
      )

    /*
     * A mudança de plano pode alterar
     * os módulos disponíveis.
     *
     * Por isso buscamos novamente as
     * configurações da organização.
     */
    const settingsResponse =
      await api.get(
        '/api/settings'
      )

    const enabledModules =
      Array.isArray(
        settingsResponse
          .data
          ?.enabledModules
      )
        ? settingsResponse
            .data
            .enabledModules
        : []

    /*
     * Atualiza os módulos armazenados
     * no usuário da sessão.
     *
     * authService dispara o evento
     * prestify-auth-change.
     *
     * O AppLayout já escuta esse evento,
     * portanto a sidebar é atualizada
     * imediatamente.
     */
    authService
      .updateEnabledModules(
        enabledModules
      )

    return response.data
  }

const getSystemSettings =
  async () => {
    const response =
      await api.get(
        '/api/settings/system'
      )

    return response.data
  }

const updateSystemSettings =
  async (data) => {
    const response =
      await api.put(
        '/api/settings/system',
        data
      )

    return response.data
  }

const settingsService = {
  getSettings,
  updateOrganization,
  updateModules,
  getBilling,
  updateBilling,
  getSystemSettings,
  updateSystemSettings,
}

export default settingsService