export function getUser() {
  try {
    const raw = localStorage.getItem('user')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function isAuthenticated() {
  return Boolean(localStorage.getItem('token'))
}

export function login(user) {
  localStorage.setItem('token', 'mock-jwt-token')
  localStorage.setItem('user', JSON.stringify(user))
}

export function logout() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}
