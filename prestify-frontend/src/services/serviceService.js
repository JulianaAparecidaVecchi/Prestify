import api from './api'

const list = async ({
  search = '',
  active = null,
  page = 0,
  size = 10,
} = {}) => {
  const params = {
    search,
    page,
    size,
  }

  if (active !== null) {
    params.active = active
  }

  const response = await api.get(
    '/api/services',
    {
      params,
    }
  )

  return response.data
}

const getById = async (id) => {
  const response = await api.get(
    `/api/services/${id}`
  )

  return response.data
}

const create = async (service) => {
  const response = await api.post(
    '/api/services',
    normalizePayload(service)
  )

  return response.data
}

const update = async (
  id,
  service
) => {
  const response = await api.put(
    `/api/services/${id}`,
    normalizePayload(service)
  )

  return response.data
}

const changeStatus = async (
  id,
  active
) => {
  const response = await api.patch(
    `/api/services/${id}/status`,
    {
      active,
    }
  )

  return response.data
}

const normalizePayload = (
  service
) => ({
  name:
    service.name.trim(),

  description:
    service.description
      ?.trim() || null,

  price:
    Number(
      service.price
    ),

  durationMinutes:
    Number(
      service.durationMinutes
    ),
})

const serviceService = {
  list,
  getById,
  create,
  update,
  changeStatus,
}

export default serviceService