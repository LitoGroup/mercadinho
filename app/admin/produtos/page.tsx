import Link from 'next/link'
import { formatCents } from '@/lib/format'
import { createServerSupabase } from '@/lib/supabase/server'
import { productImageUrl } from '@/lib/storage'
import type { Product } from '@/lib/types'

export default async function AdminProductsPage() {
  const supabase = await createServerSupabase()
  const { data } = await supabase.from('products').select('*').order('name')
  const products = (data ?? []) as Product[]

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Produtos</h1>
        <Link
          href="/admin/produtos/novo"
          className="rounded-lg bg-feira px-4 py-2 font-semibold text-white hover:bg-feira-dark"
        >
          + Novo produto
        </Link>
      </div>

      {products.length === 0 ? (
        <p className="py-16 text-center text-gray-500">
          Nenhum produto ainda. Cadastre o primeiro!
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-500">
              <tr>
                <th className="p-3">Produto</th>
                <th className="p-3">Preço</th>
                <th className="p-3">Estoque</th>
                <th className="p-3">Status</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.map((p) => {
                const img = productImageUrl(p.image_path)
                return (
                  <tr key={p.id}>
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-100">
                          {img ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={img} alt="" className="h-full w-full object-cover" />
                          ) : (
                            '🛍️'
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{p.name}</p>
                          <p className="text-xs text-gray-400">{p.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 font-medium">{formatCents(p.price_cents)}</td>
                    <td className="p-3">
                      <span className={p.stock === 0 ? 'font-semibold text-red-600' : ''}>
                        {p.stock}
                      </span>
                    </td>
                    <td className="p-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                          p.active ? 'bg-feira/15 text-feira-dark' : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {p.active ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <Link
                        href={`/admin/produtos/${p.id}`}
                        className="font-medium text-feira-dark hover:underline"
                      >
                        Editar
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
