import { MainLayout } from '@/components/main-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Activity, Users, TestTube2, AlertTriangle, BadgeCheck, Zap } from 'lucide-react';
import { RecentAnalysis } from '@/components/recent-analysis';
import { HighRiskPatients } from '@/components/high-risk-patients';
import { FederatedLearningStatus } from '@/components/federated-learning-status';

export default function DashboardPage() {
  return (
    <MainLayout pageTitle="Dashboard">
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Patients Analyzed
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
            <CardTitle className="text-sm font-medium">High-Risk Patients</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              3 new alerts today
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Model Accuracy</CardTitle>
            <BadgeCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94.8%</div>
            <p className="text-xs text-muted-foreground">
              Federated model v2.2 (+0.6%)
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
        <div className="space-y-4 md:space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>High-Risk Patient Alerts</CardTitle>
                    <CardDescription>
                    Patients with urgent high-risk scores from recent analyses.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <HighRiskPatients />
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Zap className="h-5 w-5 text-primary" />
                        Federated Learning Hub
                    </CardTitle>
                    <CardDescription>
                    Live training progress of the global collaborative AI model.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <FederatedLearningStatus />
                </CardContent>
            </Card>
        </div>
      </div>
    </MainLayout>
  );
}
