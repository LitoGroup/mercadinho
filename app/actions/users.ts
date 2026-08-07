'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'

export interface CreateUserState {
  error?: string
  ok?: boolean
}

export async function createUser(
  _prev: CreateUserState,
  formData: FormData
): Promise<CreateUserState> {
  await requireAdmin()

  const name = String(formData.get('name') ?? '').trim()
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const password = String(formData.get('password') ?? '')
  const role = formData.get('role') === 'admin' ? 'admin' : 'customer'

  if (!name) return { error: 'Informe o nome.' }
  if (!/^\S+@\S+\.\S+$/.test(email)) return { error: 'Email inválido.' }
  if (password.length < 6) return { error: 'A senha precisa de pelo menos 6 caracteres.' }

  const admin = createAdminClient()
  const { error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name, role },
  })
  if (error) {
    return {
      error: error.message.includes('already')
        ? 'Já existe um usuário com esse email.'
        : 'Não foi possível criar o usuário.',
    }
  }

  revalidatePath('/admin/usuarios')
  return { ok: true }
}

export async function setUserActive(userId: string, active: boolean): Promise<{ error?: string }> {
  const { profile } = await requireAdmin()
  if (userId === profile.id) {
    return { error: 'Você não pode desativar a si mesmo.' }
  }

  const admin = createAdminClient()
  const { error } = await admin.from('profiles').update({ active }).eq('id', userId)
  if (error) return { error: 'Não foi possível atualizar o usuário.' }

  revalidatePath('/admin/usuarios')
  return {}
}
