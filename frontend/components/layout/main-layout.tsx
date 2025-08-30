import type React from "react"
import { Header } from "./header"
import { Sidebar } from "./sidebar"

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 md:ml-64 pb-16 md:pb-0">
          <div className="container mx-auto px-4 py-6">{children}</div>
        </main>
      </div>
    </div>
  )
}
