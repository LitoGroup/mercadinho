'use client'

import { KeyRound, LogOut, MoreVertical, Receipt, Settings, Store, Users, X } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useCart } from '@/components/cart-provider'

// O admin também compra — por isso a loja é um ícone fixo aqui, a um toque de
// qualquer tela da gerência, e não um item escondido no menu. O selo mostra o
// carrinho em andamento: sem ele, quem larga a compra para conferir um pedido
// não tem sinal nenhum de que deixou algo pela metade.
//
// O menu recolhe o que saiu da barra inferior quando ela passou de cinco abas
// para três.
export function AdminHeaderActions({ signOutAction }: { signOutAction: () => Promise<void> }) {
  const { count } = useCart()
  const [aberto, setAberto] = useState(false)
  const fechar = () => setAberto(false)

  useEffect(() => {
    if (!aberto) return
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setAberto(false)
    }
    document.addEventListener('keydown', onEsc)
    return () => document.removeEventListener('keydown', onEsc)
  }, [aberto])

  return (
    <>
      <div className="flex items-center gap-1.5">
        <Link
          href="/"
          title="Ir às compras"
          aria-label={count > 0 ? `Ir às compras (${count} no carrinho)` : 'Ir às compras'}
          className="relative flex h-11 w-11 items-center justify-center rounded-lg text-white/60 transition hover:bg-white/10 hover:text-white"
        >
          <Store className="h-5 w-5" />
          {count > 0 && (
            <span className="absolute right-1 top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full border-2 border-azul bg-verde px-1 text-[10px] font-bold text-azul">
              {count}
            </span>
          )}
        </Link>

        <button
          type="button"
          onClick={() => setAberto((v) => !v)}
          aria-expanded={aberto}
          aria-label="Mais opções"
          className="flex h-11 w-11 items-center justify-center rounded-lg text-white/60 transition hover:bg-white/10 hover:text-white"
        >
          {aberto ? <X className="h-5 w-5" /> : <MoreVertical className="h-5 w-5" />}
        </button>
      </div>

      {aberto && (
        <>
          <button
            type="button"
            aria-label="Fechar menu"
            onClick={() => setAberto(false)}
            className="fixed inset-0 z-30 bg-texto/45"
          />
          <div className="fixed inset-x-0 bottom-0 z-40 rounded-t-2xl bg-white px-4 pb-5 pt-2.5 shadow-[0_-8px_32px_rgba(27,39,51,0.18)] sm:inset-x-auto sm:right-4 sm:top-16 sm:bottom-auto sm:w-72 sm:rounded-2xl">
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-texto/15 sm:hidden" />
            <nav className="flex flex-col">
              <MenuLink href="/admin/usuarios" icon={Users} label="Usuários" onNavigate={fechar} />
              <MenuLink href="/admin/config" icon={Settings} label="Configurações" onNavigate={fechar} />
              <MenuLink href="/senha" icon={KeyRound} label="Trocar senha" onNavigate={fechar} />
              <MenuLink href="/pedidos" icon={Receipt} label="Minhas compras" onNavigate={fechar} />
              <div className="my-2 h-px bg-texto/8" />
              <form action={signOutAction}>
                <button
                  type="submit"
                  className="flex h-14 w-full items-center gap-3.5 rounded-lg px-2 text-left font-semibold text-erro-escuro transition hover:bg-cinza-claro"
                >
                  <LogOut className="h-5 w-5" />
                  Sair
                </button>
              </form>
            </nav>
          </div>
        </>
      )}
    </>
  )
}

function MenuLink({
  href,
  icon: Icon,
  label,
  onNavigate,
}: {
  href: string
  icon: typeof Users
  label: string
  onNavigate: () => void
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className="flex h-14 items-center gap-3.5 rounded-lg px-2 font-semibold text-texto transition hover:bg-cinza-claro"
    >
      <Icon className="h-5 w-5 text-azul" />
      {label}
    </Link>
  )
}
