import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: 'Mercadinho do Lito',
    short_name: 'Mercadinho',
    description: 'Compras internas · Lito Aviation Academy',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#F4F5F7',
    theme_color: '#002E53',
    orientation: 'portrait',
    // PNG, e nao SVG: o Chrome exige um icone raster de 192 e um de 512 para
    // considerar o app instalavel, e ignora SVG nesse critério.
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      // O Android recorta o icone em varias formas e come até 20% de cada
      // borda; nestes a arte vem reduzida sobre o azul da marca.
      { src: '/icon-maskable-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
      { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
}
