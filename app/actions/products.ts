'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { randomUUID } from 'node:crypto'
import { requireAdmin } from '@/lib/auth'
import { createServerSupabase } from '@/lib/supabase/server'

export async function adjustStock(
  productId: string,
  delta: number
): Promise<{ error?: string; stock?: number }> {
  await requireAdmin()
  const supabase = await createServerSupabase()

  const { data: product } = await supabase
    .from('products')
    .select('stock')
    .eq('id', productId)
    .single()
  if (!product) return { error: 'Produto não encontrado.' }

  const newStock = product.stock + delta
  if (newStock < 0) return { error: 'O estoque não pode ficar negativo.' }

  const { error } = await supabase
    .from('products')
    .update({ stock: newStock })
    .eq('id', productId)
  if (error) return { error: 'Não foi possível atualizar o estoque.' }

  revalidatePath('/admin/estoque')
  revalidatePath('/admin/produtos')
  revalidatePath('/')
  return { stock: newStock }
}

export async function setStock(
  productId: string,
  value: number
): Promise<{ error?: string; stock?: number }> {
  await requireAdmin()
  if (!Number.isInteger(value) || value < 0) return { error: 'Valor de estoque inválido.' }
  const supabase = await createServerSupabase()

  const { error } = await supabase
    .from('products')
    .update({ stock: value })
    .eq('id', productId)
  if (error) return { error: 'Não foi possível atualizar o estoque.' }

  revalidatePath('/admin/estoque')
  revalidatePath('/admin/produtos')
  revalidatePath('/')
  return { stock: value }
}

export interface SaveProductState {
  error?: string
}

export async function saveProduct(
  _prev: SaveProductState,
  formData: FormData
): Promise<SaveProductState> {
  const { profile } = await requireAdmin()
  const supabase = await createServerSupabase()

  const id = String(formData.get('id') ?? '')
  const name = String(formData.get('name') ?? '').trim()
  const description = String(formData.get('description') ?? '').trim()
  const category = String(formData.get('category') ?? '').trim() || 'Outros'
  const ean = String(formData.get('ean') ?? '').trim() || null
  const active = formData.get('active') === 'on'

  const priceReais = String(formData.get('price') ?? '').replace(/\./g, '').replace(',', '.')
  const priceCents = Math.round(Number(priceReais) * 100)
  const stock = Number(formData.get('stock') ?? 0)

  if (!name) return { error: 'Informe o nome do produto.' }
  if (!Number.isFinite(priceCents) || priceCents < 0) return { error: 'Preço inválido.' }
  if (!Number.isInteger(stock) || stock < 0) return { error: 'Estoque inválido.' }

  let imagePath: string | undefined
  const photo = formData.get('photo')
  if (photo instanceof File && photo.size > 0) {
    imagePath = `${randomUUID()}.jpg`
    const { error: uploadError } = await supabase.storage
      .from('products')
      .upload(imagePath, photo, { contentType: photo.type || 'image/jpeg' })
    if (uploadError) return { error: 'Falha ao enviar a foto do produto.' }
  }

  const fields = {
    name,
    description,
    category,
    ean,
    price_cents: priceCents,
    stock,
    active,
    ...(imagePath ? { image_path: imagePath } : {}),
  }

  if (id) {
    const { error } = await supabase.from('products').update(fields).eq('id', id)
    if (error) return { error: 'Não foi possível salvar o produto.' }
  } else {
    const { error } = await supabase
      .from('products')
      .insert({ ...fields, created_by: profile.id })
    if (error) return { error: 'Não foi possível criar o produto.' }
  }

  revalidatePath('/admin/produtos')
  revalidatePath('/')
  redirect('/admin/produtos')
}
