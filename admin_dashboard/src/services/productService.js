import api from './axios'

export async function getProducts({ limit = 10, skip = 0, signal } = {}) {
  const { data } = await api.get('/products', {
    params: { limit, skip },
    signal,
  })
  return data
}