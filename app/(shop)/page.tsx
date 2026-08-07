import { ProductCard, type CatalogProduct } from '@/components/product-card'
import { createServerSupabase } from '@/lib/supabase/server'
import { productImageUrl } from '@/lib/storage'
import type { Product } from '@/lib/types'

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const supabase = await createServerSupabase()

  let query = supabase
    .from('products')
    .select('*')
    .eq('active', true)
    .gt('stock', 0)
    .order('name')

  if (q) {
    query = query.or(`name.ilike.%${q}%,category.ilike.%${q}%`)
  }

  const { data: products } = await query
  const catalog: CatalogProduct[] = (products as Product[] | null ?? []).map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    category: p.category,
    price_cents: p.price_cents,
    stock: p.stock,
    imageUrl: productImageUrl(p.image_path),
  }))

  return (
    <div>
      <form className="mb-5">
        <input
          type="search"
          name="q"
          defaultValue={q ?? ''}
          placeholder="Buscar produto ou categoria…"
          className="w-full rounded-xl border border-texto/10 bg-white px-4 py-2.5 shadow-sm focus:border-azul focus:outline-none"
        />
      </form>

      {catalog.length === 0 ? (
        <p className="py-16 text-center text-texto/50">
          {q ? 'Nenhum produto encontrado para essa busca.' : 'Nenhum produto disponível no momento.'}
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {catalog.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  )
}
