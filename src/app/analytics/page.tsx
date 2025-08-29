
"use client"
import { MainLayout } from '@/components/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, TestTube, FileText, Activity } from 'lucide-react';


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
              <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                Chart temporarily unavailable.
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Top Predicted Diseases</CardTitle>
              <CardDescription>Most frequently predicted diseases across all analyses.</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
               <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                Chart temporarily unavailable.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
