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

  if (
    active !== null &&
    active !== undefined &&
    active !== ''
  ) {
    params.active = active
  }

  const response =
    await api.get(
      '/api/platform/users',
      {
        params,
      }
    )

  return response.data
}

const getById = async (
  id
) => {
  const response =
    await api.get(
      `/api/platform/users/${id}`
    )

  return response.data
}

const create = async (
  data
) => {
  const response =
    await api.post(
      '/api/platform/users',
      data
    )

  return response.data
}

const update = async (
  id,
  data
) => {
  const response =
    await api.put(
      `/api/platform/users/${id}`,
      data
    )

  return response.data
}

const changeStatus = async (
  id,
  active
) => {
  const response =
    await api.patch(
      `/api/platform/users/${id}/status`,
      {
        active,
      }
    )

  return response.data
}

const remove = async (
  id
) => {
  await api.delete(
    `/api/platform/users/${id}`
  )
}

const platformUserService = {
  list,
  getById,
  create,
  update,
  changeStatus,
  remove,
}

export default platformUserService