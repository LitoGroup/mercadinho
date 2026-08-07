import 'server-only'
import { createClient } from '@supabase/supabase-js'

// Client com service role: ignora RLS. Usar SOMENTE em código de servidor
// já protegido por requireAdmin().
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  )
}
