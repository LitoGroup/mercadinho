import { signOut } from '@/app/actions/auth'
import { BottomNav } from '@/components/bottom-nav'
import { CartProvider } from '@/components/cart-provider'
import { ShopHeader } from '@/components/shop-header'
import { requireUser } from '@/lib/auth'

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await requireUser()

  return (
    <CartProvider>
      <div className="min-h-screen bg-creme">
        <ShopHeader
          userName={profile.name}
          isAdmin={profile.role === 'admin'}
          signOutAction={signOut}
        />
        <main className="mx-auto max-w-5xl px-4 py-6 pb-28 sm:pb-6">{children}</main>
        <BottomNav />
      </div>
    </CartProvider>
  )
}
