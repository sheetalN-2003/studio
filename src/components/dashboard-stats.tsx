"use client"

import { TrendingUp } from "lucide-react"
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

const chartData = [
  { day: "Monday", predictions: 50 },
  { day: "Tuesday", predictions: 75 },
  { day: "Wednesday", predictions: 60 },
  { day: "Thursday", predictions: 90 },
  { day: "Friday", predictions: 80 },
  { day: "Saturday", predictions: 30 },
  { day: "Sunday", predictions: 45 },
]

const chartConfig = {
  predictions: {
    label: "Predictions",
    color: "hsl(var(--chart-1))",
  },
}

export function DashboardStats() {
  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full h-full">
      <BarChart accessibilityLayer data={chartData}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="day"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tickFormatter={(value) => value.slice(0, 3)}
        />
        <YAxis />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="predictions" fill="var(--color-predictions)" radius={4} />
      </BarChart>
    </ChartContainer>
  )
}
