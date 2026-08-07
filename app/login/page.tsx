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
    <main className="flex min-h-screen items-center justify-center bg-emerald-50 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-lg">
        <div className="mb-6 text-center">
          <div className="text-4xl">🛒</div>
          <h1 className="mt-2 text-2xl font-bold text-emerald-800">Mercadinho</h1>
          <p className="text-sm text-gray-500">Compras internas da empresa</p>
        </div>

        {erro && (
          <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {ERROS[erro] ?? 'Não foi possível entrar.'}
          </p>
        )}

        <form action={signIn} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700">
              Senha
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-lg bg-emerald-600 py-2.5 font-semibold text-white transition hover:bg-emerald-700"
          >
            Entrar
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-gray-400">
          Sem conta? Peça ao administrador para criar a sua.
        </p>
      </div>
    </main>
  )
}
