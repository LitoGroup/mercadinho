import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Mercadinho do Lito',
    short_name: 'Mercadinho',
    description: 'O mercadinho da firma — pegue, pague no PIX, pronto.',
    start_url: '/',
    display: 'standalone',
    background_color: '#F2F5F9',
    theme_color: '#0F462D',
    orientation: 'portrait',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'maskable',
      },
    ],
  }
}
