import { createBrowserClient } from "@supabase/ssr"

function cleanEnvVar(val?: string) {
  if (!val) return ''
  let cleaned = val.trim()
  if (cleaned.includes('https://')) {
    cleaned = cleaned.substring(cleaned.indexOf('https://'))
  } else if (cleaned.includes('eyJ')) {
    cleaned = cleaned.substring(cleaned.indexOf('eyJ'))
  }
  return cleaned
}

export function createClient() {
  const url = cleanEnvVar(process.env.NEXT_PUBLIC_SUPABASE_URL)
  const key = cleanEnvVar(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  
  if (!url || !key) {
    return null
  }
  return createBrowserClient(url, key)
}
