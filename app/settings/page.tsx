"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Settings, Code, Save, Globe, Palette, Sun, Moon } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { loadAddresses, saveAddresses, clearAddresses, loadFromEnv } from "@/lib/addresses"
import { isAddress } from "viem"

type FormState = {
  VAULT_MANAGER: string
  WBTC: string
  MUSD: string
  ORACLE: string
}

const empty: FormState = { VAULT_MANAGER: "", WBTC: "", MUSD: "", ORACLE: "" }

export default function SettingsPage() {
  const { toast } = useToast()

  // Settings state
  const [language, setLanguage] = useState("es")
  const [theme, setTheme] = useState("dark")
  const [form, setForm] = useState<FormState>(empty)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  // Theme initialization and persistence
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "dark"
    setTheme(savedTheme)
    document.documentElement.classList.toggle("dark", savedTheme === "dark")
  }, [])

  useEffect(() => {
    const a = loadAddresses()
    if (a) {
      setForm({
        VAULT_MANAGER: a.VAULT_MANAGER,
        WBTC: a.WBTC,
        MUSD: a.MUSD,
        ORACLE: a.ORACLE,
      })
    } else {
      const env = loadFromEnv()
      setForm({
        VAULT_MANAGER: env.VAULT_MANAGER ?? "",
        WBTC: env.WBTC ?? "",
        MUSD: env.MUSD ?? "",
        ORACLE: env.ORACLE ?? "",
      })
    }
  }, [])

  // Theme change handler
  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme)
    localStorage.setItem("theme", newTheme)
    document.documentElement.classList.toggle("dark", newTheme === "dark")
    toast({
      title: "Tema actualizado",
      description: `Se ha cambiado al tema ${newTheme === "dark" ? "oscuro" : "claro"}.`,
    })
  }

  const onChange = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setSaved(false)
    setError(null)
    setForm((prev) => ({ ...prev, [k]: e.target.value.trim() }))
  }

  const validate = (f: FormState): string | null => {
    for (const k of ["VAULT_MANAGER", "WBTC", "MUSD", "ORACLE"] as (keyof FormState)[]) {
      const v = f[k]
      if (!isAddress(v as `0x${string}`)) return `Campo ${k} inválido: debe ser una dirección 0x…`
    }
    return null
  }

  const handleSaveContracts = () => {
    const err = validate(form)
    if (err) {
      setError(err)
      setSaved(false)
      toast({
        title: "Error de validación",
        description: err,
        variant: "destructive",
      })
      return
    }
    const res = saveAddresses(form as any)
    if (!res.ok) {
      setError(res.error ?? "Error al guardar")
      setSaved(false)
      toast({
        title: "Error al guardar",
        description: res.error ?? "Error al guardar",
        variant: "destructive",
      })
      return
    }
    setSaved(true)
    toast({
      title: "Configuración guardada",
      description: "Las direcciones han sido guardadas. Recargando aplicación...",
    })
    // refrescar para que lib/contracts.ts lea las nuevas direcciones
    setTimeout(() => window.location.reload(), 1000)
  }

  const handleResetToDefaults = () => {
    clearAddresses()
    setForm(empty)
    setSaved(false)
    setError(null)
    toast({
      title: "Configuración limpiada",
      description: "Se han eliminado todas las direcciones guardadas.",
    })
  }

  const handleLoadFromEnv = () => {
    const env = loadFromEnv()
    setForm({
      VAULT_MANAGER: env.VAULT_MANAGER ?? "",
      WBTC: env.WBTC ?? "",
      MUSD: env.MUSD ?? "",
      ORACLE: env.ORACLE ?? "",
    })
    setSaved(false)
    setError(null)
    toast({
      title: "Cargado desde ENV",
      description: "Se han cargado las direcciones desde las variables de entorno.",
    })
  }

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-2">
          <Settings className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold">Ajustes</h1>
        </div>

        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              General
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Language Setting */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="language-setting">Idioma</Label>
                <p className="text-sm text-muted-foreground">Selecciona el idioma de la interfaz</p>
              </div>
              <div className="w-48">
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="es">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        Español
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            {/* Theme Setting */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="theme-setting">Tema</Label>
                <p className="text-sm text-muted-foreground">Personaliza la apariencia de la aplicación</p>
              </div>
              <div className="w-48">
                <Select value={theme} onValueChange={handleThemeChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">
                      <div className="flex items-center gap-2">
                        <Sun className="h-4 w-4" />
                        Claro
                      </div>
                    </SelectItem>
                    <SelectItem value="dark">
                      <div className="flex items-center gap-2">
                        <Moon className="h-4 w-4" />
                        Oscuro
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Developer Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              Direcciones del Protocolo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <div className="flex items-start gap-2">
                <Code className="h-5 w-5 text-yellow-500 mt-0.5" />
                <div className="text-sm">
                  <div className="font-medium text-yellow-500 mb-1">Configuración de contratos</div>
                  <p className="text-muted-foreground">
                    Pega las direcciones de los contratos. Se guardan localmente en tu navegador (no en el servidor).
                  </p>
                </div>
              </div>
            </div>

            {/* Contract Addresses */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="vault-manager">VAULT_MANAGER</Label>
                <Input
                  id="vault-manager"
                  value={form.VAULT_MANAGER}
                  onChange={onChange("VAULT_MANAGER")}
                  placeholder="0x..."
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">Contrato principal que gestiona los vaults de colateral</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="wbtc">WBTC</Label>
                <Input
                  id="wbtc"
                  value={form.WBTC}
                  onChange={onChange("WBTC")}
                  placeholder="0x..."
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">Token ERC-20 que representa BTC (WBTC)</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="musd">MUSD</Label>
                <Input
                  id="musd"
                  value={form.MUSD}
                  onChange={onChange("MUSD")}
                  placeholder="0x..."
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">Token ERC-20 utilizado para los préstamos (mUSD)</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="oracle">ORACLE</Label>
                <Input
                  id="oracle"
                  value={form.ORACLE}
                  onChange={onChange("ORACLE")}
                  placeholder="0x..."
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">Oracle de precios para BTC/USD</p>
              </div>
            </div>

            {error && <div className="mt-2 text-sm text-red-600">⚠️ {error}</div>}
            {saved && !error && (
              <div className="mt-2 text-sm text-green-700">✅ Direcciones guardadas. Recargando…</div>
            )}

            <Separator />

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button onClick={handleSaveContracts} className="gap-2">
                <Save className="h-4 w-4" />
                Guardar
              </Button>
              <Button variant="outline" onClick={handleLoadFromEnv} className="gap-2 bg-transparent">
                Cargar de ENV
              </Button>
              <Button variant="outline" onClick={handleResetToDefaults} className="gap-2 bg-transparent">
                Limpiar
              </Button>
            </div>

            {/* Network Info */}
            <div className="p-4 bg-muted rounded-lg">
              <div className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Red:</span>
                  <span className="font-medium">Sepolia Testnet</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Chain ID:</span>
                  <span className="font-medium">11155111</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Clave localStorage:</span>
                  <span className="font-medium font-mono text-xs">protocol.addresses</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* App Info */}
        <Card>
          <CardHeader>
            <CardTitle>Información de la aplicación</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Versión:</span>
                <div className="font-medium">1.0.0-beta</div>
              </div>
              <div>
                <span className="text-muted-foreground">Última actualización:</span>
                <div className="font-medium">Enero 2024</div>
              </div>
            </div>

            <Separator />

            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">CauciónBTC - Caución cripto no-custodial</p>
              <p className="text-xs text-muted-foreground">Construido con Next.js, Tailwind CSS y shadcn/ui</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
