import api from './api'

const list = async ({
  search = '',
  type = '',
  status = '',
  startDate = '',
  endDate = '',
  page = 0,
  size = 20,
} = {}) => {
  const params = {
    page,
    size,
  }

  if (search.trim()) {
    params.search = search.trim()
  }

  if (type) {
    params.type = type
  }

  if (status) {
    params.status = status
  }

  if (startDate) {
    params.startDate = startDate
  }

  if (endDate) {
    params.endDate = endDate
  }

  const response = await api.get('/api/financial', {
    params,
  })

  return response.data
}

const getById = async (id) => {
  const response = await api.get(`/api/financial/${id}`)
  return response.data
}

const getSummary = async ({
  startDate = '',
  endDate = '',
} = {}) => {
  const params = {}

  if (startDate) {
    params.startDate = startDate
  }

  if (endDate) {
    params.endDate = endDate
  }

  const response = await api.get('/api/financial/summary', {
    params,
  })

  return response.data
}

const create = async (data) => {
  const response = await api.post('/api/financial', data)
  return response.data
}

const update = async (id, data) => {
  const response = await api.put(`/api/financial/${id}`, data)
  return response.data
}

const changeStatus = async (id, data) => {
  const response = await api.patch(
    `/api/financial/${id}/status`,
    data
  )

  return response.data
}

const getActiveClients = async () => {
  const response = await api.get('/api/clients', {
    params: {
      active: true,
      page: 0,
      size: 100,
    },
  })

  return response.data?.content || []
}

const getActiveSuppliers = async () => {
  const response = await api.get('/api/suppliers', {
    params: {
      active: true,
      page: 0,
      size: 100,
    },
  })

  return response.data?.content || []
}

const financialService = {
  list,
  getById,
  getSummary,
  create,
  update,
  changeStatus,
  getActiveClients,
  getActiveSuppliers,
}

export default financialService