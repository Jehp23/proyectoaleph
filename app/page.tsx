"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Home, PlusCircle, Search, Wallet, TrendingUp, Menu, X, Sun, Moon, Zap, User, Settings } from "lucide-react"

export default function HomePage() {
  const [btcPrice, setBtcPrice] = useState(45000)
  const [mounted, setMounted] = useState(false)
  const [isDark, setIsDark] = useState(false)
  const [executionMode, setExecutionMode] = useState<"manual" | "assisted">("manual")
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
    const savedTheme = localStorage.getItem("theme")
    const prefersDark =
      savedTheme === "dark" || (!savedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches)
    setIsDark(prefersDark)
    document.documentElement.classList.toggle("dark", prefersDark)

    const interval = setInterval(() => {
      setBtcPrice((prev) => prev + (Math.random() - 0.5) * 100)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const toggleTheme = () => {
    const newTheme = !isDark
    setIsDark(newTheme)
    localStorage.setItem("theme", newTheme ? "dark" : "light")
    document.documentElement.classList.toggle("dark", newTheme)
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Cargando CauciónBTC...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen transition-colors duration-300">
      <div className="flex h-screen bg-white dark:bg-gray-900">
        {/* Sidebar */}
        <div
          className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}
        >
          <div className="flex items-center justify-between h-14 px-4 border-b border-gray-200 dark:border-gray-700">
            <Link href="/" className="flex items-center space-x-2">
              <span className="font-bold text-xl text-gray-900 dark:text-white">CauciónBTC</span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <X className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
          <nav className="p-4 space-y-2">
            <Link
              href="/"
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border-l-4 border-blue-600"
            >
              <Home className="h-4 w-4" />
              Inicio
            </Link>
            <Link
              href="/new"
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
            >
              <PlusCircle className="h-4 w-4" />
              Crear Vault
            </Link>
            <Link
              href="/vaults"
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
            >
              <Search className="h-4 w-4" />
              Explorar Vaults
            </Link>
            <Link
              href="/me"
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
            >
              <Wallet className="h-4 w-4" />
              Mis Vaults
            </Link>
            <Link
              href="/liquidations"
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
            >
              <TrendingUp className="h-4 w-4" />
              Liquidaciones
            </Link>
            <Link
              href="/settings"
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
            >
              <Settings className="h-4 w-4" />
              Ajustes
            </Link>
          </nav>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="border-b border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-900/95">
            <div className="flex h-14 items-center px-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden mr-2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Menu className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              </button>
              <div className="flex flex-1 items-center justify-end space-x-2">
                <button
                  onClick={toggleTheme}
                  className="flex items-center gap-2 px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  title={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
                >
                  {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                  <span className="text-sm text-gray-700 dark:text-gray-300">{isDark ? "Claro" : "Oscuro"}</span>
                </button>
                <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300">
                  Conectar Wallet
                </button>
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 overflow-auto p-6">
            {/* Execution Mode Selector */}
            <div className="mb-8 p-6 border-2 border-blue-200 dark:border-blue-800 rounded-lg bg-white dark:bg-gray-800">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Modo de Ejecución
              </h3>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => setExecutionMode("manual")}
                  className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                    executionMode === "manual"
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <User className="h-4 w-4" />
                    <span className="font-semibold text-gray-900 dark:text-white">Modo Manual</span>
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-600 dark:text-gray-400">
                      Gratis
                    </span>
                  </div>
                  <p className="text-sm text-left text-gray-600 dark:text-gray-400">
                    Ejecutás tus propias transacciones. Control total, pagás tu propio gas.
                  </p>
                </button>
                <button
                  onClick={() => setExecutionMode("assisted")}
                  className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                    executionMode === "assisted"
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="h-4 w-4" />
                    <span className="font-semibold text-gray-900 dark:text-white">Modo Asistido</span>
                    <span className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs text-gray-600 dark:text-gray-400">
                      0.5% fee
                    </span>
                  </div>
                  <p className="text-sm text-left text-gray-600 dark:text-gray-400">
                    Nosotros ejecutamos por vos. Sin gas, solo firmás una vez.
                  </p>
                </button>
              </div>
            </div>

            {/* Hero Section */}
            <div className="text-center space-y-4 mb-8">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Caución cripto no-custodial</h1>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Depositá BTC como colateral y tomá préstamos en USDT de forma descentralizada y segura
              </p>
            </div>

            {/* BTC Price */}
            <div className="max-w-md mx-auto mb-8 p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">
                  ${btcPrice.toLocaleString("es-AR", { maximumFractionDigits: 0 })}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Precio BTC/USD</div>
              </div>
            </div>

            {/* CTA Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Link href="/new" className="block">
                <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-all cursor-pointer group">
                  <div className="text-center">
                    <div className="mx-auto h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mb-4">
                      <PlusCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Crear vault</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-3">
                      Deposita BTC como colateral y toma un préstamo en USDT
                    </p>
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        executionMode === "manual"
                          ? "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                          : "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400"
                      }`}
                    >
                      {executionMode === "manual" ? "Modo Manual" : "Modo Asistido"}
                    </span>
                  </div>
                </div>
              </Link>

              <Link href="/me" className="block">
                <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-green-500 transition-all cursor-pointer">
                  <div className="text-center">
                    <div className="mx-auto h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mb-4">
                      <Wallet className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Gestionar vaults</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Administra tus vaults activos, agrega colateral o paga deudas
                    </p>
                  </div>
                </div>
              </Link>

              <Link href="/vaults" className="block">
                <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-yellow-500 transition-all cursor-pointer">
                  <div className="text-center">
                    <div className="mx-auto h-12 w-12 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center mb-4">
                      <Search className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Explorar vaults</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Explora todos los vaults del protocolo y analiza métricas
                    </p>
                  </div>
                </div>
              </Link>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">2.5 BTC</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total Value Locked</div>
                </div>
              </div>
              <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">$85,000</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total prestado</div>
                </div>
              </div>
              <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">12</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Vaults activos</div>
                </div>
              </div>
              <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">65%</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">LTV promedio</div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Acciones rápidas</h3>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/new"
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <PlusCircle className="h-4 w-4" />
                  Crear vault
                </Link>
                <Link
                  href="/vaults"
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
                >
                  <Search className="h-4 w-4" />
                  Explorar vaults
                </Link>
                <Link
                  href="/me"
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
                >
                  <Wallet className="h-4 w-4" />
                  Mis vaults
                </Link>
                <Link
                  href="/liquidations"
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
                >
                  <TrendingUp className="h-4 w-4" />
                  Ver liquidaciones
                </Link>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  )
}
