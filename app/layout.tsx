import type { Metadata, Viewport } from 'next'
import { Montserrat } from 'next/font/google'
import { CartProvider } from '@/components/cart-provider'
import { ServiceWorker } from '@/components/service-worker'
import './globals.css'

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-body',
})

export const metadata: Metadata = {
  title: 'Mercadinho do Lito',
  description: 'Compras internas · Lito Aviation Academy',
  appleWebApp: {
    capable: true,
    title: 'Mercadinho',
    statusBarStyle: 'default',
  },
  // O iOS ignora os icones do manifest e usa apple-touch-icon. Sem ele, o
  // atalho na tela inicial do iPhone saia com um retrato da pagina no lugar
  // da logo.
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#002E53',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={`${montserrat.variable} font-sans antialiased`}>
        <ServiceWorker />
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  )
}
