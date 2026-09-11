import type { NextConfig } from "next";

// As fotos ficam no bucket publico do Supabase. Derivar do env mantem o
// otimizador restrito ao projeto da loja; o curinga e so uma rede de seguranca
// para quando a variavel nao existe no ambiente de build.
const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : "*.supabase.co";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Fotos de produto sobem via action; folga acima do limite de 1 MB padrão
      bodySizeLimit: "15mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: supabaseHost,
        pathname: "/storage/v1/object/public/products/**",
      },
    ],
    // As fotos sao guardadas com 1024 px, mas a grade do celular mostra
    // miniaturas de ~180 px: o catalogo baixava cerca de 9 MB para desenhar
    // thumbnails. Estas listas sao curtas de proposito — cada largura extra e
    // uma transformacao a mais na cota da Vercel.
    imageSizes: [48, 56, 96, 192],
    deviceSizes: [384, 640, 1080],
    minimumCacheTTL: 60 * 60 * 24 * 365,
  },
};

export default nextConfig;
