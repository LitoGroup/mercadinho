'use client'

import { useActionState } from 'react'
import { changePassword, type ChangePasswordState } from '@/app/actions/auth'

export function ChangePasswordForm() {
  const [state, formAction, pending] = useActionState<ChangePasswordState, FormData>(
    changePassword,
    {}
  )

  const inputCls =
    'w-full rounded-lg border border-texto/15 bg-white px-3.5 py-2.5 text-texto shadow-sm transition focus:border-azul focus:outline-none focus:ring-2 focus:ring-azul/15'

  return (
    <form action={formAction} className="rounded-xl border border-texto/8 bg-white p-5 shadow-sm">
      {state.ok ? (
        <p className="rounded-lg bg-verde/10 p-4 text-sm font-medium text-azul">
          Senha alterada com sucesso. Use a nova senha no próximo acesso.
        </p>
      ) : (
        <>
          <div className="space-y-4">
            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-texto/80">
                Nova senha
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={6}
                autoComplete="new-password"
                className={inputCls}
              />
              <p className="mt-1 text-xs text-texto/40">Mínimo de 6 caracteres.</p>
            </div>
            <div>
              <label htmlFor="confirm" className="mb-1.5 block text-sm font-medium text-texto/80">
                Repita a nova senha
              </label>
              <input
                id="confirm"
                name="confirm"
                type="password"
                required
                minLength={6}
                autoComplete="new-password"
                className={inputCls}
              />
            </div>
          </div>

          {state.error && (
            <p className="mt-4 rounded-lg border border-erro/25 bg-erro/5 p-3 text-sm text-erro-escuro">
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="mt-5 w-full rounded-lg bg-verde py-2.5 font-bold uppercase tracking-wide text-azul transition hover:brightness-95 disabled:cursor-not-allowed disabled:bg-texto/15 disabled:text-texto/50"
          >
            {pending ? 'Salvando…' : 'Salvar nova senha'}
          </button>
        </>
      )}
    </form>
  )
}
