'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useActionState, useEffect, useState } from 'react'
import { placeOrder, type PlaceOrderState } from '@/app/actions/orders'
import { useCart } from '@/components/cart-provider'
import { formatCents } from '@/lib/format'

export function CheckoutForm({
  pixConfigured,
  qrDataUrl,
  pixKey,
  pixPayload,
  merchantName,
}: {
  pixConfigured: boolean
  qrDataUrl: string | null
  pixKey: string
  pixPayload: string | null
  merchantName: string
}) {
  const router = useRouter()
  const { items, totalCents, clear } = useCart()
  const [state, formAction, pending] = useActionState<PlaceOrderState, FormData>(placeOrder, {})
  const [copied, setCopied] = useState<'chave' | 'codigo' | null>(null)

  useEffect(() => {
    if (state.ok) {
      clear()
      router.push('/pedidos?sucesso=1')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.ok])

  if (items.length === 0 && !state.ok) {
    return (
      <div className="py-16 text-center">
        <p className="text-gray-500">Seu carrinho está vazio.</p>
        <Link href="/" className="mt-3 inline-block font-semibold text-emerald-700 underline">
          Voltar ao catálogo
        </Link>
      </div>
    )
  }

  async function copy(text: string, which: 'chave' | 'codigo') {
    await navigator.clipboard.writeText(text)
    setCopied(which)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="mx-auto max-w-lg space-y-5">
      <h1 className="text-xl font-bold text-gray-900">Finalizar compra</h1>

      {/* Resumo */}
      <section className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <h2 className="mb-2 font-semibold text-gray-700">Resumo do pedido</h2>
        <ul className="divide-y divide-gray-50 text-sm">
          {items.map((i) => (
            <li key={i.productId} className="flex justify-between py-1.5">
              <span className="text-gray-600">
                {i.qty}× {i.name}
              </span>
              <span className="font-medium">{formatCents(i.priceCents * i.qty)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-2 flex justify-between border-t border-gray-100 pt-2 font-bold">
          <span>Total a pagar</span>
          <span className="text-emerald-700">{formatCents(totalCents)}</span>
        </div>
      </section>

      {/* Pagamento */}
      <section className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <h2 className="mb-1 font-semibold text-gray-700">1. Pague com PIX</h2>
        {!pixConfigured ? (
          <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
            O PIX ainda não foi configurado pelo administrador. Fale com ele antes de finalizar.
          </p>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <p className="text-center text-sm text-gray-500">
              Escaneie o QR code abaixo no app do seu banco e transfira{' '}
              <strong className="text-gray-800">{formatCents(totalCents)}</strong> para{' '}
              <strong className="text-gray-800">{merchantName}</strong>.
            </p>
            {qrDataUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={qrDataUrl} alt="QR code PIX" className="h-56 w-56 rounded-lg border" />
            )}
            <div className="flex w-full gap-2">
              <button
                type="button"
                onClick={() => copy(pixKey, 'chave')}
                className="flex-1 rounded-lg border border-emerald-200 px-3 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-50"
              >
                {copied === 'chave' ? 'Chave copiada ✓' : 'Copiar chave PIX'}
              </button>
              {pixPayload && (
                <button
                  type="button"
                  onClick={() => copy(pixPayload, 'codigo')}
                  className="flex-1 rounded-lg border border-emerald-200 px-3 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-50"
                >
                  {copied === 'codigo' ? 'Código copiado ✓' : 'PIX copia e cola'}
                </button>
              )}
            </div>
          </div>
        )}
      </section>

      {/* Comprovante */}
      <form action={formAction} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <h2 className="mb-1 font-semibold text-gray-700">2. Envie o comprovante</h2>
        <p className="mb-3 text-sm text-gray-500">
          Anexe o comprovante do PIX (PDF ou foto) para concluir o pedido.
        </p>
        <input
          type="hidden"
          name="items"
          value={JSON.stringify(items.map((i) => ({ product_id: i.productId, quantity: i.qty })))}
        />
        <input
          type="file"
          name="receipt"
          required
          accept="application/pdf,image/jpeg,image/png,image/webp"
          className="w-full rounded-lg border border-dashed border-gray-300 p-3 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-emerald-600 file:px-3 file:py-1.5 file:font-semibold file:text-white"
        />

        {state.error && (
          <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">{state.error}</p>
        )}

        <button
          type="submit"
          disabled={pending || !pixConfigured}
          className="mt-4 w-full rounded-xl bg-emerald-600 py-3 font-bold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          {pending ? 'Enviando…' : 'Concluir pedido'}
        </button>
      </form>
    </div>
  )
}
