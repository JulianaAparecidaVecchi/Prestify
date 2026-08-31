import api from './api'

const list = async ({
  start,
  end,
  professionalId = null,
  status = null,
  page = 0,
  size = 100,
}) => {
  const params = {
    start,
    end,
    page,
    size,
  }

  if (professionalId) {
    params.professionalId = professionalId
  }

  if (status) {
    params.status = status
  }

  const response = await api.get(
    '/api/appointments',
    { params }
  )

  return response.data
}

const getById = async (id) => {
  const response = await api.get(
    `/api/appointments/${id}`
  )

  return response.data
}

const create = async ({
  clientId,
  serviceId,
  professionalId,
  startTime,
  notes,
}) => {
  const response = await api.post(
    '/api/appointments',
    {
      clientId,
      serviceId,
      professionalId,
      startTime,
      notes,
    }
  )

  return response.data
}

const update = async (
  id,
  {
    clientId,
    serviceId,
    professionalId,
    startTime,
    notes,
  }
) => {
  const response = await api.put(
    `/api/appointments/${id}`,
    {
      clientId,
      serviceId,
      professionalId,
      startTime,
      notes,
    }
  )

  return response.data
}

const changeStatus = async (
  id,
  status
) => {
  const response = await api.patch(
    `/api/appointments/${id}/status`,
    {
      status,
    }
  )

  return response.data
}

const remove = async (id) => {
  await api.delete(
    `/api/appointments/${id}`
  )
}

const listClients = async () => {
  const response = await api.get(
    '/api/clients',
    {
      params: {
        search: '',
        active: true,
        page: 0,
        size: 100,
      },
    }
  )

  return response.data.content || []
}

const listServices = async () => {
  const response = await api.get(
    '/api/services',
    {
      params: {
        search: '',
        active: true,
        page: 0,
        size: 100,
      },
    }
  )

  return response.data.content || []
}

const listProfessionals = async () => {
  const response = await api.get(
    '/api/users/professionals'
  )

  return response.data || []
}

const appointmentService = {
  list,
  getById,
  create,
  update,
  changeStatus,
  remove,
  listClients,
  listServices,
  listProfessionals,
}

export default appointmentService