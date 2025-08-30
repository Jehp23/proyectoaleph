"use client"

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

export default function SettingsPage() {
  const { toast } = useToast()

  // Settings state
  const [language, setLanguage] = useState("es")
  const [theme, setTheme] = useState("dark")
  const [vaultManagerAddress, setVaultManagerAddress] = useState("0x742d35Cc6634C0532925a3b8D4C9db96590b5c8e")
  const [btcTokenAddress, setBtcTokenAddress] = useState("0xA0b86a33E6441b8dB4B2b8b8b8b8b8b8b8b8b8b8")
  const [usdtTokenAddress, setUsdtTokenAddress] = useState("0xdAC17F958D2ee523a2206206994597C13D831ec7")
  const [oracleAddress, setOracleAddress] = useState("0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419")

  // Theme initialization and persistence
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "dark"
    setTheme(savedTheme)
    document.documentElement.classList.toggle("dark", savedTheme === "dark")
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

  const handleSaveContracts = () => {
    // In a real app, this would save to localStorage or backend
    toast({
      title: "Configuración guardada",
      description: "Las direcciones de contratos han sido actualizadas correctamente.",
    })
  }

  const handleResetToDefaults = () => {
    setVaultManagerAddress("0x742d35Cc6634C0532925a3b8D4C9db96590b5c8e")
    setBtcTokenAddress("0xA0b86a33E6441b8dB4B2b8b8b8b8b8b8b8b8b8b8")
    setUsdtTokenAddress("0xdAC17F958D2ee523a2206206994597C13D831ec7")
    setOracleAddress("0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419")
    toast({
      title: "Configuración restablecida",
      description: "Se han restaurado los valores por defecto.",
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
              Desarrolladores
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <div className="flex items-start gap-2">
                <Code className="h-5 w-5 text-yellow-500 mt-0.5" />
                <div className="text-sm">
                  <div className="font-medium text-yellow-500 mb-1">Configuración avanzada</div>
                  <p className="text-muted-foreground">
                    Estas configuraciones son para desarrolladores. Cambiar estas direcciones puede afectar el
                    funcionamiento de la aplicación.
                  </p>
                </div>
              </div>
            </div>

            {/* Contract Addresses */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="vault-manager">Dirección del VaultManager</Label>
                <Input
                  id="vault-manager"
                  value={vaultManagerAddress}
                  onChange={(e) => setVaultManagerAddress(e.target.value)}
                  placeholder="0x..."
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">Contrato principal que gestiona los vaults de colateral</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="btc-token">Dirección del token BTC</Label>
                <Input
                  id="btc-token"
                  value={btcTokenAddress}
                  onChange={(e) => setBtcTokenAddress(e.target.value)}
                  placeholder="0x..."
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">Token ERC-20 que representa BTC (WBTC)</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="usdt-token">Dirección del token USDT</Label>
                <Input
                  id="usdt-token"
                  value={usdtTokenAddress}
                  onChange={(e) => setUsdtTokenAddress(e.target.value)}
                  placeholder="0x..."
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">Token ERC-20 utilizado para los préstamos (USDT)</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="oracle-address">Dirección del Oracle de precios</Label>
                <Input
                  id="oracle-address"
                  value={oracleAddress}
                  onChange={(e) => setOracleAddress(e.target.value)}
                  placeholder="0x..."
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">Oracle de Chainlink para el precio BTC/USD</p>
              </div>
            </div>

            <Separator />

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button onClick={handleSaveContracts} className="gap-2">
                <Save className="h-4 w-4" />
                Guardar configuración
              </Button>
              <Button variant="outline" onClick={handleResetToDefaults} className="gap-2 bg-transparent">
                Restablecer por defecto
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
                  <span className="text-muted-foreground">Estado:</span>
                  <span className="font-medium text-green-500">Conectado</span>
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
                <div className="font-medium">Agosto 2025</div>
              </div>
            </div>

            <Separator />

            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">CautioLink - Caución cripto no-custodial</p>
              <p className="text-xs text-muted-foreground">Construido con Next.js, Tailwind CSS y shadcn/ui | Hecho en V0</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
