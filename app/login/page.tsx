import { FileCheck2, QrCode, ShoppingBasket } from 'lucide-react'
import { signIn } from '@/app/actions/auth'
import { InstallAppButton } from '@/components/install-app-button'

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
      <section className="relative hidden overflow-hidden bg-azul p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(80% 60% at 20% 0%, rgba(255,255,255,0.08), transparent 60%), radial-gradient(60% 50% at 100% 100%, rgba(0,0,0,0.25), transparent 60%)',
          }}
        />
        {/* Símbolo da marca em marca d'água */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          aria-hidden
          src="/logo-lito-branco.png"
          alt=""
          className="pointer-events-none absolute -bottom-20 -right-24 w-[34rem] select-none opacity-[0.05]"
        />

        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-lito-branco.png" alt="Lito Aviation Academy" className="h-11 w-auto" />
          <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.3em] text-verde">
            Mercadinho do Lito
          </p>
        </div>

        <div className="relative max-w-md">
          <h1 className="text-3xl font-bold uppercase leading-snug tracking-wide">
            O mercadinho da equipe,{' '}
            <span className="text-verde">agora no seu celular.</span>
          </h1>
          <ul className="mt-10 space-y-6">
            {PASSOS.map((passo) => {
              const Icon = passo.icon
              return (
                <li key={passo.title} className="flex items-start gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10 text-verde">
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
          © {new Date().getFullYear()} Lito Aviation Academy · uso interno
        </p>
      </section>

      {/* Formulário */}
      <section className="flex flex-col bg-cinza-claro">
        {/* Faixa da marca no mobile */}
        <div className="bg-azul px-6 pb-8 pt-9 text-white lg:hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-lito-branco.png" alt="Lito Aviation Academy" className="h-10 w-auto" />
          <p className="mt-3.5 text-[11px] font-semibold uppercase tracking-[0.3em] text-verde">
            Mercadinho do Lito
          </p>
        </div>

        <div className="flex flex-1 items-center justify-center p-6">
          <div className="w-full max-w-sm">
            <div className="hidden lg:block">
              <h2 className="text-2xl font-bold text-texto">Entrar</h2>
              <p className="mb-8 mt-1 text-sm text-texto/50">
                Use a conta criada pelo administrador.
              </p>
            </div>

            {erro && (
              <p className="mb-5 rounded-lg border border-erro/25 bg-erro/5 p-3 text-sm text-erro-escuro">
                {ERROS[erro] ?? 'Não foi possível entrar.'}
              </p>
            )}

            <form action={signIn} className="mt-6 space-y-4 lg:mt-0">
              <div>
                <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-texto/80">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  className="w-full rounded-lg border border-texto/15 bg-white px-3.5 py-2.5 text-texto shadow-sm transition placeholder:text-texto/30 focus:border-azul focus:outline-none focus:ring-2 focus:ring-azul/15"
                />
              </div>
              <div>
                <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-texto/80">
                  Senha
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  className="w-full rounded-lg border border-texto/15 bg-white px-3.5 py-2.5 text-texto shadow-sm transition focus:border-azul focus:outline-none focus:ring-2 focus:ring-azul/15"
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-lg bg-verde py-2.5 font-bold uppercase tracking-wide text-azul shadow-sm transition hover:brightness-95"
              >
                Entrar
              </button>
            </form>

            <div className="mt-4">
              <InstallAppButton />
            </div>

            <p className="mt-6 text-center text-xs text-texto/40">
              Sem conta? Peça ao administrador para criar a sua.
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}
