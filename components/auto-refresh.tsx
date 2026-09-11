'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef } from 'react'

// Quanto tempo a tela fica quieta depois do último toque. Repor estoque é uma
// sequência de toques; atualizar no meio dela faz a lista se mexer sob o dedo.
const CALMA_APOS_TOQUE_MS = 8000

// As páginas são renderizadas no servidor: uma compra feita por outra pessoa
// não muda o que já está desenhado na tela de quem está com o app aberto.
//
// Dois gatilhos, porque um só não basta:
//
// - Voltar ao primeiro plano (trocar de aba, sair do WhatsApp, desbloquear o
//   celular). Resolve o caso de quem deixa o app aberto e volta depois.
// - Um intervalo, quando `intervalMs` é passado. Necessário porque a tela que
//   o admin fica OLHANDO nunca recebe os eventos acima — foi exatamente o que
//   deixou o estoque parecendo intacto depois de uma compra, até a conferência
//   revalidar a página e os números caírem de uma vez.
//
// O intervalo fica só na gerência, onde há poucos usuários e a tela precisa
// ser confiável. Na loja, com todos os alunos de app aberto, um intervalo
// multiplicaria as requisições sem necessidade: para o comprador, atualizar ao
// voltar ao primeiro plano e ao navegar já basta.
//
// O carrinho não se perde: vive no CartProvider, que continua montado.
export function AutoRefresh({ intervalMs }: { intervalMs?: number }) {
  const router = useRouter()
  const ultimoToque = useRef(0)

  useEffect(() => {
    const isVisible = () => document.visibilityState === 'visible'

    const onForeground = () => {
      if (isVisible()) router.refresh()
    }

    document.addEventListener('visibilitychange', onForeground)
    window.addEventListener('focus', onForeground)

    let timer: ReturnType<typeof setInterval> | undefined
    let marcarToque: (() => void) | undefined

    if (intervalMs) {
      marcarToque = () => {
        ultimoToque.current = Date.now()
      }
      document.addEventListener('pointerdown', marcarToque, { passive: true })
      document.addEventListener('keydown', marcarToque)

      timer = setInterval(() => {
        if (!isVisible()) return
        // Não atualiza enquanto alguém digita: a busca e o campo de estoque
        // disputariam com o re-render no meio da digitação.
        const el = document.activeElement
        const digitando =
          el instanceof HTMLElement &&
          (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)
        if (digitando) return
        // Nem logo depois de um toque, pelo mesmo motivo.
        if (Date.now() - ultimoToque.current < CALMA_APOS_TOQUE_MS) return
        router.refresh()
      }, intervalMs)
    }

    return () => {
      document.removeEventListener('visibilitychange', onForeground)
      window.removeEventListener('focus', onForeground)
      if (marcarToque) {
        document.removeEventListener('pointerdown', marcarToque)
        document.removeEventListener('keydown', marcarToque)
      }
      if (timer) clearInterval(timer)
    }
  }, [router, intervalMs])

  return null
}
