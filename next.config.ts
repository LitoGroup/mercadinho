import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Fotos de produto sobem via action; folga acima do limite de 1 MB padrão
      bodySizeLimit: "15mb",
    },
  },
};

export default nextConfig;
