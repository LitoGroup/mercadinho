import type { Metadata } from 'next'
import { Alfa_Slab_One, Archivo } from 'next/font/google'
import './globals.css'

const display = Alfa_Slab_One({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-display',
})

const body = Archivo({
  subsets: ['latin'],
  variable: '--font-body',
})

export const metadata: Metadata = {
  title: 'Mercadinho do Lito',
  description: 'O mercadinho da firma — pegue, pague no PIX, pronto.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={`${display.variable} ${body.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  )
}
