const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

export function formatCents(cents: number): string {
  return brl.format(cents / 100)
}

// A loja fica no Brasil, mas as paginas sao renderizadas no servidor da
// Vercel, que roda em UTC. Sem fuso explicito, toLocaleString usa o fuso do
// servidor — era o que mostrava 19:02 numa compra feita as 16:02.
export const TIME_ZONE = 'America/Sao_Paulo'

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', {
    timeZone: TIME_ZONE,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Instante UTC da meia-noite de Brasilia na data informada.
//
// Montar a janela com new Date(ano, mes, dia) usa o fuso do servidor: em UTC,
// a "meia-noite" cai as 21h do dia anterior no Brasil, e os pedidos do fim da
// noite escorregavam para o dia (e para o mes) seguinte na conferencia.
//
// O Brasil nao usa horario de verao desde 2019, entao Brasilia e UTC-3 fixo e
// meia-noite equivale as 03:00 UTC do mesmo dia. Date.UTC normaliza mes 13 e
// dia 32, o que deixa `mes + 1` e `dia + 1` seguros para fechar a janela.
export function startOfDayBR(year: number, month: number, day: number): string {
  return new Date(Date.UTC(year, month - 1, day, 3, 0, 0)).toISOString()
}

// Ano e mes correntes em Brasilia, nao no servidor.
export function currentYearMonthBR(): { year: number; month: number } {
  const [year, month] = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
  })
    .format(new Date())
    .split('-')
    .map(Number)
  return { year, month }
}
