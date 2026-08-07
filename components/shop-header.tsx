'use client'

import Link from 'next/link'
import { useCart } from '@/components/cart-provider'
import { Awning } from '@/components/awning'

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
    <header className="sticky top-0 z-10 bg-[#FFFDF8] shadow-sm">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-2.5">
        <Link href="/" className="leading-none">
          <span className="block font-slab text-lg leading-none text-feira-dark">MERCADINHO</span>
          <span className="mt-0.5 inline-block -rotate-2 rounded bg-banana px-1.5 py-px font-slab text-[11px] leading-none text-cafe">
            DO LITO
          </span>
        </Link>

        <nav className="flex items-center gap-1 text-sm sm:gap-2">
          <span className="hidden text-cafe/50 md:inline">Oi, {firstName}!</span>
          <Link
            href="/pedidos"
            className="hidden rounded-lg px-2 py-1.5 font-medium text-cafe/70 hover:bg-creme sm:block"
          >
            Meus pedidos
          </Link>
          {isAdmin && (
            <Link
              href="/admin/pedidos"
              className="rounded-lg px-2 py-1.5 font-medium text-cafe/70 hover:bg-creme"
            >
              🔑 <span className="hidden sm:inline">Gerência</span>
            </Link>
          )}
          <Link
            href="/carrinho"
            className="relative hidden rounded-xl bg-tomate px-3 py-1.5 font-slab text-white shadow-[0_3px_0_0] shadow-tomate-dark transition hover:brightness-105 active:translate-y-0.5 active:shadow-none sm:block"
          >
            🧺
            <span className="ml-1 hidden sm:inline">Carrinho</span>
            {count > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-banana px-1 text-xs font-bold text-cafe">
                {count}
              </span>
            )}
          </Link>
          <form action={signOutAction}>
            <button
              type="submit"
              className="rounded-lg px-2 py-1.5 text-cafe/40 hover:bg-creme hover:text-cafe/70"
              title={`Sair (${userName})`}
            >
              Sair
            </button>
          </form>
        </nav>
      </div>
      <Awning />
    </header>
  )
}
