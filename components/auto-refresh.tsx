'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

// As telas são renderizadas no servidor: uma compra feita por outra pessoa
// não muda o que já está desenhado na tela de quem está com o app aberto.
//
// Na gerência isso faz o admin ver o saldo de quando abriu a aba Produtos, e
// parecer que a baixa não aconteceu — embora o estoque já tenha saído no
// banco. Na loja, faz o comprador ver um produto que já esgotou e só descobrir
// no fechamento.
//
// Sempre que o app volta ao primeiro plano, pedimos ao Next para renderizar a
// rota atual de novo, com dados frescos. O estado do carrinho não se perde:
// ele vive no CartProvider, que continua montado.
export function AutoRefresh() {
  const router = useRouter()

  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState === 'visible') router.refresh()
    }
    document.addEventListener('visibilitychange', refresh)
    window.addEventListener('focus', refresh)
    return () => {
      document.removeEventListener('visibilitychange', refresh)
      window.removeEventListener('focus', refresh)
    }
  }, [router])

  return null
}
