
"use client"

import * as React from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
  Rectangle,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Sector,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts"
import {
  type ChartConfig,
  type ChartContainerProps,
  ChartContext,
} from "@/lib/chart-utils"

import { cn } from "@/lib/utils"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  type TooltipProps,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  ChartContainerProps & {
    error?: React.ReactNode
    loading?: React.ReactNode
  }
>(({ error, loading, ...props }, ref) => {
  const { config } = React.useContext(ChartContext)

  return (
    <Card
      ref={ref}
      data-chart-container
      className="flex flex-col group/chart-container"
    >
      <div
        data-chart-wrapper
        className={cn(
          "[&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line]:stroke-border/50 [&_.recharts-polar-grid_[stroke=--grid-color]]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-sector_path]:stroke-border [&_.recharts-tooltip-cursor]:stroke-border",
          config?.className,
          props.className
        )}
      >
        <ResponsiveContainer>
          {error ? (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              {error}
            </div>
          ) : loading ? (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              {loading}
            </div>
          ) : (
            <RechartsTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  className="max-w-[14rem]"
                  indicator="dot"
                />
              }
            />
          )}
        </ResponsiveContainer>
      </div>
    </Card>
  )
})
ChartContainer.displayName = "ChartContainer"

function ChartTooltipContent({
  className,
  ...props
}: React.ComponentProps<typeof RechartsTooltip> & {
  hideLabel?: boolean
  hideIndicator?: boolean
  indicator?: "line" | "dot" | "dashed"
  nameKey?: string
  labelKey?: string
}) {
  const { config, payload, active, label } =
    React.useContext(ChartContext)
  const {
    hideLabel = false,
    hideIndicator = false,
    indicator = "dot",
    nameKey,
    labelKey,
  } = props

  if (!active || !payload?.length || !config) {
    return null
  }

  const [item] = payload
  const itemConfig = config?.[item.dataKey as string]
  const value = item.value
  const name = itemConfig?.label || item.name
  const indicatorColor = itemConfig?.color || item.color

  return (
    <div
      data-chart-tooltip-content
      className={cn(
        "min-w-[8rem] overflow-hidden rounded-lg border bg-background p-2 text-sm shadow-sm animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className
      )}
    >
      {!hideLabel && (
        <div className="border-b border-border/50 p-2 font-medium">
          {label}
        </div>
      )}
      <div className="flex flex-col gap-1 p-2">
        {payload.map((item, index) => {
          const itemConfig = config?.[item.dataKey as string]
          const value = item.value
          const name = itemConfig?.label || item.name
          const indicatorColor = itemConfig?.color || item.color

          return (
            <div
              key={item.dataKey}
              data-chart-tooltip-item
              className="flex items-center gap-2"
            >
              {!hideIndicator && (
                <div
                  data-chart-tooltip-indicator
                  className={cn("h-2.5 w-2.5 shrink-0 rounded-[2px]")}
                  style={{
                    backgroundColor: indicatorColor,
                  }}
                />
              )}
              <div className="flex flex-1 justify-between">
                <span className="text-muted-foreground">{name}</span>
                <span className="font-mono font-medium tabular-nums">
                  {value}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
ChartTooltipContent.displayName = "ChartTooltipContent"

const ChartTooltip = RechartsTooltip

const ChartLegendContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> &
    Pick<ChartConfig, "verticalAlign"> & {
      payload?: any[]
      onItemClick?: (item: any) => void
    }
>(
  (
    { className, verticalAlign = "bottom", payload, onItemClick, ...props },
    ref
  ) => {
    const { config } = React.useContext(ChartContext)

    if (!payload?.length || !config) {
      return null
    }

    return (
      <div
        ref={ref}
        data-chart-legend-content
        className={cn(
          "flex items-center justify-center gap-4 data-[vertical-align=top]:pb-4 data-[vertical-align=bottom]:pt-4",
          verticalAlign === "top" ? "pb-4" : "pt-4",
          className
        )}
        {...props}
      >
        {payload.map((item) => {
          const itemConfig = config[item.value]
          const { label, color, icon: Icon } = itemConfig
          const isSelected = itemConfig.active

          return (
            <button
              key={item.value}
              data-chart-legend-item
              data-selected={isSelected}
              className="flex items-center gap-1.5 rounded-md px-2 py-1 text-sm text-muted-foreground transition-colors hover:bg-muted/80 has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50 data-[selected=false]:opacity-50"
              onClick={() => onItemClick?.(item)}
            >
              {Icon ? (
                <Icon
                  className="h-3 w-3"
                  style={
                    {
                      color: color,
                    } as React.CSSProperties
                  }
                />
              ) : (
                <div
                  className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                  style={{
                    backgroundColor: color,
                  }}
                />
              )}
              {label}
            </button>
          )
        })}
      </div>
    )
  }
)
ChartLegendContent.displayName = "ChartLegendContent"

const ChartStyle = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  const { config } = React.useContext(ChartContext)
  const id = React.useId()
  const selector = `[data-chart-container] [data-chart-style=${id}]`

  if (Object.keys(config).length === 0) {
    return null
  }

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `
${selector} {
  ${Object.entries(config)
    .map(([key, itemConfig]) => {
      const { color, icon: Icon } = itemConfig
      return `
    --color-${key}: ${color};
    `
    })
    .join("\n")}
`,
      }}
    />
  )
})
ChartStyle.displayName = "ChartStyle"

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegendContent,
  ChartStyle,
}
