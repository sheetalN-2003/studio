'use server';

/**
 * @fileOverview An AI agent for conducting SHAP analysis to explore factors contributing to a rare disease prediction.
 *
 * - shapAnalysis - A function that handles the SHAP analysis process.
 * - ShapAnalysisInput - The input type for the shapAnalysis function.
 * - ShapAnalysisOutput - The return type for the shapAnalysis function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ShapAnalysisInputSchema = z.object({
  patientData: z.record(z.any()).describe('The patient data for SHAP analysis, including history and file names if available.'),
  modelType: z.string().describe('The type of model used for the prediction (e.g., rare disease model).'),
  rareDisease: z.string().describe('The specific rare disease being analyzed.'),
});
export type ShapAnalysisInput = z.infer<typeof ShapAnalysisInputSchema>;

const ShapAnalysisOutputSchema = z.object({
  features: z.array(z.string()).describe('List of features contributing to the prediction. These are derived from the input patientData keys.'),
  values: z.array(z.array(z.number())).describe('A nested array of SHAP values for each feature. The inner array typically has one value per feature.'),
  explanation: z.string().describe('A textual explanation of the SHAP analysis results, summarizing the top contributing factors.'),
});
export type ShapAnalysisOutput = z.infer<typeof ShapAnalysisOutputSchema>;

export async function shapAnalysis(input: ShapAnalysisInput): Promise<ShapAnalysisOutput> {
  return shapAnalysisFlow(input);
}

// Mock implementation for SHAP analysis
const shapAnalysisFlow = ai.defineFlow(
  {
    name: 'shapAnalysisFlow',
    inputSchema: ShapAnalysisInputSchema,
    outputSchema: ShapAnalysisOutputSchema,
  },
  async ({ patientData, rareDisease }) => {
    // In a real scenario, this would involve a complex process with a trained model.
    // Here we generate mock data based on the input.
    console.log("SHAP analysis input:", patientData);

    const features = ['Age', 'Kidney Function Marker', 'Genetic Marker X', 'Spleen Size', 'Pain in Extremities', 'Proteomic Marker Z'];
    const hasGenomic = !!patientData.genomicDataFileName;
    const hasImaging = !!patientData.imagingDataFileName;
    const hasProteomics = !!patientData.proteomicsDataFileName;
    
    // Generate some mock SHAP values.
    const values = [
        (Math.random() * 0.4) + (patientData.patientAge > 40 ? 0.2 : 0), // Age
        (Math.random() * 0.3) + (patientData.patientHistory.toLowerCase().includes('kidney') ? 0.3 : 0), // Kidney function
        (Math.random() * 0.5) + (hasGenomic ? 0.4 : 0), // Genetic marker
        (Math.random() * 0.2) + (hasImaging ? 0.2 : 0), // Spleen size
        (Math.random() * 0.2) + (patientData.patientHistory.toLowerCase().includes('pain') ? 0.25 : 0), // Pain
        (Math.random() * 0.4) + (hasProteomics ? 0.45 : 0), // Proteomic Marker
    ];
    
    // Normalize values to give some negative contributions as well
    const normalizedValues = values.map(v => v - 0.45);

    return {
      features: features,
      values: [normalizedValues],
      explanation: `The primary factors increasing the likelihood for ${rareDisease} are the presence of genetic marker X and key proteomic markers. Patient-reported severe pain in extremities and kidney function markers also contribute moderately. Imaging data showing an enlarged spleen had a minor impact.`,
    };
  }
);
