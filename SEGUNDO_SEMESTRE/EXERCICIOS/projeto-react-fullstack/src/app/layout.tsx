import type { Metadata } from "next";
import "./globals.css";
import React from "react";
import { Header } from "@/components/layout";
import { Footer } from "@/components/layout";

export const metadata: Metadata = {
  title: {
    default: "Minha Hamburgueria",
    template: "%s | Minha Hamburgueria",
  },
  description: "O melhor hambúrguer artesanal da cidade. Peça agora!",
  keywords: ["hamburgueria", "hambúrguer artesanal", "delivery"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        {/* Header fixo no topo de todas as páginas */}
        <Header />

        {/* Conteúdo dinâmico de cada rota */}
        <main className="main-content">
          {children}
        </main>

        {/* Footer no final de todas as páginas */}
        <Footer />
      </body>
    </html>
  );
}