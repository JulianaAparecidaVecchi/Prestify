import api from './api'

const getDashboard =
  async () => {
    const response =
      await api.get(
        '/api/platform/dashboard'
      )

    return response.data
  }

const platformDashboardService = {
  getDashboard,
}

export default platformDashboardService