import type { Metadata } from "next"
import "./globals.css"
import { AuthProvider } from "@/contexts/AuthContext"

export const metadata: Metadata = {
  title: "Atlas ENEM — Foco UFG 2026",
  description: "Plataforma de preparação ENEM com gamificação baseada nos pesos da UFG",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className="dark">
      <body className="min-h-screen bg-background antialiased">
        {/* Grid de fundo sutil estilo painel de missão */}
        <div
          className="pointer-events-none fixed inset-0 opacity-[0.02]"
          style={{
            backgroundImage:
              "linear-gradient(#388bfd 1px, transparent 1px), linear-gradient(90deg, #388bfd 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <AuthProvider>
          <div className="relative">{children}</div>
        </AuthProvider>
      </body>
    </html>
  )
}
