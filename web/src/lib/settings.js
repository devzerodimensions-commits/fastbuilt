import { useEffect, useState } from 'react'
import { apiUrl } from './api'

// Fallbacks so the site always renders even before/without the API.
export const SETTINGS_DEFAULTS = {
  site_title: 'Fastbuilt',
  tagline: 'PEB · Civil · Container Structures',
  contact_phone: '8347724798',
  contact_email: 'harshk@fastbuilt.in',
  contact_address: 'Gandhinagar, Gujarat',
  contact_linkedin: 'https://www.linkedin.com/company/fastbuiltenterprise/about/',
  favicon: '/favicon.ico',
}

let _cache = null
export async function fetchSettings() {
  if (_cache) return _cache
  try {
    const res = await fetch(apiUrl('/api/settings'))
    const data = await res.json()
    _cache = { ...SETTINGS_DEFAULTS, ...(data || {}) }
  } catch {
    _cache = { ...SETTINGS_DEFAULTS }
  }
  return _cache
}

// React hook — returns settings, filling in defaults immediately then live values.
export function useSettings() {
  const [s, setS] = useState(_cache || SETTINGS_DEFAULTS)
  useEffect(() => {
    let on = true
    fetchSettings().then((v) => on && setS(v))
    return () => { on = false }
  }, [])
  return s
}
