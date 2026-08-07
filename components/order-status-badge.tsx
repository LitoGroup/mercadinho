import type { OrderStatus } from '@/lib/types'

const STYLES: Record<OrderStatus, { label: string; className: string }> = {
  pending: { label: 'Aguardando conferência', className: 'bg-amber-100 text-amber-800' },
  approved: { label: 'Aprovado', className: 'bg-emerald-100 text-emerald-800' },
  rejected: { label: 'Rejeitado', className: 'bg-red-100 text-red-700' },
}

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const { label, className } = STYLES[status]
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${className}`}>
      {label}
    </span>
  )
}
