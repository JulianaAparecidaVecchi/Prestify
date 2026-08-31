import api from './api'

const getSummary = async (startDate, endDate) => {
  const response = await api.get('/api/reports/summary', {
    params: {
      startDate,
      endDate,
    },
  })

  return response.data
}

const getFinancialSeries = async (startDate, endDate) => {
  const response = await api.get('/api/reports/financial-series', {
    params: {
      startDate,
      endDate,
    },
  })

  return response.data
}

const reportService = {
  getSummary,
  getFinancialSeries,
}

export default reportService