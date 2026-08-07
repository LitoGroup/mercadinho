'use server'

import { redirect } from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase/server'

export async function signIn(formData: FormData) {
  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')

  const supabase = await createServerSupabase()
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) {
    redirect('/login?erro=credenciais')
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, active')
    .eq('id', user!.id)
    .single()

  if (!profile?.active) {
    await supabase.auth.signOut()
    redirect('/login?erro=conta-desativada')
  }

  redirect(profile.role === 'admin' ? '/admin/pedidos' : '/')
}

export interface ChangePasswordState {
  error?: string
  ok?: boolean
}

export async function changePassword(
  _prev: ChangePasswordState,
  formData: FormData
): Promise<ChangePasswordState> {
  const password = String(formData.get('password') ?? '')
  const confirm = String(formData.get('confirm') ?? '')

  if (password.length < 6) {
    return { error: 'A nova senha precisa de pelo menos 6 caracteres.' }
  }
  if (password !== confirm) {
    return { error: 'As senhas não conferem. Digite a mesma senha nos dois campos.' }
  }

  const supabase = await createServerSupabase()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Sessão expirada. Entre novamente.' }

  const { error } = await supabase.auth.updateUser({ password })
  if (error) {
    if (error.message.includes('different from the old')) {
      return { error: 'A nova senha precisa ser diferente da atual.' }
    }
    return { error: 'Não foi possível trocar a senha. Tente novamente.' }
  }
  return { ok: true }
}

export async function signOut() {
  const supabase = await createServerSupabase()
  await supabase.auth.signOut()
  redirect('/login')
}
