"use client";

import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Settings, Code, Save, Palette, Sun, Moon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { isAddress } from "viem";
import { loadConfig, saveConfig, getPrice, type P2PConfig } from "@/lib/config-api";

export default function SettingsPage() {
  const { toast } = useToast();

  // UI (tema)
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  // Config P2P + Oracle
  const [cfg, setCfg] = useState<P2PConfig>({
    network: "sepolia",
    loan: "",
    usdtToken: "",
    wethToken: "",
    priceOracle: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastPrice, setLastPrice] = useState<string | null>(null);

  // init tema
  useEffect(() => {
    const saved = (localStorage.getItem("theme") as "light" | "dark") || "dark";
    setTheme(saved);
    document.documentElement.classList.toggle("dark", saved === "dark");
  }, []);

  // cargar config desde backend
  useEffect(() => {
    (async () => {
      try {
        const serverCfg = await loadConfig();
        setCfg((c) => ({ ...c, ...serverCfg }));
      } catch {
        toast({ title: "No pude cargar la configuración", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    })();
  }, [toast]);

  const handleThemeChange = (newTheme: "light" | "dark") => {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
    toast({
      title: "Tema actualizado",
      description: `Se cambió al tema ${newTheme === "dark" ? "oscuro" : "claro"}.`,
    });
  };

  const validate = () => {
    if (!cfg.loan || !isAddress(cfg.loan)) {
      toast({ title: "Dirección de préstamo inválida", variant: "destructive" });
      return false;
    }
    if (!cfg.usdtToken || !isAddress(cfg.usdtToken)) {
      toast({ title: "Dirección USDT inválida", variant: "destructive" });
      return false;
    }
    if (!cfg.wethToken || !isAddress(cfg.wethToken)) {
      toast({ title: "Dirección WETH inválida", variant: "destructive" });
      return false;
    }
    if (cfg.priceOracle && !isAddress(cfg.priceOracle)) {
      toast({ title: "Dirección de Oracle inválida", variant: "destructive" });
      return false;
    }
    return true;
  };

  const onSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const saved = await saveConfig(cfg, process.env.NEXT_PUBLIC_ADMIN_TOKEN);
      setCfg(saved);
      toast({ title: "Configuración guardada", description: "Se actualizaron las direcciones." });
    } catch (e: any) {
      toast({ title: "Error guardando", description: e?.message ?? "", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const onResetFromBackend = async () => {
    setLoading(true);
    try {
      const serverCfg = await loadConfig();
      setCfg(serverCfg);
      toast({ title: "Restaurado", description: "Valores cargados desde backend." });
    } catch {
      toast({ title: "No pude cargar la configuración", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const onTestOracle = async () => {
    try {
      const p = await getPrice();
      const text = `${p.description ?? "Oracle"} = ${p.price ?? "?"}`;
      setLastPrice(text);
      toast({ title: "Oracle OK", description: text });
    } catch (e: any) {
      toast({ title: "No se pudo leer el oracle", description: e?.message ?? "", variant: "destructive" });
    }
  };

  const chainName = cfg.network === "localhost" ? "Localhost (Hardhat)" : "Sepolia Testnet";
  const chainId = cfg.network === "localhost" ? 31337 : 11155111;

  if (loading) {
    return (
      <MainLayout>
        <div className="max-w-2xl mx-auto">Cargando…</div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-2">
          <Settings className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold">Ajustes</h1>
        </div>

        {/* General */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              General
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Tema</Label>
                <p className="text-sm text-muted-foreground">Apariencia de la aplicación</p>
              </div>
              <div className="w-48">
                <Select value={theme} onValueChange={(v) => handleThemeChange(v as "light" | "dark")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">
                      <div className="flex items-center gap-2">
                        <Sun className="h-4 w-4" /> Claro
                      </div>
                    </SelectItem>
                    <SelectItem value="dark">
                      <div className="flex items-center gap-2">
                        <Moon className="h-4 w-4" /> Oscuro
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Config P2P + Oracle */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              Configuración P2P
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-sm">
              Cambiar estas direcciones afecta el funcionamiento. Usa direcciones válidas de tu red.
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Dirección del préstamo (P2PSecuredLoan)</Label>
                <Input
                  value={cfg.loan || ""}
                  onChange={(e) => setCfg({ ...cfg, loan: e.target.value.trim() })}
                  placeholder="0x..."
                  className="font-mono text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label>Dirección USDT (stable)</Label>
                <Input
                  value={cfg.usdtToken || ""}
                  onChange={(e) => setCfg({ ...cfg, usdtToken: e.target.value.trim() })}
                  placeholder="0x..."
                  className="font-mono text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label>Dirección WETH (colateral)</Label>
                <Input
                  value={cfg.wethToken || ""}
                  onChange={(e) => setCfg({ ...cfg, wethToken: e.target.value.trim() })}
                  placeholder="0x..."
                  className="font-mono text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label>Dirección del Oracle (Chainlink)</Label>
                <Input
                  value={cfg.priceOracle || ""}
                  onChange={(e) => setCfg({ ...cfg, priceOracle: e.target.value.trim() })}
                  placeholder="0x..."
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">AggregatorV3Interface del par (p. ej., ETH/USD).</p>
              </div>

              <div className="space-y-2">
                <Label>Red</Label>
                <Select
                  value={cfg.network || "sepolia"}
                  onValueChange={(v) => setCfg({ ...cfg, network: v as "sepolia" | "localhost" })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sepolia">Sepolia</SelectItem>
                    <SelectItem value="localhost">Localhost (Hardhat)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            <div className="flex flex-wrap gap-3">
              <Button onClick={onSave} disabled={saving} className="gap-2">
                <Save className="h-4 w-4" />
                {saving ? "Guardando..." : "Guardar configuración"}
              </Button>
              <Button variant="outline" onClick={onResetFromBackend}>
                Restablecer desde backend
              </Button>
              <Button variant="outline" onClick={onTestOracle}>
                Probar oracle
              </Button>
              {lastPrice && <div className="text-sm self-center">Último precio: {lastPrice}</div>}
            </div>

            <div className="p-4 bg-muted rounded-lg text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Red:</span>
                <span className="font-medium">{chainName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Chain ID:</span>
                <span className="font-medium">{chainId}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* App info */}
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
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
