import { signOut } from '@/app/actions/auth'
import { CartProvider } from '@/components/cart-provider'
import { ShopHeader } from '@/components/shop-header'
import { requireUser } from '@/lib/auth'

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await requireUser()

  return (
    <CartProvider>
      <div className="min-h-screen bg-emerald-50/40">
        <ShopHeader
          userName={profile.name}
          isAdmin={profile.role === 'admin'}
          signOutAction={signOut}
        />
        <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
      </div>
    </CartProvider>
  )
}
