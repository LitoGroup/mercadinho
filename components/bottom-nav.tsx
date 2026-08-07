'use client'

import { ReceiptText, ShoppingBasket, Store } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCart } from '@/components/cart-provider'

const TABS = [
  { href: '/', icon: Store, label: 'Loja' },
  { href: '/carrinho', icon: ShoppingBasket, label: 'Carrinho' },
  { href: '/pedidos', icon: ReceiptText, label: 'Pedidos' },
]

export function BottomNav() {
  const pathname = usePathname()
  const { count } = useCart()

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-20 border-t border-cafe/8 bg-white pb-[env(safe-area-inset-bottom)] sm:hidden"
      aria-label="Navegação principal"
    >
      <div className="grid grid-cols-3">
        {TABS.map((tab) => {
          const active = tab.href === '/' ? pathname === '/' : pathname.startsWith(tab.href)
          const Icon = tab.icon
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`relative flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium ${
                active ? 'text-feira-dark' : 'text-cafe/35'
              }`}
            >
              <span className="relative">
                <Icon className="h-6 w-6" strokeWidth={active ? 2.2 : 1.8} />
                {tab.href === '/carrinho' && count > 0 && (
                  <span className="absolute -right-2.5 -top-1.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-feira px-1 text-[10px] font-bold text-white">
                    {count}
                  </span>
                )}
              </span>
              {tab.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
