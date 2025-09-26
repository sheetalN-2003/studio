
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
        <div className="w-2/3 flex justify-between">
            <span>Decreases Likelihood</span>
            <span>Increases Likelihood</span>
        </div>
      </div>
      {data.map((item, index) => {
          const isPositive = item.contribution >= 0;
          const barPercentage = (Math.abs(item.contribution) / maxContribution) * 50; // Use 50% as the max for each side
        return (
          <div key={index} className="flex items-center">
             <div className="w-1/3 pr-4 text-sm font-medium truncate" title={item.name}>{item.name}</div>
             <div className="w-2/3 flex items-center gap-2">
                <div className="w-1/2 relative h-3 rounded-l-full overflow-hidden bg-destructive/20 transform -scale-x-100">
                     <Progress
                        value={!isPositive ? barPercentage * 2 : 0}
                        className="h-3 [&>div]:bg-destructive"
                        />
                </div>
                <div className="w-1/2 relative h-3 rounded-r-full overflow-hidden bg-primary/20">
                    <Progress
                        value={isPositive ? barPercentage * 2 : 0}
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
