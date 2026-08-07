import 'server-only'
import { redirect } from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase/server'
import type { Profile } from '@/lib/types'

export async function requireUser(): Promise<{ profile: Profile }> {
  const supabase = await createServerSupabase()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single<Profile>()

  if (!profile || !profile.active) {
    await supabase.auth.signOut()
    redirect('/login?erro=conta-desativada')
  }
  return { profile }
}

export async function requireAdmin(): Promise<{ profile: Profile }> {
  const { profile } = await requireUser()
  if (profile.role !== 'admin') redirect('/')
  return { profile }
}
