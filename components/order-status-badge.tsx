import type { OrderStatus } from '@/lib/types'

const STYLES: Record<OrderStatus, { label: string; className: string }> = {
  pending: { label: 'Aguardando conferência', className: 'bg-alerta/10 text-alerta' },
  approved: { label: 'Aprovado', className: 'bg-verde/15 text-verde-escuro' },
  rejected: { label: 'Rejeitado', className: 'bg-erro/10 text-erro-escuro' },
}

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const { label, className } = STYLES[status]
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${className}`}>
      {label}
    </span>
  )
}
