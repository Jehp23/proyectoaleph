"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CheckCircle, Clock, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface TxModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  onConfirm: () => Promise<void>
}

type TxStep = "approve" | "sign" | "confirmed"

const stepConfig = {
  approve: {
    title: "Aprobar tokens",
    description: "Aprueba el gasto de tokens para continuar",
    buttonText: "Aprobar",
    icon: Clock,
  },
  sign: {
    title: "Firmar transacción",
    description: "Confirma la transacción en tu wallet",
    buttonText: "Firmar",
    icon: Clock,
  },
  confirmed: {
    title: "Transacción confirmada",
    description: "La transacción se ha procesado exitosamente",
    buttonText: "Cerrar",
    icon: CheckCircle,
  },
}

export function TxModal({ open, onOpenChange, title, description, onConfirm }: TxModalProps) {
  const [currentStep, setCurrentStep] = useState<TxStep>("approve")
  const [isLoading, setIsLoading] = useState(false)

  const handleStepAction = async () => {
    if (currentStep === "confirmed") {
      onOpenChange(false)
      setCurrentStep("approve")
      return
    }

    setIsLoading(true)

    // Simulate transaction steps
    await new Promise((resolve) => setTimeout(resolve, 2000))

    if (currentStep === "approve") {
      setCurrentStep("sign")
    } else if (currentStep === "sign") {
      await onConfirm()
      setCurrentStep("confirmed")
    }

    setIsLoading(false)
  }

  const config = stepConfig[currentStep]
  const IconComponent = config.icon

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Steps indicator */}
          <div className="flex items-center justify-center space-x-4">
            {Object.keys(stepConfig).map((step, index) => (
              <div key={step} className="flex items-center">
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors",
                    step === currentStep
                      ? "border-primary bg-primary text-primary-foreground"
                      : index < Object.keys(stepConfig).indexOf(currentStep)
                        ? "border-green-500 bg-green-500 text-white"
                        : "border-muted-foreground bg-background text-muted-foreground",
                  )}
                >
                  {step === "confirmed" ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <span className="text-xs font-medium">{index + 1}</span>
                  )}
                </div>
                {index < Object.keys(stepConfig).length - 1 && (
                  <div
                    className={cn(
                      "h-0.5 w-8 transition-colors",
                      index < Object.keys(stepConfig).indexOf(currentStep) ? "bg-green-500" : "bg-muted-foreground/30",
                    )}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Current step */}
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <IconComponent className="h-8 w-8 text-muted-foreground" />
              </div>
            </div>
            <div>
              <h3 className="font-semibold">{config.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{config.description}</p>
            </div>
          </div>

          <Button onClick={handleStepAction} disabled={isLoading} className="w-full">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {config.buttonText}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
