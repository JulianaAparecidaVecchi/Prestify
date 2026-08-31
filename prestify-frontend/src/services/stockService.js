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

  const normalizedSearch =
    search?.trim()

  if (normalizedSearch) {
    params.search =
      normalizedSearch
  }

  if (active !== null) {
    params.active =
      active
  }

  const response =
    await api.get(
      '/api/stocks',
      {
        params,
      }
    )

  return response.data
}

const getByProductId = async (
  productId
) => {
  const response =
    await api.get(
      `/api/stocks/product/${productId}`
    )

  return response.data
}

const move = async ({
  productId,
  type,
  quantity,
  reason,
}) => {
  const response =
    await api.post(
      '/api/stocks/movements',
      {
        productId:
          Number(productId),

        type,

        quantity:
          Number(quantity),

        reason:
          reason?.trim()
            || null,
      }
    )

  return response.data
}

const listMovements = async ({
  productId = null,
  type = null,
  start = null,
  end = null,
  page = 0,
  size = 20,
} = {}) => {
  const params = {
    page,
    size,
  }

  if (productId) {
    params.productId =
      Number(productId)
  }

  if (type) {
    params.type =
      type
  }

  if (start) {
    params.start =
      start
  }

  if (end) {
    params.end =
      end
  }

  const response =
    await api.get(
      '/api/stocks/movements',
      {
        params,
      }
    )

  return response.data
}

const stockService = {
  list,
  getByProductId,
  move,
  listMovements,
}

export default stockService