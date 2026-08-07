import { LogOut, Store } from 'lucide-react'
import Link from 'next/link'
import { signOut } from '@/app/actions/auth'
import { AdminBottomNav } from '@/components/admin-bottom-nav'
import { requireAdmin } from '@/lib/auth'

const NAV = [
  { href: '/admin/pedidos', label: 'Pedidos' },
  { href: '/admin/produtos', label: 'Produtos' },
  { href: '/admin/estoque', label: 'Estoque' },
  { href: '/admin/usuarios', label: 'Usuários' },
  { href: '/admin/config', label: 'Config' },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin()

  return (
    <div className="min-h-screen bg-cinza-claro">
      <header className="sticky top-0 z-10 bg-azul text-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-2 px-4 py-3">
          <Link href="/admin/pedidos" className="flex items-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-lito-branco.png" alt="Lito Aviation Academy" className="h-8 w-auto" />
            <span className="border-l border-white/20 pl-2.5 text-[10px] font-semibold uppercase leading-tight tracking-[0.18em] text-white/60">
              Mercadinho
              <br />
              <span className="text-verde">Gerência</span>
            </span>
          </Link>
          <nav className="flex items-center gap-1 text-sm">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="hidden whitespace-nowrap rounded-lg px-2.5 py-1.5 font-medium text-white/70 transition hover:bg-white/10 hover:text-white sm:block"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/"
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-white/50 transition hover:bg-white/10 hover:text-white"
              title="Ver loja"
            >
              <Store className="h-4 w-4" />
              <span className="hidden sm:inline">Ver loja</span>
            </Link>
            <form action={signOut}>
              <button
                type="submit"
                className="flex items-center rounded-lg p-2 text-white/50 transition hover:bg-white/10 hover:text-white"
                title="Sair"
                aria-label="Sair"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </form>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6 pb-28 sm:pb-6">{children}</main>
      <AdminBottomNav />
    </div>
  )
}
