import { MainLayout } from '@/components/main-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Activity, Users, TestTube2, FileText } from 'lucide-react';
import { RecentAnalysis } from '@/components/recent-analysis';
import { DashboardStats } from '@/components/dashboard-stats';

export default function DashboardPage() {
  return (
    <MainLayout pageTitle="Dashboard">
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Patients
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">
              +20.1% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Predictions
            </CardTitle>
            <TestTube2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+57</div>
            <p className="text-xs text-muted-foreground">
              +12 since yesterday
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Datasets</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">215</div>
            <p className="text-xs text-muted-foreground">
              +3 added this week
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Model Accuracy</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94.2%</div>
            <p className="text-xs text-muted-foreground">
              Federated model v2.1
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="mt-8 grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Recent Analysis</CardTitle>
            <CardDescription>
              An overview of the latest prediction jobs.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RecentAnalysis />
          </CardContent>
        </Card>
        <Card>
           <CardHeader>
            <CardTitle>Prediction Statistics</CardTitle>
            <CardDescription>
              Breakdown of predictions in the last 7 days.
            </CardDescription>
          </CardHeader>
            <DashboardStats />
        </Card>
      </div>
    </MainLayout>
  );
}
