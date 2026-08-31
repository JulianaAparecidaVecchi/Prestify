import api from './api'

const list = async ({
  search = '',
  page = 0,
  size = 10,
} = {}) => {
  const params = {
    search: search.trim(),
    page,
    size,
  }

  const response = await api.get(
    '/api/users',
    { params }
  )

  return response.data
}

const getById = async (id) => {
  const response = await api.get(
    `/api/users/${id}`
  )

  return response.data
}

const create = async (data) => {
  const response = await api.post(
    '/api/users',
    data
  )

  return response.data
}

const update = async (id, data) => {
  const response = await api.put(
    `/api/users/${id}`,
    data
  )

  return response.data
}

const changeStatus = async (
  id,
  active
) => {
  const response = await api.patch(
    `/api/users/${id}/status`,
    {
      active,
    }
  )

  return response.data
}

const userService = {
  list,
  getById,
  create,
  update,
  changeStatus,
}

export default userService