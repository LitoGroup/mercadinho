'use server'

import { revalidatePath } from 'next/cache'
import { randomUUID } from 'node:crypto'
import { createServerSupabase } from '@/lib/supabase/server'

const ALLOWED_TYPES: Record<string, string> = {
  'application/pdf': 'pdf',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}
const MAX_SIZE = 10 * 1024 * 1024

export interface PlaceOrderState {
  error?: string
  ok?: boolean
}

export async function placeOrder(
  _prev: PlaceOrderState,
  formData: FormData
): Promise<PlaceOrderState> {
  const supabase = await createServerSupabase()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Sessão expirada. Entre novamente.' }

  let items: { product_id: string; quantity: number }[]
  try {
    items = JSON.parse(String(formData.get('items') ?? '[]'))
  } catch {
    return { error: 'Carrinho inválido. Recarregue a página.' }
  }
  if (!Array.isArray(items) || items.length === 0) {
    return { error: 'Seu carrinho está vazio.' }
  }

  const receipt = formData.get('receipt')
  if (!(receipt instanceof File) || receipt.size === 0) {
    return { error: 'Envie o comprovante do PIX (PDF ou imagem).' }
  }
  const ext = ALLOWED_TYPES[receipt.type]
  if (!ext) {
    return { error: 'Formato inválido. Envie PDF, JPG, PNG ou WebP.' }
  }
  if (receipt.size > MAX_SIZE) {
    return { error: 'Comprovante muito grande (máx. 10 MB).' }
  }

  const path = `${user.id}/${randomUUID()}.${ext}`
  const { error: uploadError } = await supabase.storage
    .from('receipts')
    .upload(path, receipt, { contentType: receipt.type })
  if (uploadError) {
    return { error: 'Falha ao enviar o comprovante. Tente novamente.' }
  }

  const { error: orderError } = await supabase.rpc('create_order', {
    p_items: items,
    p_receipt_path: path,
  })
  if (orderError) {
    await supabase.storage.from('receipts').remove([path])
    if (orderError.message.includes('estoque')) {
      return { error: 'Um dos produtos ficou sem estoque. Ajuste o carrinho e tente de novo.' }
    }
    return { error: 'Não foi possível registrar o pedido. Tente novamente.' }
  }

  revalidatePath('/')
  revalidatePath('/pedidos')
  return { ok: true }
}

export async function reviewOrder(
  orderId: string,
  approve: boolean,
  note: string
): Promise<{ error?: string }> {
  const supabase = await createServerSupabase()
  if (!approve && note.trim() === '') {
    return { error: 'Escreva o motivo da rejeição.' }
  }
  const { error } = await supabase.rpc('review_order', {
    p_order_id: orderId,
    p_approve: approve,
    p_note: note.trim() || null,
  })
  if (error) {
    return { error: error.message.includes('conferido') ? 'Este pedido já foi conferido.' : 'Não foi possível salvar a conferência.' }
  }
  revalidatePath('/admin/pedidos')
  revalidatePath(`/admin/pedidos/${orderId}`)
  return {}
}
