"use client"
import type { ReactNode } from "react"
import { Button } from "@/components/ui/button"

export default function ActionButton({
  children,
  onClick,
  disabled,
  reason,
  className,
  ...props
}: {
  children: ReactNode
  onClick?: () => void
  disabled?: boolean
  reason?: string
  className?: string
  [key: string]: any
}) {
  return (
    <Button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={className}
      title={disabled && reason ? reason : undefined}
      {...props}
    >
      {children}
      {disabled && reason && <span className="ml-2 text-xs opacity-75">— {reason}</span>}
    </Button>
  )
}
