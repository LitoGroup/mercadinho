import { generateText } from 'ai'
import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'

interface OffProduct {
  product_name?: string
  brands?: string
  categories?: string
  quantity?: string
}

async function lookupOpenFoodFacts(ean: string): Promise<OffProduct | null> {
  try {
    const res = await fetch(`https://world.openfoodfacts.org/api/v2/product/${ean}.json`, {
      signal: AbortSignal.timeout(3000),
    })
    if (!res.ok) return null
    const json = await res.json()
    return json?.product ?? null
  } catch {
    return null
  }
}

export async function POST(request: Request) {
  // Só admin pode usar a IA
  const supabase = await createServerSupabase()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, active')
    .eq('id', user.id)
    .single()
  if (profile?.role !== 'admin' || !profile.active) {
    return NextResponse.json({ error: 'Apenas administradores' }, { status: 403 })
  }

  const { imageBase64, mediaType, ean } = await request.json()
  if (!imageBase64 && !ean) {
    return NextResponse.json({ error: 'Envie uma foto ou um código de barras' }, { status: 400 })
  }

  const off = ean ? await lookupOpenFoodFacts(ean) : null
  const offContext = off
    ? `Dados do código de barras ${ean} (Open Food Facts): nome "${off.product_name ?? '?'}", marca "${off.brands ?? '?'}", categorias "${off.categories ?? '?'}", quantidade "${off.quantity ?? '?'}".`
    : ean
      ? `O código de barras é ${ean}, mas não foi encontrado em bases públicas.`
      : 'Sem código de barras.'

  const instruction = `Você cadastra produtos de um mercadinho interno de empresa no Brasil.
${offContext}
Com base ${imageBase64 ? 'na foto anexa e ' : ''}nesses dados, responda SOMENTE um JSON válido (sem markdown) no formato:
{"name": "nome curto do produto com marca e tamanho", "description": "descrição simpática de 1 a 2 frases em pt-BR", "category": "uma categoria simples como Bebidas, Doces, Salgadinhos, Higiene, Limpeza, Padaria, Laticínios ou Outros"}`

  try {
    const { text } = await generateText({
      model: 'anthropic/claude-sonnet-5',
      messages: [
        {
          role: 'user',
          content: imageBase64
            ? [
                { type: 'text', text: instruction },
                {
                  type: 'image',
                  image: imageBase64,
                  mediaType: mediaType ?? 'image/jpeg',
                },
              ]
            : instruction,
        },
      ],
    })

    const match = text.match(/\{[\s\S]*\}/)
    if (!match) throw new Error('resposta sem JSON')
    const parsed = JSON.parse(match[0])
    return NextResponse.json({
      name: String(parsed.name ?? '').slice(0, 120),
      description: String(parsed.description ?? '').slice(0, 500),
      category: String(parsed.category ?? 'Outros').slice(0, 40),
    })
  } catch {
    return NextResponse.json(
      { error: 'A IA não conseguiu gerar a descrição. Preencha manualmente.' },
      { status: 502 }
    )
  }
}
