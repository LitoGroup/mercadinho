'use client'

import { useActionState, useEffect, useRef } from 'react'
import { createUser, type CreateUserState } from '@/app/actions/users'

export function UserForm() {
  const [state, formAction, pending] = useActionState<CreateUserState, FormData>(createUser, {})
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state.ok) formRef.current?.reset()
  }, [state.ok])

  const inputCls =
    'w-full rounded-lg border border-texto/15 px-3 py-2 text-sm focus:border-azul focus:outline-none'

  return (
    <form
      ref={formRef}
      action={formAction}
      className="rounded-xl border border-texto/8 bg-white p-4 shadow-sm"
    >
      <h2 className="mb-3 font-semibold text-texto/80">Novo usuário</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <input name="name" required placeholder="Nome completo" className={inputCls} />
        <input name="email" type="email" required placeholder="email@empresa.com" className={inputCls} />
        <input
          name="password"
          required
          minLength={6}
          placeholder="Senha temporária (mín. 6)"
          className={inputCls}
        />
        <select name="role" defaultValue="customer" className={inputCls}>
          <option value="customer">Cliente</option>
          <option value="admin">Administrador</option>
        </select>
      </div>

      {state.error && (
        <p className="mt-3 rounded-lg bg-erro/8 p-3 text-sm text-erro-escuro">{state.error}</p>
      )}
      {state.ok && (
        <p className="mt-3 rounded-lg bg-verde/10 p-3 text-sm text-azul">
          Usuário criado! Compartilhe o email e a senha temporária com a pessoa.
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-3 rounded-lg bg-azul px-4 py-2 font-semibold text-white hover:bg-azul-claro disabled:bg-texto/15"
      >
        {pending ? 'Criando…' : 'Criar usuário'}
      </button>
    </form>
  )
}
