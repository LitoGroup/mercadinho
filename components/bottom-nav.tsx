'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCart } from '@/components/cart-provider'

const TABS = [
  { href: '/', icon: '🏪', label: 'Loja' },
  { href: '/carrinho', icon: '🧺', label: 'Cesta' },
  { href: '/pedidos', icon: '📦', label: 'Pedidos' },
]

export function BottomNav() {
  const pathname = usePathname()
  const { count } = useCart()

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-20 border-t-2 border-cafe/10 bg-[#FFFDF8] pb-[env(safe-area-inset-bottom)] sm:hidden"
      aria-label="Navegação principal"
    >
      <div className="grid grid-cols-3">
        {TABS.map((tab) => {
          const active =
            tab.href === '/' ? pathname === '/' : pathname.startsWith(tab.href)
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`relative flex flex-col items-center gap-0.5 py-2 text-[11px] font-bold ${
                active ? 'text-feira-dark' : 'text-cafe/40'
              }`}
            >
              <span className={`text-2xl leading-none ${active ? '' : 'grayscale opacity-70'}`}>
                {tab.icon}
              </span>
              {tab.label}
              {tab.href === '/carrinho' && count > 0 && (
                <span className="absolute right-[calc(50%-26px)] top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-tomate px-1 text-[10px] font-bold text-white">
                  {count}
                </span>
              )}
              {active && (
                <span className="absolute inset-x-6 top-0 h-1 rounded-b-full bg-banana" />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
