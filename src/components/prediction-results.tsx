"use client";

import { useState } from 'react';
import { type DiseasePredictionOutput, type DiseasePredictionInput } from '@/ai/flows/disease-prediction';
import { type ShapAnalysisInput, type ShapAnalysisOutput, shapAnalysis } from '@/ai/flows/shap-analysis';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { BrainCircuit, Dna, FlaskConical, Loader2, FileInput, BarChart, RotateCcw, Download } from 'lucide-react';
import { ShapPlot } from './shap-plot';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { PrintableReport } from './printable-report';

interface PredictionResultsProps {
  result: DiseasePredictionOutput;
  patientData: any;
  onReset: () => void;
}

export function PredictionResults({ result, patientData, onReset }: PredictionResultsProps) {
  const [isShapLoading, setIsShapLoading] = useState(false);
  const [shapResult, setShapResult] = useState<ShapAnalysisOutput | null>(null);
  const [selectedDiseaseForShap, setSelectedDiseaseForShap] = useState<string | null>(null);

  const handleShapAnalysis = async (disease: string) => {
    if (!patientData) return;
    setIsShapLoading(true);
    setShapResult(null);
    setSelectedDiseaseForShap(disease);
    try {
      const input: ShapAnalysisInput = {
        patientData,
        modelType: "rare disease model",
        rareDisease: disease,
      };
      const shapOutput = await shapAnalysis(input);
      setShapResult(shapOutput);
    } catch (error) {
      console.error("SHAP analysis failed:", error);
    } finally {
      setIsShapLoading(false);
    }
  };
  
  const handlePrint = () => {
    const printWindow = window.open('', '', 'height=800,width=800');
    if (printWindow) {
      const reportHtml = document.getElementById('printable-report')?.innerHTML;
      if(reportHtml){
        printWindow.document.write(reportHtml);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
      }
    }
  };

  const getConfidenceBadgeClass = (level: string) => {
    switch (level.toLowerCase()) {
      case 'high':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-800';
      case 'low':
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/50 dark:text-red-300 dark:border-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-8">
       <div style={{ display: 'none' }}>
        <PrintableReport id="printable-report" result={result} patientData={patientData} />
      </div>
      <div className='flex justify-between items-start gap-4'>
        <div>
          <h2 className="text-2xl font-bold">Analysis Complete</h2>
          <p className="text-muted-foreground">The AI model has generated the following predictions.</p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Button onClick={onReset} variant="outline">
            <RotateCcw className="mr-2 h-4 w-4" />
            New Analysis
          </Button>
           <Button onClick={handlePrint}>
            <Download className="mr-2 h-4 w-4" />
            Download Report
          </Button>
        </div>
      </div>

      <Alert>
        <FlaskConical className="h-4 w-4" />
        <AlertTitle>Overall Confidence: <Badge className={getConfidenceBadgeClass(result.confidenceLevel)}>{result.confidenceLevel}</Badge></AlertTitle>
        <AlertDescription>
          Suggested follow-up tests: {result.suggestedTests}
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        {result.predictions.map((prediction, index) => (
          <Card key={index} className="flex flex-col">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{prediction.disease}</CardTitle>
                  <CardDescription>Probability: <span className="font-bold text-primary">{(prediction.probability * 100).toFixed(1)}%</span></CardDescription>
                </div>
                <BrainCircuit className="h-8 w-8 text-accent" />
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <h4 className="font-semibold text-sm mb-2">Supporting Factors:</h4>
              <p className="text-sm text-muted-foreground">{prediction.supportingFactors}</p>
            </CardContent>
            <div className="p-6 pt-0">
               <Button 
                onClick={() => handleShapAnalysis(prediction.disease)} 
                disabled={isShapLoading && selectedDiseaseForShap === prediction.disease} 
                variant="secondary"
                className="w-full"
              >
                {isShapLoading && selectedDiseaseForShap === prediction.disease ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <BarChart className="mr-2 h-4 w-4" />
                )}
                Analyze Feature Importance
              </Button>
            </div>
          </Card>
        ))}
      </div>
      
      {shapResult && selectedDiseaseForShap && (
        <Card>
          <CardHeader>
            <CardTitle>SHAP Analysis for: {selectedDiseaseForShap}</CardTitle>
            <CardDescription>Exploring the factors contributing to the prediction.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">{shapResult.explanation}</p>
            <div className="h-96 w-full">
              <ShapPlot features={shapResult.features} values={shapResult.values} />
            </div>
          </CardContent>
        </Card>
      )}

    </div>
  );
}
