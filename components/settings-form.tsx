'use client'

import { useActionState } from 'react'
import { saveSettings, type SaveSettingsState } from '@/app/actions/settings'
import type { Settings } from '@/lib/types'

export function SettingsForm({ settings }: { settings: Settings }) {
  const [state, formAction, pending] = useActionState<SaveSettingsState, FormData>(saveSettings, {})

  const inputCls =
    'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-feira focus:outline-none'

  return (
    <form action={formAction} className="space-y-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
      <div>
        <label htmlFor="pix_key" className="mb-1 block text-sm font-medium text-gray-700">
          Chave PIX da empresa *
        </label>
        <input
          id="pix_key"
          name="pix_key"
          required
          defaultValue={settings.pix_key}
          placeholder="email, CPF/CNPJ, telefone ou chave aleatória"
          className={inputCls}
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label htmlFor="pix_key_type" className="mb-1 block text-sm font-medium text-gray-700">
            Tipo da chave
          </label>
          <select
            id="pix_key_type"
            name="pix_key_type"
            defaultValue={settings.pix_key_type}
            className={inputCls}
          >
            <option value="email">Email</option>
            <option value="cpf">CPF</option>
            <option value="cnpj">CNPJ</option>
            <option value="telefone">Telefone</option>
            <option value="aleatoria">Aleatória</option>
          </select>
        </div>
        <div>
          <label htmlFor="merchant_name" className="mb-1 block text-sm font-medium text-gray-700">
            Nome da empresa *
          </label>
          <input
            id="merchant_name"
            name="merchant_name"
            required
            maxLength={25}
            defaultValue={settings.merchant_name}
            className={inputCls}
          />
        </div>
        <div>
          <label htmlFor="merchant_city" className="mb-1 block text-sm font-medium text-gray-700">
            Cidade *
          </label>
          <input
            id="merchant_city"
            name="merchant_city"
            required
            maxLength={15}
            defaultValue={settings.merchant_city}
            className={inputCls}
          />
        </div>
      </div>

      {state.error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{state.error}</p>}
      {state.ok && (
        <p className="rounded-lg bg-feira/10 p-3 text-sm text-feira-dark">
          Configurações salvas!
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-feira px-4 py-2 font-semibold text-white hover:bg-feira-dark disabled:bg-gray-300"
      >
        {pending ? 'Salvando…' : 'Salvar configurações'}
      </button>
    </form>
  )
}
