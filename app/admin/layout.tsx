import Link from 'next/link'
import { signOut } from '@/app/actions/auth'
import { Awning } from '@/components/awning'
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
    <div className="min-h-screen bg-creme">
      <header className="sticky top-0 z-10 bg-cafe text-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-2 overflow-x-auto px-4 py-2.5">
          <Link href="/admin/pedidos" className="whitespace-nowrap leading-none">
            <span className="block font-slab text-base leading-none text-banana">MERCADINHO DO LITO</span>
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/60">
              Gerência
            </span>
          </Link>
          <nav className="flex items-center gap-1 text-sm">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="whitespace-nowrap rounded-lg px-2.5 py-1.5 font-medium hover:bg-white/10"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/"
              className="whitespace-nowrap rounded-lg px-2.5 py-1.5 text-white/60 hover:bg-white/10"
            >
              Ver loja
            </Link>
            <form action={signOut}>
              <button
                type="submit"
                className="rounded-lg px-2.5 py-1.5 text-white/60 hover:bg-white/10"
              >
                Sair
              </button>
            </form>
          </nav>
        </div>
        <Awning stripe="#0E6B3A" />
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
    </div>
  )
}
