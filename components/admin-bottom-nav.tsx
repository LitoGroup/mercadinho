'use client'

import { ClipboardList, Package, ShoppingBag } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

// Três abas, não cinco: Pedidos, Estoque e Produtos são o trabalho do dia e
// ganham alvos maiores. Usuários e Configurações vivem no menu do cabeçalho,
// onde são procurados de vez em quando e não competem pelo polegar.
const TABS = [
  { href: '/admin/pedidos', icon: ClipboardList, label: 'Pedidos' },
  { href: '/admin/estoque', icon: Package, label: 'Estoque' },
  { href: '/admin/produtos', icon: ShoppingBag, label: 'Produtos' },
]

export function AdminBottomNav() {
  const pathname = usePathname()

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-20 border-t border-white/10 bg-azul pb-[env(safe-area-inset-bottom)] sm:hidden"
      aria-label="Navegação da gerência"
    >
      <div className="grid grid-cols-3">
        {TABS.map((tab) => {
          const active = pathname.startsWith(tab.href)
          const Icon = tab.icon
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={active ? 'page' : undefined}
              className={`flex min-h-14 flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-medium ${
                active ? 'text-verde' : 'text-white/40'
              }`}
            >
              <Icon className="h-6 w-6" strokeWidth={active ? 2.2 : 1.8} />
              {tab.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
