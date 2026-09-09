import { describe, expect, it } from 'vitest'
import { formatDate, startOfDayBR } from './format'

describe('fuso de Brasilia', () => {
  it('mostra a compra do Joao no horario local, nao em UTC', () => {
    // Gravado no banco as 19:02 UTC; a compra foi as 16:02 em Brasilia.
    expect(formatDate('2026-09-09 19:02:59.399894+00')).toBe('09/09/2026, 16:02')
  })

  it('janela do dia comeca a meia-noite de Brasilia', () => {
    expect(startOfDayBR(2026, 9, 9)).toBe('2026-09-09T03:00:00.000Z')
  })

  it('fecha o mes virando o ano', () => {
    expect(startOfDayBR(2026, 12, 1)).toBe('2026-12-01T03:00:00.000Z')
    expect(startOfDayBR(2026, 13, 1)).toBe('2027-01-01T03:00:00.000Z')
  })

  it('inclui o pedido das 22h do ultimo dia do mes no mes certo', () => {
    // 30/09 22:00 em Brasilia = 01/10 01:00 UTC. Com a janela antiga
    // (01/10 00:00 UTC) esse pedido caia fora de setembro e desaparecia.
    const pedido = new Date('2026-10-01T01:00:00Z').toISOString()
    const inicioSet = startOfDayBR(2026, 9, 1)
    const fimSet = startOfDayBR(2026, 10, 1)
    expect(pedido >= inicioSet && pedido < fimSet).toBe(true)
    expect(formatDate(pedido)).toBe('30/09/2026, 22:00')
  })
})
