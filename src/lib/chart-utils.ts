
import * as React from "react"

export type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode
    icon?: React.ComponentType
  } & (
    | {
        color?: string
        theme?: never
      }
    | {
        color?: never
        theme: {
          light: string
          dark: string
        }
      }
  )
}

export type ChartContextProps = {
  config: ChartConfig
}

export const ChartContext = React.createContext<ChartContextProps>({
  config: {},
})

export type ChartContainerProps = React.ComponentProps<"div"> & {
  config: ChartConfig
  children: React.ReactNode
}
