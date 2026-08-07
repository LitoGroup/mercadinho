import { signIn } from '@/app/actions/auth'

const ERROS: Record<string, string> = {
  credenciais: 'Email ou senha incorretos.',
  'conta-desativada': 'Sua conta está desativada. Fale com o administrador.',
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>
}) {
  const { erro } = await searchParams

  return (
    <main className="flex min-h-screen items-center justify-center bg-creme p-4">
      <div className="w-full max-w-sm">
        <div className="rounded-2xl border border-cafe/8 bg-white p-8 shadow-sm">
          <div className="mb-8">
            <p className="font-slab text-[26px] font-semibold leading-tight text-feira-dark">
              Mercadinho do Lito
            </p>
            <p className="mt-1 text-sm text-cafe/50">Compras internas · LitoGroup</p>
          </div>

          {erro && (
            <p className="mb-5 rounded-lg border border-tomate/20 bg-tomate/5 p-3 text-sm text-tomate-dark">
              {ERROS[erro] ?? 'Não foi possível entrar.'}
            </p>
          )}

          <form action={signIn} className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-cafe/80">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className="w-full rounded-lg border border-cafe/15 bg-white px-3.5 py-2.5 text-cafe transition placeholder:text-cafe/30 focus:border-feira focus:outline-none focus:ring-2 focus:ring-feira/15"
              />
            </div>
            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-cafe/80">
                Senha
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="w-full rounded-lg border border-cafe/15 bg-white px-3.5 py-2.5 text-cafe transition focus:border-feira focus:outline-none focus:ring-2 focus:ring-feira/15"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-lg bg-feira py-2.5 font-semibold text-white transition hover:bg-feira-dark"
            >
              Entrar
            </button>
          </form>
        </div>

        <p className="mt-5 text-center text-xs text-cafe/40">
          Sem conta? Peça ao administrador para criar a sua.
        </p>
      </div>
    </main>
  )
}
