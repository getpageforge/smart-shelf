import { createClient } from "@supabase/supabase-js"

// Cliente administrativo com service role. USAR APENAS NO SERVIDOR.
// Ignora RLS e é usado para todas as escritas (ingestão de dispositivos
// e server actions do painel). Nunca importar em componentes de cliente.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  )
}
