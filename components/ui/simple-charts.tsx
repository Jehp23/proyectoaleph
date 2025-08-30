"use client"

import { cn } from "@/lib/utils"

interface PieChartData {
  name: string
  value: number
  fill: string
}

interface BarChartData {
  name: string
  value: number
  fill: string
}

interface LineChartData {
  time: string
  price: number
  liquidations: number
}

export function SimplePieChart({ data, className }: { data: PieChartData[]; className?: string }) {
  const total = data.reduce((sum, item) => sum + item.value, 0)

  if (total === 0) {
    return (
      <div className={cn("flex items-center justify-center h-full", className)}>
        <div className="text-center text-muted-foreground">
          <div className="w-16 h-16 rounded-full border-4 border-muted mx-auto mb-2" />
          <p className="text-sm">Sin datos</p>
        </div>
      </div>
    )
  }

  let cumulativePercentage = 0

  return (
    <div className={cn("flex items-center justify-center h-full", className)}>
      <div className="relative">
        <svg width="200" height="200" className="transform -rotate-90">
          <circle cx="100" cy="100" r="80" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
          {data.map((item, index) => {
            const percentage = (item.value / total) * 100
            const strokeDasharray = `${percentage * 5.03} 502`
            const strokeDashoffset = -cumulativePercentage * 5.03
            cumulativePercentage += percentage

            return (
              <circle
                key={index}
                cx="100"
                cy="100"
                r="80"
                fill="none"
                stroke={item.fill}
                strokeWidth="8"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-300"
              />
            )
          })}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold">{total}</div>
            <div className="text-xs text-muted-foreground">Total</div>
          </div>
        </div>
      </div>
      <div className="ml-6 space-y-2">
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.fill }} />
            <span className="text-sm">{item.name}</span>
            <span className="text-sm font-medium">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function SimpleBarChart({ data, className }: { data: BarChartData[]; className?: string }) {
  const maxValue = Math.max(...data.map((item) => item.value))

  if (maxValue === 0) {
    return (
      <div className={cn("flex items-center justify-center h-full", className)}>
        <div className="text-center text-muted-foreground">
          <div className="flex gap-2 mb-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-8 h-16 bg-muted rounded" />
            ))}
          </div>
          <p className="text-sm">Sin datos</p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("h-full p-4", className)}>
      <div className="flex items-end justify-center gap-8 h-48">
        {data.map((item, index) => {
          const height = (item.value / maxValue) * 180
          return (
            <div key={index} className="flex flex-col items-center gap-2">
              <div className="text-xs font-medium">{item.value}</div>
              <div
                className="w-12 rounded-t transition-all duration-300"
                style={{
                  height: `${height}px`,
                  backgroundColor: item.fill,
                  minHeight: item.value > 0 ? "8px" : "0px",
                }}
              />
              <div className="text-xs text-muted-foreground text-center">{item.name}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function SimpleLineChart({ data, className }: { data: LineChartData[]; className?: string }) {
  const maxPrice = Math.max(...data.map((item) => item.price))
  const minPrice = Math.min(...data.map((item) => item.price))
  const priceRange = maxPrice - minPrice

  if (priceRange === 0) {
    return (
      <div className={cn("flex items-center justify-center h-full", className)}>
        <div className="text-center text-muted-foreground">
          <div className="w-full h-1 bg-muted rounded mb-2" />
          <p className="text-sm">Sin variación de precio</p>
        </div>
      </div>
    )
  }

  const points = data
    .map((item, index) => {
      const x = (index / (data.length - 1)) * 300
      const y = 150 - ((item.price - minPrice) / priceRange) * 120
      return `${x},${y}`
    })
    .join(" ")

  return (
    <div className={cn("h-full p-4", className)}>
      <div className="relative">
        <svg width="100%" height="200" viewBox="0 0 320 180" className="overflow-visible">
          {/* Grid lines */}
          <defs>
            <pattern id="grid" width="40" height="30" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 30" fill="none" stroke="hsl(var(--muted))" strokeWidth="0.5" opacity="0.3" />
            </pattern>
          </defs>
          <rect width="300" height="150" fill="url(#grid)" />

          {/* Price line */}
          <polyline
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="2"
            points={points}
            className="drop-shadow-sm"
          />

          {/* Data points */}
          {data.map((item, index) => {
            const x = (index / (data.length - 1)) * 300
            const y = 150 - ((item.price - minPrice) / priceRange) * 120
            return <circle key={index} cx={x} cy={y} r="3" fill="hsl(var(--primary))" className="drop-shadow-sm" />
          })}

          {/* Liquidation reference line */}
          <line
            x1="0"
            y1="120"
            x2="300"
            y2="120"
            stroke="hsl(var(--danger))"
            strokeWidth="1"
            strokeDasharray="5,5"
            opacity="0.7"
          />
        </svg>

        {/* X-axis labels */}
        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
          {data.map((item, index) => (
            <span key={index}>{item.time}</span>
          ))}
        </div>

        {/* Y-axis info */}
        <div className="absolute left-0 top-0 text-xs text-muted-foreground">${maxPrice.toLocaleString()}</div>
        <div className="absolute left-0 bottom-8 text-xs text-muted-foreground">${minPrice.toLocaleString()}</div>
      </div>
    </div>
  )
}
