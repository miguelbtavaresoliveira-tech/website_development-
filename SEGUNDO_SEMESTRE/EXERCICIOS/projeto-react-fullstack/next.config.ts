import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Ativa o Strict Mode do React (detecta problemas em dev)
  reactStrictMode: true,

  // Pacotes que rodam APENAS no servidor (não são bundled para o client)
  // mysql2 precisa estar aqui para funcionar nas API Routes
  serverExternalPackages: ["mysql2"],

  // Define a raiz do workspace para o Turbopack resolver corretamente
  // (necessário quando o next/package.json não está junto ao src/)
  turbopack: {
    root: path.resolve(__dirname),
  },

  // Otimização de imagens — adicione domínios externos se necessário
  images: {
    remotePatterns: [
      // Exemplo: { protocol: 'https', hostname: 'seu-cdn.com' }
    ],
  },

  // Headers de segurança para produção
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
