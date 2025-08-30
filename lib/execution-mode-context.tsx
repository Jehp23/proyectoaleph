"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

type ExecutionMode = "manual" | "assisted"

interface ExecutionModeContextType {
  mode: ExecutionMode
  setMode: (mode: ExecutionMode) => void
  isManualMode: boolean
  isAssistedMode: boolean
}

const ExecutionModeContext = createContext<ExecutionModeContextType | undefined>(undefined)

export function ExecutionModeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ExecutionMode>("manual")

  return (
    <ExecutionModeContext.Provider
      value={{
        mode,
        setMode,
        isManualMode: mode === "manual",
        isAssistedMode: mode === "assisted",
      }}
    >
      {children}
    </ExecutionModeContext.Provider>
  )
}

export function useExecutionMode() {
  const context = useContext(ExecutionModeContext)
  if (context === undefined) {
    throw new Error("useExecutionMode must be used within an ExecutionModeProvider")
  }
  return context
}
