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
    <header className="sticky top-0 z-10 border-b border-texto/8 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="flex items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-lito.png" alt="Lito Aviation Academy" className="h-8 w-auto sm:h-9" />
          <span className="hidden border-l border-texto/15 pl-2.5 text-[10px] font-semibold uppercase leading-tight tracking-[0.18em] text-texto/45 sm:block">
            Mercadinho
            <br />
            do Lito
          </span>
        </Link>

        <nav className="flex items-center gap-1 text-sm sm:gap-2">
          <span className="hidden text-texto/40 md:inline">Olá, {firstName}</span>
          <Link
            href="/pedidos"
            className="hidden rounded-lg px-2.5 py-1.5 font-medium text-texto/70 transition hover:bg-cinza-claro sm:block"
          >
            Meus pedidos
          </Link>
          <Link
            href="/senha"
            className="hidden rounded-lg px-2.5 py-1.5 font-medium text-texto/70 transition hover:bg-cinza-claro sm:block"
          >
            Trocar senha
          </Link>
          {isAdmin && (
            <Link
              href="/admin/pedidos"
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 font-medium text-texto/70 transition hover:bg-cinza-claro"
              title="Gerência"
            >
              <KeyRound className="h-4 w-4" />
              <span className="hidden sm:inline">Gerência</span>
            </Link>
          )}
          <Link
            href="/carrinho"
            className="relative hidden items-center gap-2 rounded-lg bg-azul px-3.5 py-2 font-semibold text-white transition hover:bg-azul-claro sm:flex"
          >
            <ShoppingBasket className="h-4 w-4 text-verde" />
            Carrinho
            {count > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-verde px-1 text-xs font-bold text-azul">
                {count}
              </span>
            )}
          </Link>
          <form action={signOutAction}>
            <button
              type="submit"
              className="flex items-center rounded-lg p-2 text-texto/35 transition hover:bg-cinza-claro hover:text-texto/70"
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
