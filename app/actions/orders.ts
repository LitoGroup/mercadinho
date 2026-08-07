'use server'

import { revalidatePath } from 'next/cache'
import { createServerSupabase } from '@/lib/supabase/server'

export interface PlaceOrderState {
  error?: string
  ok?: boolean
}

// O comprovante sobe direto do navegador para o bucket privado (RLS garante
// que cada usuário só escreve no próprio prefixo); aqui chega só o caminho.
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

  const receiptPath = String(formData.get('receipt_path') ?? '')
  if (!receiptPath) {
    return { error: 'Envie o comprovante do PIX (PDF ou imagem).' }
  }
  if (!receiptPath.startsWith(`${user.id}/`)) {
    return { error: 'Comprovante inválido. Tente novamente.' }
  }

  const { error: orderError } = await supabase.rpc('create_order', {
    p_items: items,
    p_receipt_path: receiptPath,
  })
  if (orderError) {
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
