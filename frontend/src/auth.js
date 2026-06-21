import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

let supabase = null
let currentToken = null

function getClient() {
  if (!supabase) {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn('Supabase not configured — running in guest mode')
      return null
    }
    supabase = createClient(supabaseUrl, supabaseAnonKey)
  }
  return supabase
}

export async function signInWithGoogle() {
  const client = getClient()
  if (!client) return
  const { error } = await client.auth.signInWithOAuth({ provider: 'google' })
  if (error) throw error
}

export async function signInWithEmail(email, password) {
  const client = getClient()
  if (!client) return
  const { data, error } = await client.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

export async function signUpWithEmail(email, password) {
  const client = getClient()
  if (!client) return
  const { data, error } = await client.auth.signUp({ email, password })
  if (error) throw error
  return data
}

export async function signOut() {
  const client = getClient()
  if (!client) return
  await client.auth.signOut()
  currentToken = null
}

export async function getSession() {
  const client = getClient()
  if (!client) return null
  const { data, error } = await client.auth.getSession()
  if (error) return null
  if (data?.session?.access_token) {
    currentToken = data.session.access_token
  }
  return data?.session || null
}

export function onAuthStateChange(callback) {
  const client = getClient()
  if (!client) {
    callback(null)
    return { unsubscribe: () => {} }
  }
  const { data } = client.auth.onAuthStateChange((event, session) => {
    if (session?.access_token) {
      currentToken = session.access_token
    } else {
      currentToken = null
    }
    callback(session)
  })
  return data
}

export function getToken() {
  return currentToken
}
