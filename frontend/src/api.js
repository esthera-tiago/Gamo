import { getToken } from './auth.js'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

async function request(method, path, body) {
  const headers = { 'Content-Type': 'application/json' }
  const token = getToken()
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const options = { method, headers }
  if (body) {
    options.body = JSON.stringify(body)
  }

  const res = await fetch(`${BASE_URL}${path}`, options)

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }))
    throw new Error(err.error || `HTTP ${res.status}`)
  }

  return res.json()
}

export function get(path) {
  return request('GET', path)
}

export function post(path, body) {
  return request('POST', path, body)
}
