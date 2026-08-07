import { signIn } from '@/app/actions/auth'
import { Awning } from '@/components/awning'

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
        <div className="overflow-hidden rounded-2xl border-2 border-cafe/15 bg-[#FFFDF8] shadow-[0_12px_0_-6px_rgba(51,36,26,0.15)]">
          <Awning />

          <div className="p-8 pt-6">
            {/* Letreiro */}
            <div className="mb-7 text-center">
              <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-tomate">
                Aberto pra quem é de casa
              </p>
              <h1 className="mt-2 font-slab text-4xl leading-none text-feira-dark">
                MERCADINHO
              </h1>
              <div className="mt-2 inline-block -rotate-2 rounded-md bg-banana px-3 py-1 shadow-sm">
                <span className="font-slab text-xl leading-none text-cafe">DO LITO</span>
              </div>
            </div>

            {erro && (
              <p className="mb-4 rounded-lg border border-tomate/30 bg-tomate/10 p-3 text-sm font-medium text-tomate-dark">
                {ERROS[erro] ?? 'Não foi possível entrar.'}
              </p>
            )}

            <form action={signIn} className="space-y-4">
              <div>
                <label htmlFor="email" className="mb-1 block text-sm font-semibold text-cafe">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="voce@empresa.com"
                  className="w-full rounded-xl border-2 border-cafe/20 bg-white px-3 py-2.5 text-cafe placeholder:text-cafe/30 focus:border-feira focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="password" className="mb-1 block text-sm font-semibold text-cafe">
                  Senha
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  className="w-full rounded-xl border-2 border-cafe/20 bg-white px-3 py-2.5 text-cafe focus:border-feira focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-xl bg-tomate py-3 font-slab text-lg tracking-wide text-white shadow-[0_4px_0_0] shadow-tomate-dark transition hover:brightness-105 active:translate-y-0.5 active:shadow-none"
              >
                ENTRAR
              </button>
            </form>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-cafe/50">
          Sem conta? Peça ao administrador para criar a sua.
        </p>
      </div>
    </main>
  )
}
