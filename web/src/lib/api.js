// Central API helper for the admin dashboard + public data fetching.
const API_BASE = import.meta.env.VITE_API_URL || ''      // e.g. http://localhost:4000 (dev) or the deployed backend URL

export const apiUrl = (path) => `${API_BASE}${path}`

const TOKEN_KEY = 'fb_admin_token'
export const getToken = () => localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY)
// "Remember Me" -> persist in localStorage (survives browser close);
// otherwise sessionStorage (cleared when the browser/tab closes).
export const setToken = (t, remember = true) => {
  localStorage.removeItem(TOKEN_KEY); sessionStorage.removeItem(TOKEN_KEY)
  ;(remember ? localStorage : sessionStorage).setItem(TOKEN_KEY, t)
}
export const clearToken = () => { localStorage.removeItem(TOKEN_KEY); sessionStorage.removeItem(TOKEN_KEY) }
export const isLoggedIn = () => !!getToken()

async function request(path, { method = 'GET', body, auth = false } = {}) {
  const headers = {}
  if (body) headers['Content-Type'] = 'application/json'
  if (auth) headers.Authorization = `Bearer ${getToken()}`
  const res = await fetch(apiUrl(path), {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`)
  return data
}

// ---- auth ----
export async function login(username, password, remember = true) {
  const data = await request('/api/auth/login', { method: 'POST', body: { username, password } })
  setToken(data.token, remember)
  return data
}

// WordPress-style password recovery
export const forgotPassword = (identifier) =>
  request('/api/auth/forgot', { method: 'POST', body: { identifier } })
export const resetPassword = (token, password) =>
  request('/api/auth/reset', { method: 'POST', body: { token, password } })
export const authConfig = () => request('/api/auth/config')

// current user + self password change
export const fetchMe = () => request('/api/auth/me', { auth: true })
export const changePassword = (currentPassword, newPassword) =>
  request('/api/auth/change-password', { method: 'POST', body: { currentPassword, newPassword }, auth: true })

// site settings
export const getSettings = () => request('/api/settings')
export const saveSettings = (body) => request('/api/settings', { method: 'PUT', body, auth: true })

// ---- generic CRUD for a resource (projects / workers / team / users) ----
export const listItems = (resource, auth = false) => request(`/api/${resource}`, { auth })
export const createItem = (resource, body) => request(`/api/${resource}`, { method: 'POST', body, auth: true })
export const updateItem = (resource, id, body) => request(`/api/${resource}/${id}`, { method: 'PUT', body, auth: true })
export const deleteItem = (resource, id) => request(`/api/${resource}/${id}`, { method: 'DELETE', auth: true })

// ---- Cloudinary unsigned upload (optional; set the two env vars to enable) ----
export const cloudinaryConfigured = () =>
  !!(import.meta.env.VITE_CLOUDINARY_CLOUD_NAME && import.meta.env.VITE_CLOUDINARY_PRESET)

export async function uploadImage(file) {
  const cloud = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
  const preset = import.meta.env.VITE_CLOUDINARY_PRESET
  if (!cloud || !preset) throw new Error('Cloudinary not configured')
  const form = new FormData()
  form.append('file', file)
  form.append('upload_preset', preset)
  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/image/upload`, { method: 'POST', body: form })
  const data = await res.json()
  if (!res.ok || !data.secure_url) throw new Error(data.error?.message || 'Upload failed')
  return data.secure_url
}
