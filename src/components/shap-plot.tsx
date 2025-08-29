"use client";

import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface ShapPlotProps {
  features: string[];
  values: number[][];
}

export function ShapPlot({ features, values }: ShapPlotProps) {
  if (!features || !values || values.length === 0) {
    return <div>No SHAP data available to display.</div>;
  }
  
  const data = features.map((feature, index) => ({
    name: feature,
    contribution: values[0][index] || 0,
  })).sort((a,b) => Math.abs(b.contribution) - Math.abs(a.contribution));

  const maxContribution = Math.max(...data.map(item => Math.abs(item.contribution)));

  return (
    <div className="space-y-4 pt-4">
      <div className="flex text-xs text-muted-foreground">
        <div className="w-1/3 pr-4">Feature</div>
        <div className="w-2/3">Contribution (Negative vs. Positive)</div>
      </div>
      {data.map((item, index) => {
          const isPositive = item.contribution >= 0;
          const barPercentage = (Math.abs(item.contribution) / maxContribution) * 100;
        return (
          <div key={index} className="flex items-center">
             <div className="w-1/3 pr-4 text-sm font-medium truncate" title={item.name}>{item.name}</div>
             <div className="w-2/3 flex items-center gap-2">
                <div className="w-full bg-destructive/20 rounded-full h-3">
                    <Progress
                    value={isPositive ? barPercentage : 0}
                    className="h-3 [&>div]:bg-primary"
                    />
                </div>
                 <span className={cn(
                    "text-sm font-semibold w-16 text-right",
                    isPositive ? "text-primary" : "text-destructive"
                 )}>
                    {item.contribution.toFixed(3)}
                </span>
             </div>
          </div>
        );
      })}
    </div>
  );
}
