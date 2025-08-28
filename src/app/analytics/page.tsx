
"use client"
import { MainLayout } from '@/components/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, TestTube, FileText, Activity } from 'lucide-react';
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"


const lineChartData = [
  { date: "2024-05-01", predictions: 35 },
  { date: "2024-05-02", predictions: 42 },
  { date: "2024-05-03", predictions: 55 },
  { date: "2024-05-04", predictions: 48 },
  { date: "2024-05-05", predictions: 62 },
  { date: "2024-05-06", predictions: 75 },
  { date: "2024-05-07", predictions: 68 },
];

const pieChartData = [
  { name: "Fabry Disease", value: 400 },
  { name: "Wilson's Disease", value: 300 },
  { name: "Gaucher Disease", value: 300 },
  { name: "Cystic Fibrosis", value: 200 },
  { name: "Pompe Disease", value: 278 },
  { name: "Other", value: 189 },
];

const lineChartConfig = {
  predictions: {
    label: "Predictions",
    color: "hsl(var(--chart-1))",
  },
}

const pieChartConfig = {
  diseases: {
    label: "Diseases",
  },
}

const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))", "#A0A0A0"];

export default function AnalyticsPage() {
  return (
    <MainLayout pageTitle="Analytics Hub">
      <div className="grid gap-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                    Total Predictions
                    </CardTitle>
                    <TestTube className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">1,892</div>
                    <p className="text-xs text-muted-foreground">
                    +152 this month
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                    Avg. Model Confidence
                    </CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">89.1%</div>
                    <p className="text-xs text-muted-foreground">
                    +1.2% from last model version
                    </p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Contributing Hospitals</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">14</div>
                    <p className="text-xs text-muted-foreground">
                    2 new this quarter
                    </p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Federated Datasets</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">342</div>
                    <p className="text-xs text-muted-foreground">
                    +19 added this month
                    </p>
                </CardContent>
            </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Prediction Volume Over Time</CardTitle>
              <CardDescription>Monitor the daily and weekly prediction analysis volume.</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
               <ChartContainer config={lineChartConfig} className="w-full h-full">
                <ResponsiveContainer>
                  <BarChart data={lineChartData}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} />
                    <YAxis />
                    <Tooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                    <Bar dataKey="predictions" fill="var(--color-predictions)" radius={4} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Top Predicted Diseases</CardTitle>
              <CardDescription>Most frequently predicted diseases across all analyses.</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ChartContainer config={pieChartConfig} className="w-full h-full">
                <ResponsiveContainer>
                  <PieChart>
                    <Tooltip content={<ChartTooltipContent nameKey="name" hideLabel />} />
                    <Pie data={pieChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={110} labelLine={false} label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
                        const RADIAN = Math.PI / 180;
                        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                        const x = cx + radius * Math.cos(-midAngle * RADIAN);
                        const y = cy + radius * Math.sin(-midAngle * RADIAN);
                        return (percent > 0.05) ? (
                          <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central">
                            {`${(percent * 100).toFixed(0)}%`}
                          </text>
                        ) : null;
                      }}
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
