import { MainLayout } from "@/components/layout/main-layout"
import { EmptyState } from "@/components/ui/empty-state"
import { Button } from "@/components/ui/button"
import { FileX } from "lucide-react"
import Link from "next/link"

export default function NotFound() {
  return (
    <MainLayout>
      <EmptyState
        icon={FileX}
        title="Página no encontrada"
        description="La página que buscas no existe o ha sido movida"
        action={
          <Link href="/">
            <Button>Volver al inicio</Button>
          </Link>
        }
      />
    </MainLayout>
  )
}
