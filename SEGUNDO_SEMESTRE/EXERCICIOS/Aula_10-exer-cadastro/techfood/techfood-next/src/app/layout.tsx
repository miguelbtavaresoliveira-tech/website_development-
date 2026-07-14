import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TechFood - Sabor & Saber",
  description: "TechFood - Sistema de gerenciamento de restaurante",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br">
      <body>{children}</body>
    </html>
  );
}
