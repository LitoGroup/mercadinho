import Link from 'next/link'
import { signOut } from '@/app/actions/auth'
import { requireAdmin } from '@/lib/auth'

const NAV = [
  { href: '/admin/pedidos', label: 'Pedidos' },
  { href: '/admin/produtos', label: 'Produtos' },
  { href: '/admin/usuarios', label: 'Usuários' },
  { href: '/admin/config', label: 'Config' },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin()

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-slate-900 text-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-2 overflow-x-auto px-4 py-3">
          <Link href="/admin/pedidos" className="whitespace-nowrap font-bold">
            🛒 Admin
          </Link>
          <nav className="flex items-center gap-1 text-sm">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="whitespace-nowrap rounded-lg px-2.5 py-1.5 hover:bg-slate-700"
              >
                {item.label}
              </Link>
            ))}
            <Link href="/" className="whitespace-nowrap rounded-lg px-2.5 py-1.5 text-slate-300 hover:bg-slate-700">
              Ver loja
            </Link>
            <form action={signOut}>
              <button type="submit" className="rounded-lg px-2.5 py-1.5 text-slate-300 hover:bg-slate-700">
                Sair
              </button>
            </form>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
    </div>
  )
}
