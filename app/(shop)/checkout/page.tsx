import QRCode from 'qrcode'
import { CheckoutForm } from '@/components/checkout-form'
import { buildPixPayload } from '@/lib/pix'
import { createServerSupabase } from '@/lib/supabase/server'
import type { Settings } from '@/lib/types'

export default async function CheckoutPage() {
  const supabase = await createServerSupabase()
  const { data: settings } = await supabase
    .from('settings')
    .select('*')
    .eq('id', 1)
    .single<Settings>()

  const pixConfigured = Boolean(settings?.pix_key)
  let qrDataUrl: string | null = null
  let pixPayload: string | null = null

  if (settings && pixConfigured) {
    pixPayload = buildPixPayload({
      key: settings.pix_key,
      merchantName: settings.merchant_name,
      merchantCity: settings.merchant_city,
    })
    qrDataUrl = await QRCode.toDataURL(pixPayload, { width: 280, margin: 1 })
  }

  return (
    <CheckoutForm
      pixConfigured={pixConfigured}
      qrDataUrl={qrDataUrl}
      pixKey={settings?.pix_key ?? ''}
      pixPayload={pixPayload}
      merchantName={settings?.merchant_name ?? ''}
    />
  )
}
