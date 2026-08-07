'use client'

import { useRef, useState } from 'react'

// Reduz a imagem para no máx. 1024px e JPEG q0.8 — suficiente para a IA e o catálogo.
async function compress(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, 1024 / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  return new Promise((resolve) =>
    canvas.toBlob((b) => resolve(b ?? file), 'image/jpeg', 0.8)
  )
}

export function PhotoCapture({
  onCapture,
  previewUrl,
}: {
  onCapture: (blob: Blob, previewUrl: string) => void
  previewUrl: string | null
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setBusy(true)
    try {
      const blob = await compress(file)
      onCapture(blob, URL.createObjectURL(blob))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleChange}
        className="hidden"
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        className="flex h-36 w-full items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 text-sm text-gray-500 hover:border-feira"
      >
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={previewUrl} alt="Foto do produto" className="h-full w-full object-cover" />
        ) : busy ? (
          'Processando…'
        ) : (
          <span>
            📷 Tirar foto do produto
          </span>
        )}
      </button>
    </div>
  )
}
