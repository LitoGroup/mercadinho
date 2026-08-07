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
    'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-feira focus:outline-none'

  return (
    <form
      ref={formRef}
      action={formAction}
      className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
    >
      <h2 className="mb-3 font-semibold text-gray-700">Novo usuário</h2>
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
        <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">{state.error}</p>
      )}
      {state.ok && (
        <p className="mt-3 rounded-lg bg-feira/10 p-3 text-sm text-feira-dark">
          Usuário criado! Compartilhe o email e a senha temporária com a pessoa.
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-3 rounded-lg bg-feira px-4 py-2 font-semibold text-white hover:bg-feira-dark disabled:bg-gray-300"
      >
        {pending ? 'Criando…' : 'Criar usuário'}
      </button>
    </form>
  )
}
