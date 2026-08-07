import { UserActiveToggle } from '@/components/user-active-toggle'
import { UserForm } from '@/components/user-form'
import { formatDate } from '@/lib/format'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/auth'
import type { Profile } from '@/lib/types'

export default async function AdminUsersPage() {
  const { profile: me } = await requireAdmin()
  const admin = createAdminClient()

  const [{ data: profiles }, { data: authData }] = await Promise.all([
    admin.from('profiles').select('*').order('created_at', { ascending: false }),
    admin.auth.admin.listUsers({ perPage: 1000 }),
  ])
  const emailById = new Map(authData?.users.map((u) => [u.id, u.email]) ?? [])
  const users = (profiles ?? []) as Profile[]

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-texto">Usuários</h1>

      <UserForm />

      {/* Celular: cartões */}
      <ul className="space-y-3 sm:hidden">
        {users.map((u) => (
          <li
            key={u.id}
            className={`rounded-xl border border-texto/8 bg-white p-3 shadow-sm ${
              u.active ? '' : 'opacity-60'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-medium text-texto">
                  {u.name}
                  {u.id === me.id && <span className="ml-1 text-xs text-texto/40">(você)</span>}
                </p>
                <p className="truncate text-xs text-texto/50">{emailById.get(u.id) ?? '—'}</p>
              </div>
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${
                  u.role === 'admin' ? 'bg-azul/10 text-azul' : 'bg-cinza-claro text-texto/70'
                }`}
              >
                {u.role === 'admin' ? 'Admin' : 'Cliente'}
              </span>
            </div>
            {u.id !== me.id && (
              <div className="mt-3 border-t border-texto/6 pt-3">
                <UserActiveToggle userId={u.id} active={u.active} />
              </div>
            )}
          </li>
        ))}
      </ul>

      {/* Desktop: tabela */}
      <div className="hidden rounded-xl border border-texto/8 bg-white shadow-sm sm:block">
        <table className="w-full text-sm">
          <thead className="bg-cinza-claro text-left text-texto/50">
            <tr>
              <th className="p-3">Nome</th>
              <th className="p-3">Email</th>
              <th className="p-3">Papel</th>
              <th className="p-3">Criado em</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-texto/5">
            {users.map((u) => (
              <tr key={u.id} className={u.active ? '' : 'opacity-50'}>
                <td className="p-3 font-medium text-texto">
                  {u.name}
                  {u.id === me.id && <span className="ml-1 text-xs text-texto/40">(você)</span>}
                </td>
                <td className="p-3 text-texto/70">{emailById.get(u.id) ?? '—'}</td>
                <td className="p-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      u.role === 'admin'
                        ? 'bg-azul/10 text-azul'
                        : 'bg-cinza-claro text-texto/70'
                    }`}
                  >
                    {u.role === 'admin' ? 'Admin' : 'Cliente'}
                  </span>
                </td>
                <td className="p-3 text-texto/50">{formatDate(u.created_at)}</td>
                <td className="p-3">
                  {u.id !== me.id && <UserActiveToggle userId={u.id} active={u.active} />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
