'use client'

import { KeyRound, LogOut, ShoppingBasket } from 'lucide-react'
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
  const firstName = userName.split(' ')[0]

  return (
    <header className="sticky top-0 z-10 border-b border-cafe/8 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
        <Link
          href="/"
          className="text-sm font-bold uppercase leading-none tracking-[0.08em] text-feira sm:text-base"
        >
          Mercadinho <span className="rounded bg-feira px-1.5 py-0.5 text-menta">do Lito</span>
        </Link>

        <nav className="flex items-center gap-1 text-sm sm:gap-2">
          <span className="hidden text-cafe/40 md:inline">Olá, {firstName}</span>
          <Link
            href="/pedidos"
            className="hidden rounded-lg px-2.5 py-1.5 font-medium text-cafe/70 transition hover:bg-creme sm:block"
          >
            Meus pedidos
          </Link>
          <Link
            href="/senha"
            className="hidden rounded-lg px-2.5 py-1.5 font-medium text-cafe/70 transition hover:bg-creme sm:block"
          >
            Trocar senha
          </Link>
          {isAdmin && (
            <Link
              href="/admin/pedidos"
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 font-medium text-cafe/70 transition hover:bg-creme"
              title="Gerência"
            >
              <KeyRound className="h-4 w-4" />
              <span className="hidden sm:inline">Gerência</span>
            </Link>
          )}
          <Link
            href="/carrinho"
            className="relative hidden items-center gap-2 rounded-lg bg-feira px-3.5 py-2 font-semibold text-white transition hover:bg-feira-dark sm:flex"
          >
            <ShoppingBasket className="h-4 w-4 text-menta" />
            Carrinho
            {count > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-menta px-1 text-xs font-bold text-feira-dark">
                {count}
              </span>
            )}
          </Link>
          <form action={signOutAction}>
            <button
              type="submit"
              className="flex items-center rounded-lg p-2 text-cafe/35 transition hover:bg-creme hover:text-cafe/70"
              title={`Sair (${userName})`}
              aria-label="Sair"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </form>
        </nav>
      </div>
    </header>
  )
}
