import QRCode from 'qrcode'
import { SettingsForm } from '@/components/settings-form'
import { buildPixPayload } from '@/lib/pix'
import { createServerSupabase } from '@/lib/supabase/server'
import type { Settings } from '@/lib/types'

export default async function AdminConfigPage() {
  const supabase = await createServerSupabase()
  const { data } = await supabase.from('settings').select('*').eq('id', 1).single<Settings>()
  const settings = data as Settings

  let qrDataUrl: string | null = null
  if (settings?.pix_key) {
    const payload = buildPixPayload({
      key: settings.pix_key,
      merchantName: settings.merchant_name,
      merchantCity: settings.merchant_city,
    })
    qrDataUrl = await QRCode.toDataURL(payload, { width: 220, margin: 1 })
  }

  return (
    <div className="mx-auto max-w-lg space-y-5">
      <h1 className="text-xl font-bold text-gray-900">Configurações</h1>
      <SettingsForm settings={settings} />

      <div className="rounded-xl border border-gray-100 bg-white p-4 text-center shadow-sm">
        <h2 className="mb-2 font-semibold text-gray-700">Pré-visualização do QR PIX</h2>
        {qrDataUrl ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrDataUrl} alt="QR code PIX" className="mx-auto rounded-lg border" />
            <p className="mt-2 text-xs text-gray-400">
              Este é o QR que os clientes verão no checkout. Teste com o app do seu banco!
            </p>
          </>
        ) : (
          <p className="text-sm text-gray-500">Preencha a chave PIX para gerar o QR code.</p>
        )}
      </div>
    </div>
  )
}
