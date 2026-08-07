'use client'

import { BrowserMultiFormatReader } from '@zxing/browser'
import { useEffect, useRef, useState } from 'react'

export function BarcodeScanner({
  onResult,
  onClose,
}: {
  onResult: (ean: string) => void
  onClose: () => void
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const reader = new BrowserMultiFormatReader()
    let stopped = false
    let controls: { stop(): void } | undefined

    reader
      .decodeFromVideoDevice(undefined, videoRef.current!, (result) => {
        if (result && !stopped) {
          stopped = true
          controls?.stop()
          onResult(result.getText())
        }
      })
      .then((c) => {
        controls = c
        if (stopped) c.stop()
      })
      .catch(() => setError('Não foi possível acessar a câmera. Verifique as permissões.'))

    return () => {
      stopped = true
      controls?.stop()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 p-4">
      <p className="mb-3 font-medium text-white">Aponte para o código de barras</p>
      {error ? (
        <p className="rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}</p>
      ) : (
        <video ref={videoRef} className="w-full max-w-md rounded-xl" muted playsInline />
      )}
      <button
        type="button"
        onClick={onClose}
        className="mt-4 rounded-lg bg-white/10 px-6 py-2 font-semibold text-white hover:bg-white/20"
      >
        Cancelar
      </button>
    </div>
  )
}
