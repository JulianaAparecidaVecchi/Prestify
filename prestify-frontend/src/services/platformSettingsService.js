import api from './api'

const getSettings =
  async () => {
    const response =
      await api.get(
        '/api/platform/settings'
      )

    return response.data
  }

const updateSettings =
  async (data) => {
    const response =
      await api.put(
        '/api/platform/settings',
        data
      )

    return response.data
  }

const platformSettingsService = {
  getSettings,
  updateSettings,
}

export default platformSettingsService