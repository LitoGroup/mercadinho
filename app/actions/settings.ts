'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth'
import { createServerSupabase } from '@/lib/supabase/server'

export interface SaveSettingsState {
  error?: string
  ok?: boolean
}

export async function saveSettings(
  _prev: SaveSettingsState,
  formData: FormData
): Promise<SaveSettingsState> {
  await requireAdmin()

  const pix_key = String(formData.get('pix_key') ?? '').trim()
  const pix_key_type = String(formData.get('pix_key_type') ?? 'email')
  const merchant_name = String(formData.get('merchant_name') ?? '').trim()
  const merchant_city = String(formData.get('merchant_city') ?? '').trim()

  if (!pix_key) return { error: 'Informe a chave PIX.' }
  if (!merchant_name) return { error: 'Informe o nome da empresa.' }
  if (!merchant_city) return { error: 'Informe a cidade.' }

  const supabase = await createServerSupabase()
  const { error } = await supabase
    .from('settings')
    .update({ pix_key, pix_key_type, merchant_name, merchant_city, updated_at: new Date().toISOString() })
    .eq('id', 1)
  if (error) return { error: 'Não foi possível salvar as configurações.' }

  revalidatePath('/admin/config')
  revalidatePath('/checkout')
  return { ok: true }
}
