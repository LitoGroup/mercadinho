import { ShoppingBag } from 'lucide-react'
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
        <h1 className="text-xl font-bold text-texto">Produtos</h1>
        <Link
          href="/admin/produtos/novo"
          className="rounded-lg bg-azul px-4 py-2 font-semibold text-white hover:bg-azul-claro"
        >
          + Novo produto
        </Link>
      </div>

      {products.length === 0 ? (
        <p className="py-16 text-center text-texto/50">
          Nenhum produto ainda. Cadastre o primeiro!
        </p>
      ) : (
        <>
          {/* Celular: cartões */}
          <ul className="space-y-3 sm:hidden">
            {products.map((p) => {
              const img = productImageUrl(p.image_path)
              return (
                <li key={p.id}>
                  <Link
                    href={`/admin/produtos/${p.id}`}
                    className={`flex items-center gap-3 rounded-xl border border-texto/8 bg-white p-3 shadow-sm active:bg-cinza-claro ${
                      p.active ? '' : 'opacity-60'
                    }`}
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-cinza-claro">
                      {img ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={img} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <ShoppingBag className="h-5 w-5 text-texto/25" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-texto">{p.name}</p>
                      <p className="text-xs text-texto/40">
                        {p.category}
                        {!p.active && ' · inativo'}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="font-semibold text-texto">{formatCents(p.price_cents)}</p>
                      <p
                        className={`text-xs ${
                          p.stock === 0 ? 'font-semibold text-erro-escuro' : 'text-texto/40'
                        }`}
                      >
                        {p.stock} em estoque
                      </p>
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>

          {/* Desktop: tabela */}
          <div className="hidden rounded-xl border border-texto/8 bg-white shadow-sm sm:block">
            <table className="w-full text-sm">
            <thead className="bg-cinza-claro text-left text-texto/50">
              <tr>
                <th className="p-3">Produto</th>
                <th className="p-3">Preço</th>
                <th className="p-3">Estoque</th>
                <th className="p-3">Status</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-texto/5">
              {products.map((p) => {
                const img = productImageUrl(p.image_path)
                return (
                  <tr key={p.id}>
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-cinza-claro">
                          {img ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={img} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <ShoppingBag className="h-4 w-4 text-texto/25" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-texto">{p.name}</p>
                          <p className="text-xs text-texto/40">{p.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 font-medium">{formatCents(p.price_cents)}</td>
                    <td className="p-3">
                      <span className={p.stock === 0 ? 'font-semibold text-erro-escuro' : ''}>
                        {p.stock}
                      </span>
                    </td>
                    <td className="p-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                          p.active ? 'bg-verde/15 text-azul' : 'bg-cinza-claro text-texto/50'
                        }`}
                      >
                        {p.active ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <Link
                        href={`/admin/produtos/${p.id}`}
                        className="font-medium text-azul hover:underline"
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
        </>
      )}
    </div>
  )
}
