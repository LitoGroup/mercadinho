import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isLogin = request.nextUrl.pathname.startsWith('/login')
  if (!user && !isLogin) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.search = ''
    return NextResponse.redirect(url)
  }
  if (user && isLogin) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    url.search = ''
    return NextResponse.redirect(url)
  }

  return response
}

// manifest.webmanifest e sw.js ficam fora do matcher de proposito.
//
// O navegador busca o manifest SEM cookies (a menos que se declare
// crossorigin="use-credentials"), entao o middleware o redirecionava para
// /login e o Chrome recebia HTML no lugar do manifest — o app nunca era
// considerado instalavel. O service worker precisa do mesmo tratamento para
// ser servido na raiz do escopo.
//
// Nenhum dos dois expoe dado sensivel: sao nome, cores, icones e um handler
// de fetch vazio.
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|sw\\.js|api/|.*\\.(?:svg|png|jpg|jpeg|webp|ico)$).*)'],
}
