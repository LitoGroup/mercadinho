import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Mercadinho do Lito',
    short_name: 'Mercadinho',
    description: 'Compras internas · Lito Aviation Academy',
    start_url: '/',
    display: 'standalone',
    background_color: '#F4F5F7',
    theme_color: '#002E53',
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
