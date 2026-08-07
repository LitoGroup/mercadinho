// Cria o primeiro usuário admin.
// Uso: node scripts/create-admin.mjs "Nome" email@empresa.com senha123
// Requer NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no ambiente (.env.local).

import { createClient } from '@supabase/supabase-js'
import { readFileSync, existsSync } from 'node:fs'

if (existsSync('.env.local')) {
  for (const line of readFileSync('.env.local', 'utf8').split('\n')) {
    const m = line.match(/^([A-Z_]+)=(.*)$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim()
  }
}

const [name, email, password] = process.argv.slice(2)
if (!name || !email || !password) {
  console.error('Uso: node scripts/create-admin.mjs "Nome" email@empresa.com senha123')
  process.exit(1)
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
)

const { data, error } = await supabase.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
  user_metadata: { name, role: 'admin' },
})

if (error) {
  console.error('Erro:', error.message)
  process.exit(1)
}
console.log(`Admin criado: ${data.user.email} (${data.user.id})`)
