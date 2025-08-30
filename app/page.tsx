"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { PlusCircle, Search, Wallet, Zap, User, Settings } from "lucide-react"
import { MainLayout } from "@/components/layout/main-layout"
import { useExecutionMode } from "@/lib/execution-mode-context"

export default function HomePage() {
  const [btcPrice, setBtcPrice] = useState(45000)
  const { mode, setMode, isManualMode, isAssistedMode } = useExecutionMode()

  useEffect(() => {
    const interval = setInterval(() => {
      setBtcPrice((prev) => prev + (Math.random() - 0.5) * 100)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Execution Mode Selector */}
        <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Modo de Ejecución
          </h3>
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => setMode("manual")}
              className={`flex-1 p-4 rounded-lg border transition-all ${
                isManualMode
                  ? "border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20"
                  : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <User className="h-4 w-4" />
                <span className="font-semibold text-gray-900 dark:text-white">Modo Manual (Lite)</span>
                <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded text-xs">
                  Gratis
                </span>
              </div>
              <p className="text-sm text-left text-gray-600 dark:text-gray-400">
                Interfaz simplificada. Ejecutás tus propias transacciones, pagás tu propio gas.
              </p>
            </button>
            <button
              onClick={() => setMode("assisted")}
              className={`flex-1 p-4 rounded-lg border transition-all ${
                isAssistedMode
                  ? "border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20"
                  : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Settings className="h-4 w-4" />
                <span className="font-semibold text-gray-900 dark:text-white">Modo Asistido (Pro)</span>
                <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded text-xs">
                  0.5% fee
                </span>
              </div>
              <p className="text-sm text-left text-gray-600 dark:text-gray-400">
                Controles avanzados. Nosotros ejecutamos por vos, sin gas, solo firmás una vez.
              </p>
            </button>
          </div>
        </div>

        {/* Hero Section */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            {isManualMode ? "Caución cripto simple" : "Caución cripto profesional"}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {isManualMode
              ? "Depositá BTC como colateral y tomá préstamos en USDT de forma fácil y segura"
              : "Plataforma avanzada de préstamos descentralizados con herramientas profesionales"}
          </p>
        </div>

        {/* BTC Price */}
        <div className="max-w-md mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-500">
              ${btcPrice.toLocaleString("es-AR", { maximumFractionDigits: 0 })}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Precio BTC/USD</div>
          </div>
        </div>

        {/* CTA Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/new" className="block">
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500 transition-all cursor-pointer group">
              <div className="text-center">
                <div className="mx-auto h-12 w-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-4">
                  <PlusCircle className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                  {isManualMode ? "Crear vault" : "Crear vault avanzado"}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-3">
                  {isManualMode
                    ? "Deposita BTC como colateral y toma un préstamo en USDT"
                    : "Configuración avanzada con parámetros personalizables y análisis de riesgo"}
                </p>
                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-600 dark:text-gray-400">
                  {isManualMode ? "Modo Lite" : "Modo Pro"}
                </span>
              </div>
            </div>
          </Link>

          <Link href="/me" className="block">
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500 transition-all cursor-pointer">
              <div className="text-center">
                <div className="mx-auto h-12 w-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-4">
                  <Wallet className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Gestionar vaults</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Administra tus vaults activos, agrega colateral o paga deudas
                </p>
              </div>
            </div>
          </Link>

          <Link href="/vaults" className="block">
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500 transition-all cursor-pointer">
              <div className="text-center">
                <div className="mx-auto h-12 w-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-4">
                  <Search className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Explorar vaults</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Explora todos los vaults del protocolo y analiza métricas
                </p>
              </div>
            </div>
          </Link>
        </div>

        {/* KPI Cards - Show different metrics based on mode */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{isAssistedMode ? "1.85" : "65%"}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {isAssistedMode ? "Health Factor promedio" : "LTV promedio"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
