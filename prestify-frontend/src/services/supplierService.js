import api from './api'

const list = async ({
  search = '',
  active = null,
  page = 0,
  size = 20,
} = {}) => {
  const params = {
    page,
    size,
  }

  const normalizedSearch = search?.trim()

  if (normalizedSearch) {
    params.search = normalizedSearch
  }

  if (active !== null) {
    params.active = active
  }

  const response = await api.get(
    '/api/suppliers',
    {
      params,
    }
  )

  return response.data
}

const getById = async (id) => {
  const response = await api.get(
    `/api/suppliers/${id}`
  )

  return response.data
}

const create = async (data) => {
  const response = await api.post(
    '/api/suppliers',
    normalizePayload(data)
  )

  return response.data
}

const update = async (
  id,
  data
) => {
  const response = await api.put(
    `/api/suppliers/${id}`,
    normalizePayload(data)
  )

  return response.data
}

const changeStatus = async (
  id,
  active
) => {
  const response = await api.patch(
    `/api/suppliers/${id}/status`,
    {
      active,
    }
  )

  return response.data
}

const normalizePayload = (data) => ({
  name: data.name?.trim() || '',

  document:
    data.document?.trim()
    || null,

  email:
    data.email?.trim()
    || null,

  phone:
    data.phone?.trim()
    || null,

  address:
    data.address?.trim()
    || null,

  notes:
    data.notes?.trim()
    || null,
})

const supplierService = {
  list,
  getById,
  create,
  update,
  changeStatus,
}

export default supplierService