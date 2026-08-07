'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const TABS = [
  { href: '/admin/pedidos', icon: '🧾', label: 'Pedidos' },
  { href: '/admin/produtos', icon: '🥫', label: 'Produtos' },
  { href: '/admin/estoque', icon: '📦', label: 'Estoque' },
  { href: '/admin/usuarios', icon: '👥', label: 'Usuários' },
  { href: '/admin/config', icon: '⚙️', label: 'Config' },
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
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`relative flex flex-col items-center gap-0.5 py-2 text-[11px] font-bold ${
                active ? 'text-banana' : 'text-white/40'
              }`}
            >
              <span className={`text-2xl leading-none ${active ? '' : 'grayscale opacity-70'}`}>
                {tab.icon}
              </span>
              {tab.label}
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
