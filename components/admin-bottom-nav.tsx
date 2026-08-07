'use client'

import { ClipboardList, Package, Settings, ShoppingBag, Users } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const TABS = [
  { href: '/admin/pedidos', icon: ClipboardList, label: 'Pedidos' },
  { href: '/admin/produtos', icon: ShoppingBag, label: 'Produtos' },
  { href: '/admin/estoque', icon: Package, label: 'Estoque' },
  { href: '/admin/usuarios', icon: Users, label: 'Usuários' },
  { href: '/admin/config', icon: Settings, label: 'Config' },
]

export function AdminBottomNav() {
  const pathname = usePathname()

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-20 border-t border-white/10 bg-cafe pb-[env(safe-area-inset-bottom)] sm:hidden"
      aria-label="Navegação da gerência"
    >
      <div className="grid grid-cols-5">
        {TABS.map((tab) => {
          const active = pathname.startsWith(tab.href)
          const Icon = tab.icon
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium ${
                active ? 'text-white' : 'text-white/35'
              }`}
            >
              <Icon className="h-5 w-5" strokeWidth={active ? 2.2 : 1.8} />
              {tab.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
