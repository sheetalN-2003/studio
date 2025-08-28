import { MainLayout } from '@/components/main-layout';
import { PredictionForm } from '@/components/prediction-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function PredictPage() {
  return (
    <MainLayout pageTitle="Disease Prediction">
        <Card>
            <CardHeader>
                <CardTitle>New Prediction Analysis</CardTitle>
                <CardDescription>Upload patient data to run the AI-powered prediction model. All data is handled in compliance with HIPAA/GDPR standards.</CardDescription>
            </CardHeader>
            <CardContent>
                <PredictionForm />
            </CardContent>
        </Card>
    </MainLayout>
  );
}
