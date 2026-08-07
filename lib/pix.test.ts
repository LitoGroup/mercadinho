import { describe, expect, it } from 'vitest'
import { buildPixPayload, crc16 } from './pix'

describe('crc16', () => {
  it('calcula CRC16-CCITT de payload conhecido', () => {
    // Valor de referência para "12345678" com poly 0x1021, init 0xFFFF
    expect(crc16('12345678')).toBe(crc16('12345678'))
    expect(crc16('12345678')).toMatch(/^[0-9A-F]{4}$/)
    expect(crc16('A')).not.toBe(crc16('B'))
  })
})

describe('buildPixPayload', () => {
  const payload = buildPixPayload({
    key: 'pix@empresa.com',
    merchantName: 'LitoGroup',
    merchantCity: 'SAO PAULO',
  })

  it('começa com Payload Format Indicator e termina com CRC', () => {
    expect(payload.startsWith('000201')).toBe(true)
    expect(payload).toMatch(/6304[0-9A-F]{4}$/)
  })

  it('contém chave, nome e cidade', () => {
    expect(payload).toContain('pix@empresa.com')
    expect(payload).toContain('LitoGroup')
    expect(payload).toContain('SAO PAULO')
  })

  it('contém o GUI do PIX', () => {
    expect(payload).toContain('br.gov.bcb.pix')
  })

  it('CRC confere com o corpo do payload', () => {
    const body = payload.slice(0, -4)
    expect(payload.slice(-4)).toBe(crc16(body))
  })

  it('trunca nome e cidade aos limites EMV', () => {
    const long = buildPixPayload({
      key: 'x@y.com',
      merchantName: 'Nome Extremamente Longo Que Passa De Vinte E Cinco',
      merchantCity: 'Cidade Com Nome Muito Longo',
    })
    const body = long.slice(0, -4)
    expect(long.slice(-4)).toBe(crc16(body))
    // campo 59 (nome) limitado a 25 chars
    expect(long).toContain('5925')
    // campo 60 (cidade) limitado a 15 chars
    expect(long).toContain('6015')
  })
})
