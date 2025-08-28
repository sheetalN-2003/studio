"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
  Cell,
} from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

interface ShapPlotProps {
  features: string[];
  values: number[][];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const value = payload[0].value;
    const contribution = value > 0 ? 'Increases Likelihood' : 'Decreases Likelihood';
    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col space-y-1">
            <span className="text-[0.70rem] uppercase text-muted-foreground">
              Feature
            </span>
            <span className="font-bold text-muted-foreground">{label}</span>
          </div>
          <div className="flex flex-col space-y-1">
            <span className="text-[0.70rem] uppercase text-muted-foreground">
              SHAP Value
            </span>
            <span className={`font-bold ${value > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {value.toFixed(4)}
            </span>
          </div>
        </div>
         <div className="text-center text-xs pt-1 text-muted-foreground">{contribution}</div>
      </div>
    );
  }

  return null;
};


export function ShapPlot({ features, values }: ShapPlotProps) {
  if (!features || !values || values.length === 0) {
    return <div>No SHAP data available to display.</div>;
  }
  
  const data = features.map((feature, index) => ({
    name: feature,
    contribution: values[0][index] || 0,
  })).sort((a,b) => Math.abs(b.contribution) - Math.abs(a.contribution));
  
  const chartConfig = {
    contribution: {
      label: "Contribution",
    },
  };

  return (
    <ChartContainer config={chartConfig} className="h-full w-full">
      <ResponsiveContainer>
        <BarChart
          data={data}
          layout="vertical"
          margin={{
            top: 5,
            right: 50,
            left: 50,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" domain={['dataMin', 'dataMax']} />
          <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 12 }} interval={0}/>
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--accent))' }} />
          <Bar dataKey="contribution" name="SHAP Value" barSize={20}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.contribution > 0 ? "hsl(var(--primary))" : "hsl(var(--destructive))"} />
            ))}
             <LabelList dataKey="contribution" position="right" formatter={(value: number) => value.toFixed(3)} className="fill-muted-foreground font-medium" />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
