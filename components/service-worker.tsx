'use client'

import { useEffect } from 'react'

// Registra o service worker de public/sw.js, que existe so para tornar o app
// instalavel. Ver o comentario no proprio sw.js.
export function ServiceWorker() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Sem service worker o app continua funcionando; so nao instala.
    })
  }, [])

  return null
}
