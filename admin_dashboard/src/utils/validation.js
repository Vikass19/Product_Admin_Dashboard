export function validateLogin({ username, password }) {
  const errors = {}
  if (!username.trim()) errors.username = 'Username is required'
  if (!password) errors.password = 'Password is required'
  return errors
}