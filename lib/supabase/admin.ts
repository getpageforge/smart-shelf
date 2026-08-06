import { createClient } from "@supabase/supabase-js"

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

// Cliente administrativo com service role. USAR APENAS NO SERVIDOR.
// Ignora RLS e é usado para todas as escritas (ingestão de dispositivos
// e server actions do painel). Nunca importar em componentes de cliente.
export function createAdminClient() {
  const url = cleanEnvVar(process.env.NEXT_PUBLIC_SUPABASE_URL)
  const key = cleanEnvVar(process.env.SUPABASE_SERVICE_ROLE_KEY)

  if (!url || !key) {
    return null
  }
  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
