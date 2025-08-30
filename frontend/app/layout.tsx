import type React from "react"
import type { Metadata } from "next"
import { Suspense } from "react"
import { Providers } from "./providers"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import "./globals.css"

export const metadata: Metadata = {
  title: "CautioLink (Sepolia)",
  description: "Caución cripto no-custodial: depositá BTC, tomá USDT",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className="dark">
      <body className="font-sans antialiased">
        <Providers>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
            <Suspense fallback={null}>{children}</Suspense>
            <Toaster />
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  )
}
