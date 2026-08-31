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
      '/api/products',
      {
        params,
      }
    )

  return response.data
}

const getById = async (id) => {
  const response =
    await api.get(
      `/api/products/${id}`
    )

  return response.data
}

const create = async (
  product
) => {
  const response =
    await api.post(
      '/api/products',
      normalizePayload(
        product
      )
    )

  return response.data
}

const update = async (
  id,
  product
) => {
  const response =
    await api.put(
      `/api/products/${id}`,
      normalizePayload(
        product
      )
    )

  return response.data
}

const changeStatus = async (
  id,
  active
) => {
  const response =
    await api.patch(
      `/api/products/${id}/status`,
      {
        active,
      }
    )

  return response.data
}

const normalizePayload = (
  product
) => ({
  name:
    product.name.trim(),

  sku:
    product.sku.trim(),

  description:
    product.description
      ?.trim() || null,

  salePrice:
    Number(
      product.salePrice
    ),

  costPrice:
    Number(
      product.costPrice
    ),

  unit:
    product.unit.trim(),

  minimumStock:
    Number(
      product.minimumStock
    ),
})

const productService = {
  list,
  getById,
  create,
  update,
  changeStatus,
}

export default productService