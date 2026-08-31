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

  if (active !== null && active !== '') {
    params.active = active
  }

  const response = await api.get(
    '/api/platform/organizations',
    {
      params,
    }
  )

  return response.data
}

const getById = async (id) => {
  const response = await api.get(
    `/api/platform/organizations/${id}`
  )

  return response.data
}

const create = async (data) => {
  const response = await api.post(
    '/api/platform/organizations',
    data
  )

  return response.data
}

const update = async (id, data) => {
  const response = await api.put(
    `/api/platform/organizations/${id}`,
    data
  )

  return response.data
}

const changeStatus = async (
  id,
  active
) => {
  const response = await api.patch(
    `/api/platform/organizations/${id}/status`,
    {
      active,
    }
  )

  return response.data
}

const platformOrganizationService = {
  list,
  getById,
  create,
  update,
  changeStatus,
}

export default platformOrganizationService