"use client";

import { type DiseasePredictionOutput } from '@/ai/flows/disease-prediction';
import { Logo } from './icons';

interface PrintableReportProps {
  id: string;
  result: DiseasePredictionOutput;
  patientData: any;
}

export function PrintableReport({ id, result, patientData }: PrintableReportProps) {
  const getConfidenceColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'high':
        return '#16a34a'; // Green
      case 'medium':
        return '#f59e0b'; // Amber
      case 'low':
        return '#dc2626'; // Red
      default:
        return '#6b7280'; // Gray
    }
  };

  return (
    <div id={id}>
      <style>{`
        @media print {
          @page { size: A4; margin: 1.5cm; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; font-family: 'Inter', sans-serif; }
        }
        .report-container { font-family: 'Inter', sans-serif; color: #111827; line-height: 1.6; }
        .report-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #e5e7eb; padding-bottom: 1rem; }
        .report-title { font-size: 1.875rem; font-weight: 700; color: #2E3192; }
        .logo { width: 50px; height: 50px; }
        .section { margin-top: 2rem; }
        .section-title { font-size: 1.5rem; font-weight: 600; border-bottom: 1px solid #d1d5db; padding-bottom: 0.5rem; margin-bottom: 1rem; color: #2E3192; }
        .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1.5rem; }
        .card { border: 1px solid #e5e7eb; border-radius: 0.5rem; padding: 1.5rem; background-color: #ffffff; page-break-inside: avoid; }
        .card-title { font-size: 1.25rem; font-weight: 600; margin-bottom: 0.5rem; }
        .card-probability { font-size: 1.125rem; font-weight: 700; color: #2E3192; }
        .card-factors-title { font-weight: 600; margin-top: 1rem; margin-bottom: 0.5rem; }
        .card-factors { font-size: 0.875rem; color: #4b5563; }
        .summary-card { border: 1px solid #e5e7eb; border-radius: 0.5rem; padding: 1rem 1.5rem; background-color: #ffffff; }
        .summary-item { display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 0; border-bottom: 1px solid #f3f4f6; }
        .summary-item:last-child { border-bottom: none; padding-bottom: 0.5rem; }
        .summary-item:first-child { padding-top: 0.5rem; }
        .summary-label { font-weight: 500; }
        .summary-value { font-weight: 600; text-align: right; }
        .confidence-badge { padding: 0.25rem 0.75rem; border-radius: 9999px; color: white; font-weight: 600; }
        .disclaimer { margin-top: 2.5rem; font-size: 0.75rem; color: #6b7280; text-align: center; border-top: 1px solid #e5e7eb; padding-top: 1rem; }
      `}</style>
      <div className="report-container">
        <div className="report-header">
          <h1 className="report-title">GenoSym-AI Prediction Report</h1>
          <Logo className="logo" />
        </div>

        <div className="section">
          <h2 className="section-title">Analysis Summary</h2>
          <div className="summary-card">
            <div className="summary-item">
              <span className="summary-label">Patient Name:</span>
              <span className="summary-value">{patientData?.patientName || 'N/A'}</span>
            </div>
             <div className="summary-item">
              <span className="summary-label">Patient ID:</span>
              <span className="summary-value">{patientData?.patientId || 'N/A'}</span>
            </div>
             <div className="summary-item">
              <span className="summary-label">Patient Age:</span>
              <span className="summary-value">{patientData?.patientAge || 'N/A'}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Analysis Date:</span>
              <span className="summary-value">{new Date().toLocaleDateString()}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Overall Confidence:</span>
              <span className="summary-value">
                <span className="confidence-badge" style={{ backgroundColor: getConfidenceColor(result.confidenceLevel) }}>
                  {result.confidenceLevel}
                </span>
              </span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Suggested Follow-up Tests:</span>
              <span className="summary-value">{result.suggestedTests}</span>
            </div>
          </div>
        </div>

        <div className="section">
          <h2 className="section-title">Prediction Details</h2>
          <div className="grid">
            {result.predictions.map((prediction, index) => (
              <div key={index} className="card">
                <h3 className="card-title">{prediction.disease}</h3>
                <p className="card-probability">Probability: {(prediction.probability * 100).toFixed(1)}%</p>
                <p className="card-factors-title">Supporting Factors:</p>
                <p className="card-factors">{prediction.supportingFactors}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="disclaimer">
          <strong>Disclaimer:</strong> This report is generated by an AI model and is intended for clinical decision support only. It is not a substitute for professional medical advice, diagnosis, or treatment. All predictions should be verified by a qualified healthcare professional.
        </div>
      </div>
    </div>
  );
}
