// BR Code estático (EMV-MPO) para PIX, sem valor definido —
// o pagador digita o valor no app do banco.

export function crc16(payload: string): string {
  let crc = 0xffff
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8
    for (let j = 0; j < 8; j++) {
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0')
}

function emv(id: string, value: string): string {
  return id + String(value.length).padStart(2, '0') + value
}

// Remove acentos e caracteres fora do conjunto EMV
function sanitize(text: string, max: number): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^A-Za-z0-9 @.\-_]/g, '')
    .slice(0, max)
}

export interface PixConfig {
  key: string
  merchantName: string
  merchantCity: string
}

export function buildPixPayload({ key, merchantName, merchantCity }: PixConfig): string {
  const merchantAccount = emv('00', 'br.gov.bcb.pix') + emv('01', key.trim())
  const body =
    emv('00', '01') + // Payload Format Indicator
    emv('26', merchantAccount) + // Merchant Account Information (PIX)
    emv('52', '0000') + // Merchant Category Code
    emv('53', '986') + // Moeda: BRL
    emv('58', 'BR') + // País
    emv('59', sanitize(merchantName, 25) || 'EMPRESA') +
    emv('60', sanitize(merchantCity, 15) || 'BRASIL') +
    emv('62', emv('05', '***')) + // txid livre
    '6304' // CRC vem em seguida
  return body + crc16(body)
}
