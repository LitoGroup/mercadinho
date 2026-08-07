'use client'

import { Share, Smartphone, SquarePlus, X } from 'lucide-react'
import { useEffect, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function InstallAppButton() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)
  const [showHelp, setShowHelp] = useState(false)
  const [hidden, setHidden] = useState(true)

  useEffect(() => {
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      ('standalone' in navigator && (navigator as { standalone?: boolean }).standalone === true)
    setHidden(standalone)

    const onPrompt = (e: Event) => {
      e.preventDefault()
      setDeferred(e as BeforeInstallPromptEvent)
    }
    const onInstalled = () => setHidden(true)
    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  if (hidden) return null

  const isIOS = typeof navigator !== 'undefined' && /iPhone|iPad|iPod/i.test(navigator.userAgent)

  async function handleClick() {
    if (deferred) {
      // Android/Chrome: instalação nativa com um toque
      await deferred.prompt()
      setDeferred(null)
      return
    }
    // iOS (ou navegador sem suporte): mostra o passo a passo
    setShowHelp(true)
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className="flex w-full items-center justify-center gap-2.5 rounded-xl border-2 border-azul bg-white py-3.5 font-bold uppercase tracking-wide text-azul transition hover:bg-azul hover:text-white"
      >
        <Smartphone className="h-5 w-5" />
        Instalar o app no celular
      </button>

      {showHelp && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center"
          onClick={() => setShowHelp(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-label="Como instalar o app"
          >
            <div className="mb-4 flex items-start justify-between">
              <h2 className="text-lg font-bold text-texto">Instalar no {isIOS ? 'iPhone' : 'celular'}</h2>
              <button
                onClick={() => setShowHelp(false)}
                className="rounded-lg p-1 text-texto/40 hover:bg-cinza-claro"
                aria-label="Fechar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {isIOS ? (
              <ol className="space-y-4 text-sm text-texto/80">
                <li className="flex items-start gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-azul text-xs font-bold text-white">
                    1
                  </span>
                  <span>
                    Toque no botão <strong>Compartilhar</strong>{' '}
                    <Share className="inline h-4 w-4 text-azul" /> na barra do Safari (embaixo, no
                    meio).
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-azul text-xs font-bold text-white">
                    2
                  </span>
                  <span>
                    Role a lista e toque em <strong>Adicionar à Tela de Início</strong>{' '}
                    <SquarePlus className="inline h-4 w-4 text-azul" />.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-azul text-xs font-bold text-white">
                    3
                  </span>
                  <span>
                    Confirme em <strong>Adicionar</strong>. O Mercadinho aparece na sua tela de
                    início como um app.
                  </span>
                </li>
              </ol>
            ) : (
              <ol className="space-y-4 text-sm text-texto/80">
                <li className="flex items-start gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-azul text-xs font-bold text-white">
                    1
                  </span>
                  <span>
                    Abra o menu do navegador (<strong>⋮</strong> no canto superior direito).
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-azul text-xs font-bold text-white">
                    2
                  </span>
                  <span>
                    Toque em <strong>Instalar app</strong> (ou{' '}
                    <strong>Adicionar à tela inicial</strong>).
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-azul text-xs font-bold text-white">
                    3
                  </span>
                  <span>Confirme. O Mercadinho aparece na tela inicial como um app.</span>
                </li>
              </ol>
            )}
          </div>
        </div>
      )}
    </>
  )
}
