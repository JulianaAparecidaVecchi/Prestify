import api from './api'

const list = async ({
  search = '',
  active = null,
  page = 0,
  size = 10,
}) => {
  const params = {
    search,
    page,
    size,
  }

  if (active !== null) {
    params.active = active
  }

  const response = await api.get(
    '/api/clients',
    {
      params,
    }
  )

  return response.data
}

const getById = async (id) => {
  const response = await api.get(
    `/api/clients/${id}`
  )

  return response.data
}

const create = async ({
  name,
  document,
  email,
  phone,
  birthDate,
  notes,
}) => {
  const response = await api.post(
    '/api/clients',
    {
      name,
      document:
        document || null,
      email:
        email || null,
      phone,
      birthDate:
        birthDate || null,
      notes:
        notes || null,
    }
  )

  return response.data
}

const update = async (
  id,
  {
    name,
    document,
    email,
    phone,
    birthDate,
    notes,
  }
) => {
  const response = await api.put(
    `/api/clients/${id}`,
    {
      name,
      document:
        document || null,
      email:
        email || null,
      phone,
      birthDate:
        birthDate || null,
      notes:
        notes || null,
    }
  )

  return response.data
}

const changeStatus = async (
  id,
  active
) => {
  const response = await api.patch(
    `/api/clients/${id}/status`,
    {
      active,
    }
  )

  return response.data
}

const remove = async (id) => {
  await api.delete(
    `/api/clients/${id}`
  )
}

const exportCsv = async ({
  search = '',
  active = null,
}) => {
  const params = {
    search,
  }

  if (active !== null) {
    params.active = active
  }

  const response = await api.get(
    '/api/clients/export/csv',
    {
      params,
      responseType: 'blob',
    }
  )

  downloadFile(
    response.data,
    'clientes.csv'
  )
}

const exportPdf = async ({
  search = '',
  active = null,
}) => {
  const params = {
    search,
  }

  if (active !== null) {
    params.active = active
  }

  const response = await api.get(
    '/api/clients/export/pdf',
    {
      params,
      responseType: 'blob',
    }
  )

  downloadFile(
    response.data,
    'clientes.pdf'
  )
}

const downloadFile = (
  blob,
  fileName
) => {
  const url =
    window.URL.createObjectURL(
      blob
    )

  const link =
    document.createElement('a')

  link.href = url
  link.download = fileName

  document.body.appendChild(
    link
  )

  link.click()

  document.body.removeChild(
    link
  )

  window.URL.revokeObjectURL(
    url
  )
}

const clientService = {
  list,
  getById,
  create,
  update,
  changeStatus,
  remove,
  exportCsv,
  exportPdf,
}

export default clientService