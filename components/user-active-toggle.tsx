'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { setUserActive } from '@/app/actions/users'

export function UserActiveToggle({ userId, active }: { userId: string; active: boolean }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  return (
    <div className="text-right">
      <button
        onClick={() =>
          startTransition(async () => {
            const result = await setUserActive(userId, !active)
            if (result.error) setError(result.error)
            else router.refresh()
          })
        }
        disabled={pending}
        className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
          active
            ? 'border border-red-200 text-red-600 hover:bg-red-50'
            : 'bg-feira text-white hover:bg-feira-dark'
        } disabled:opacity-50`}
      >
        {pending ? '…' : active ? 'Desativar' : 'Reativar'}
      </button>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}
