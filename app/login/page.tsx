import { FileCheck2, QrCode, ShoppingBasket } from 'lucide-react'
import { signIn } from '@/app/actions/auth'

const ERROS: Record<string, string> = {
  credenciais: 'Email ou senha incorretos.',
  'conta-desativada': 'Sua conta está desativada. Fale com o administrador.',
}

const PASSOS = [
  { icon: ShoppingBasket, title: 'Escolha os produtos', text: 'Monte o carrinho direto do celular.' },
  { icon: QrCode, title: 'Pague no PIX', text: 'QR code na tela, com o valor exato.' },
  { icon: FileCheck2, title: 'Envie o comprovante', text: 'O pedido cai na conferência do admin.' },
]

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>
}) {
  const { erro } = await searchParams

  return (
    <main className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      {/* Painel institucional */}
      <section className="relative hidden overflow-hidden bg-feira-dark p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(80% 60% at 20% 0%, rgba(255,255,255,0.08), transparent 60%), radial-gradient(60% 50% at 100% 100%, rgba(0,0,0,0.25), transparent 60%)',
          }}
        />
        <span
          aria-hidden
          className="pointer-events-none absolute -bottom-24 -right-10 select-none font-slab text-[26rem] font-semibold leading-none text-white/[0.04]"
        >
          M
        </span>

        <div className="relative">
          <p className="font-slab text-xl font-semibold">Mercadinho do Lito</p>
          <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.3em] text-white/40">
            LitoGroup
          </p>
        </div>

        <div className="relative max-w-md">
          <h1 className="font-slab text-4xl font-semibold leading-tight">
            A lojinha da firma, agora no seu bolso.
          </h1>
          <ul className="mt-10 space-y-6">
            {PASSOS.map((passo) => {
              const Icon = passo.icon
              return (
                <li key={passo.title} className="flex items-start gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10">
                    <Icon className="h-5 w-5" strokeWidth={1.8} />
                  </span>
                  <div>
                    <p className="font-semibold">{passo.title}</p>
                    <p className="text-sm text-white/55">{passo.text}</p>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>

        <p className="relative text-xs text-white/35">
          © {new Date().getFullYear()} LitoGroup · uso interno
        </p>
      </section>

      {/* Formulário */}
      <section className="flex flex-col bg-creme">
        {/* Faixa da marca no mobile */}
        <div className="bg-feira-dark px-6 pb-8 pt-10 text-white lg:hidden">
          <p className="font-slab text-2xl font-semibold">Mercadinho do Lito</p>
          <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.3em] text-white/40">
            Compras internas · LitoGroup
          </p>
        </div>

        <div className="flex flex-1 items-center justify-center p-6">
          <div className="w-full max-w-sm">
            <div className="hidden lg:block">
              <h2 className="font-slab text-2xl font-semibold text-cafe">Entrar</h2>
              <p className="mb-8 mt-1 text-sm text-cafe/50">
                Use a conta criada pelo administrador.
              </p>
            </div>

            {erro && (
              <p className="mb-5 rounded-lg border border-tomate/20 bg-tomate/5 p-3 text-sm text-tomate-dark">
                {ERROS[erro] ?? 'Não foi possível entrar.'}
              </p>
            )}

            <form action={signIn} className="mt-6 space-y-4 lg:mt-0">
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
                  className="w-full rounded-lg border border-cafe/15 bg-white px-3.5 py-2.5 text-cafe shadow-sm transition placeholder:text-cafe/30 focus:border-feira focus:outline-none focus:ring-2 focus:ring-feira/15"
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
                  className="w-full rounded-lg border border-cafe/15 bg-white px-3.5 py-2.5 text-cafe shadow-sm transition focus:border-feira focus:outline-none focus:ring-2 focus:ring-feira/15"
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-lg bg-feira py-2.5 font-semibold text-white shadow-sm transition hover:bg-feira-dark"
              >
                Entrar
              </button>
            </form>

            <p className="mt-6 text-center text-xs text-cafe/40">
              Sem conta? Peça ao administrador para criar a sua.
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}
