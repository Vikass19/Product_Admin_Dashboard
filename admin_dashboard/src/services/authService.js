import api from './axios'

export async function loginRequest({ username, password }) {
  const { data } = await api.post('/auth/login', {
    username: username.trim(),
    password,
    expiresInMins: 60,
  })
  return data // { accessToken, refreshToken, id, username, ... }
}

export async function getCurrentUser(signal) {
  const { data } = await api.get('/auth/me', { signal })
  return data
}