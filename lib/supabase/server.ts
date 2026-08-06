import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

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

// Cliente de leitura no servidor (usa a chave anônima + cookies).
export async function createClient() {
  const cookieStore = await cookies()
  const url = cleanEnvVar(process.env.NEXT_PUBLIC_SUPABASE_URL)
  const key = cleanEnvVar(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

  return createServerClient(url, key, {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            )
          } catch {
            // Chamado a partir de um Server Component — pode ser ignorado
            // quando há middleware atualizando a sessão.
          }
        },
      },
    },
  )
}
