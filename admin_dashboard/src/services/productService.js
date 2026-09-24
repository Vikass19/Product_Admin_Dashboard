import api from './axios'

// Shared by list, search and category requests
function buildListParams({ limit = 10, skip = 0, sortBy, order, q } = {}) {
  const params = { limit, skip }
  if (q) params.q = q
  if (sortBy) {
    params.sortBy = sortBy
    params.order = order === 'desc' ? 'desc' : 'asc'
  }
  return params
}

export async function getProducts({ limit, skip, sortBy, order, signal } = {}) {
  const { data } = await api.get('/products', {
    params: buildListParams({ limit, skip, sortBy, order }),
    signal,
  })
  return data // { products, total, skip, limit }
}

export async function searchProducts({ q, limit, skip, sortBy, order, signal } = {}) {
  const { data } = await api.get('/products/search', {
    params: buildListParams({ q, limit, skip, sortBy, order }),
    signal,
  })
  return data
}

export async function getProductsByCategory({
  category,
  limit,
  skip,
  sortBy,
  order,
  signal,
} = {}) {
  const { data } = await api.get(`/products/category/${encodeURIComponent(category)}`, {
    params: buildListParams({ limit, skip, sortBy, order }),
    signal,
  })
  return data
}

export async function getCategories(signal) {
  const { data } = await api.get('/products/categories', { signal })
  return data // [{ slug, name, url }, ...]
}

export async function getProductById(id, signal) {
  const { data } = await api.get(`/products/${id}`, { signal })
  return data
}

export async function getProductReviews(id, signal) {
  const product = await getProductById(id, signal)
  return product.reviews || []
}

// DummyJSON simulates these: the server responds but does not persist.
export async function createProduct(payload) {
  const { data } = await api.post('/products/add', payload)
  return data
}

export async function updateProduct(id, payload) {
  const { data } = await api.put(`/products/${id}`, payload)
  return data
}

export async function deleteProduct(id) {
  const { data } = await api.delete(`/products/${id}`)
  return data
}