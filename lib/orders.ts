import 'server-only'
import { createServerSupabase } from '@/lib/supabase/server'

// URL assinada de curta duração para o comprovante (bucket privado).
export async function getReceiptUrl(path: string): Promise<string | null> {
  const supabase = await createServerSupabase()
  const { data } = await supabase.storage.from('receipts').createSignedUrl(path, 60)
  return data?.signedUrl ?? null
}
