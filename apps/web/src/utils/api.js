const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

// Ambil token dari Supabase session
async function getToken() {
  const { createClient } = await import('@supabase/supabase-js')
  const supabase = (await import('./supabase')).supabase
  const { data: { session } } = await supabase.auth.getSession()
  return session?.access_token || null
}

async function request(endpoint, options = {}) {
  const token = await getToken()
  
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}

export const api = {
  // Tasks
  getTasks: () => request('/tasks'),
  createTask: (data) => request('/tasks', { method: 'POST', body: JSON.stringify(data) }),
  updateTask: (id, data) => request(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteTask: (id) => request(`/tasks/${id}`, { method: 'DELETE' }),

  // Auth
  login: (email, password) => request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  }),
  register: (name, email, password) => request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  }),
}