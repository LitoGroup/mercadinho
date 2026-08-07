'use client'

import Link from 'next/link'
import { useCart } from '@/components/cart-provider'

export function ShopHeader({
  userName,
  isAdmin,
  signOutAction,
}: {
  userName: string
  isAdmin: boolean
  signOutAction: () => Promise<void>
}) {
  const { count } = useCart()

  return (
    <header className="sticky top-0 z-10 border-b border-emerald-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-bold text-emerald-800">
          <span className="text-2xl">🛒</span>
          <span className="hidden sm:inline">Mercadinho</span>
        </Link>

        <nav className="flex items-center gap-1 text-sm sm:gap-3">
          <Link href="/pedidos" className="rounded-lg px-2 py-1.5 text-gray-600 hover:bg-emerald-50">
            Meus pedidos
          </Link>
          {isAdmin && (
            <Link href="/admin/pedidos" className="rounded-lg px-2 py-1.5 text-gray-600 hover:bg-emerald-50">
              Admin
            </Link>
          )}
          <Link
            href="/carrinho"
            className="relative rounded-lg bg-emerald-600 px-3 py-1.5 font-semibold text-white hover:bg-emerald-700"
          >
            Carrinho
            {count > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-400 px-1 text-xs font-bold text-amber-950">
                {count}
              </span>
            )}
          </Link>
          <form action={signOutAction}>
            <button
              type="submit"
              className="rounded-lg px-2 py-1.5 text-gray-400 hover:bg-gray-50 hover:text-gray-600"
              title={`Sair (${userName})`}
            >
              Sair
            </button>
          </form>
        </nav>
      </div>
    </header>
  )
}
