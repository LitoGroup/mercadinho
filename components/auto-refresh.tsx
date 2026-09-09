'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

// As paginas sao renderizadas no servidor: uma compra feita por outra pessoa
// nao muda o que ja esta desenhado na tela de quem esta com o app aberto.
//
// Dois gatilhos, porque um so nao basta:
//
// - Voltar ao primeiro plano (trocar de aba, sair do WhatsApp, desbloquear o
//   celular). Resolve o caso de quem deixa o app aberto e volta depois.
// - Um intervalo, quando `intervalMs` e passado. Necessario porque a tela que
//   o admin fica OLHANDO nunca recebe os eventos acima — foi exatamente o que
//   deixou o estoque parecendo intacto depois de uma compra, ate a conferencia
//   revalidar a pagina e os numeros cairem de uma vez.
//
// O intervalo fica so na gerencia, onde ha poucos usuarios e a tela precisa
// ser confiavel. Na loja, com todos os alunos de app aberto, um intervalo
// multiplicaria as requisicoes sem necessidade: para o comprador, atualizar ao
// voltar ao primeiro plano e ao navegar ja basta.
//
// O carrinho nao se perde: vive no CartProvider, que continua montado.
export function AutoRefresh({ intervalMs }: { intervalMs?: number }) {
  const router = useRouter()

  useEffect(() => {
    const isVisible = () => document.visibilityState === 'visible'

    const onForeground = () => {
      if (isVisible()) router.refresh()
    }

    document.addEventListener('visibilitychange', onForeground)
    window.addEventListener('focus', onForeground)

    let timer: ReturnType<typeof setInterval> | undefined
    if (intervalMs) {
      timer = setInterval(() => {
        // Nao atualiza enquanto alguem digita: a busca e o campo de estoque
        // disputariam com o re-render no meio da digitacao.
        const el = document.activeElement
        const typing =
          el instanceof HTMLElement &&
          (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)
        if (isVisible() && !typing) router.refresh()
      }, intervalMs)
    }

    return () => {
      document.removeEventListener('visibilitychange', onForeground)
      window.removeEventListener('focus', onForeground)
      if (timer) clearInterval(timer)
    }
  }, [router, intervalMs])

  return null
}
