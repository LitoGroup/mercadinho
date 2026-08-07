import { notFound } from 'next/navigation'
import { ProductForm } from '@/components/product-form'
import { createServerSupabase } from '@/lib/supabase/server'
import { productImageUrl } from '@/lib/storage'
import type { Product } from '@/lib/types'

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createServerSupabase()
  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single<Product>()

  if (!product) notFound()

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold text-texto">Editar produto</h1>
      <ProductForm product={product} existingImageUrl={productImageUrl(product.image_path)} />
    </div>
  )
}
