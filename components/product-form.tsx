'use client'

import { useActionState, useState } from 'react'
import { saveProduct, type SaveProductState } from '@/app/actions/products'
import { BarcodeScanner } from '@/components/barcode-scanner'
import { PhotoCapture } from '@/components/photo-capture'
import type { Product } from '@/lib/types'

export function ProductForm({
  product,
  existingImageUrl,
}: {
  product?: Product
  existingImageUrl?: string | null
}) {
  const [state, formAction, pending] = useActionState<SaveProductState, FormData>(saveProduct, {})

  const [ean, setEan] = useState(product?.ean ?? '')
  const [name, setName] = useState(product?.name ?? '')
  const [description, setDescription] = useState(product?.description ?? '')
  const [category, setCategory] = useState(product?.category ?? '')
  const [scanning, setScanning] = useState(false)
  const [photoBlob, setPhotoBlob] = useState<Blob | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(existingImageUrl ?? null)
  const [aiBusy, setAiBusy] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)

  async function generateWithAI() {
    setAiBusy(true)
    setAiError(null)
    try {
      let imageBase64: string | undefined
      if (photoBlob) {
        imageBase64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(String(reader.result).split(',')[1])
          reader.onerror = reject
          reader.readAsDataURL(photoBlob)
        })
      }
      const res = await fetch('/api/ai/describe-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64,
          mediaType: 'image/jpeg',
          ean: ean || undefined,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Falha na IA')
      setName(json.name)
      setDescription(json.description)
      setCategory(json.category)
    } catch (e) {
      setAiError(e instanceof Error ? e.message : 'A IA não respondeu. Preencha manualmente.')
    } finally {
      setAiBusy(false)
    }
  }

  function handleSubmit(formData: FormData) {
    if (photoBlob) {
      formData.set('photo', new File([photoBlob], 'produto.jpg', { type: 'image/jpeg' }))
    }
    formAction(formData)
  }

  const inputCls =
    'w-full rounded-lg border border-texto/15 px-3 py-2 focus:border-azul focus:outline-none'

  return (
    <form action={handleSubmit} className="mx-auto max-w-lg space-y-4">
      {product && <input type="hidden" name="id" value={product.id} />}

      {scanning && (
        <BarcodeScanner
          onResult={(code) => {
            setEan(code)
            setScanning(false)
          }}
          onClose={() => setScanning(false)}
        />
      )}

      <PhotoCapture
        previewUrl={photoPreview}
        onCapture={(blob, url) => {
          setPhotoBlob(blob)
          setPhotoPreview(url)
        }}
      />

      <div className="flex gap-2">
        <div className="flex-1">
          <label htmlFor="ean" className="mb-1 block text-sm font-medium text-texto/80">
            Código de barras (EAN)
          </label>
          <input
            id="ean"
            name="ean"
            value={ean}
            onChange={(e) => setEan(e.target.value)}
            placeholder="Opcional"
            className={inputCls}
          />
        </div>
        <button
          type="button"
          onClick={() => setScanning(true)}
          className="self-end rounded-lg border border-azul/30 px-3 py-2 text-azul hover:bg-verde/10"
        >
          Escanear
        </button>
      </div>

      <button
        type="button"
        onClick={generateWithAI}
        disabled={aiBusy || (!photoBlob && !ean)}
        className="w-full rounded-lg border border-azul/30 bg-azul/5 py-2.5 font-semibold text-azul transition hover:bg-verde/10 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {aiBusy ? 'Gerando descrição…' : 'Gerar nome e descrição com IA'}
      </button>
      {aiError && <p className="rounded-lg bg-alerta/10 p-3 text-sm text-alerta">{aiError}</p>}

      <div>
        <label htmlFor="name" className="mb-1 block text-sm font-medium text-texto/80">
          Nome *
        </label>
        <input
          id="name"
          name="name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputCls}
        />
      </div>

      <div>
        <label htmlFor="description" className="mb-1 block text-sm font-medium text-texto/80">
          Descrição
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={inputCls}
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label htmlFor="category" className="mb-1 block text-sm font-medium text-texto/80">
            Categoria
          </label>
          <input
            id="category"
            name="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Outros"
            className={inputCls}
          />
        </div>
        <div>
          <label htmlFor="price" className="mb-1 block text-sm font-medium text-texto/80">
            Preço (R$) *
          </label>
          <input
            id="price"
            name="price"
            required
            inputMode="decimal"
            placeholder="4,50"
            defaultValue={product ? (product.price_cents / 100).toFixed(2).replace('.', ',') : ''}
            className={inputCls}
          />
        </div>
        <div>
          <label htmlFor="stock" className="mb-1 block text-sm font-medium text-texto/80">
            Estoque *
          </label>
          <input
            id="stock"
            name="stock"
            required
            type="number"
            min={0}
            defaultValue={product?.stock ?? 0}
            className={inputCls}
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-texto/80">
        <input type="checkbox" name="active" defaultChecked={product?.active ?? true} />
        Produto ativo (visível no catálogo)
      </label>

      {state.error && <p className="rounded-lg bg-erro/8 p-3 text-sm text-erro-escuro">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-azul py-3 font-bold text-white hover:bg-azul-claro disabled:bg-texto/15"
      >
        {pending ? 'Salvando…' : product ? 'Salvar alterações' : 'Cadastrar produto'}
      </button>
    </form>
  )
}
