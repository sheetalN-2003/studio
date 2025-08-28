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
  patientData: z.record(z.any()).describe('The patient data for SHAP analysis.'),
  modelType: z.string().describe('The type of model used for the prediction (e.g., rare disease model).'),
  rareDisease: z.string().describe('The specific rare disease being analyzed.'),
});
export type ShapAnalysisInput = z.infer<typeof ShapAnalysisInputSchema>;

const ShapAnalysisOutputSchema = z.object({
  features: z.array(z.string()).describe('List of features contributing to the prediction.'),
  values: z.array(z.array(z.number())).describe('SHAP values for each feature.'),
  explanation: z.string().describe('A textual explanation of the SHAP analysis results.'),
});
export type ShapAnalysisOutput = z.infer<typeof ShapAnalysisOutputSchema>;

export async function shapAnalysis(input: ShapAnalysisInput): Promise<ShapAnalysisOutput> {
  return shapAnalysisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'shapAnalysisPrompt',
  input: {schema: ShapAnalysisInputSchema},
  output: {schema: ShapAnalysisOutputSchema},
  prompt: `You are an AI expert in SHAP (SHapley Additive exPlanations) analysis for rare disease prediction models. Given the patient data and model type, perform a SHAP analysis to identify and explain the key factors contributing to the prediction of the rare disease.

Patient Data: {{{patientData}}}
Model Type: {{{modelType}}}
Rare Disease: {{{rareDisease}}}

Based on this data, identify the most important features and their corresponding SHAP values. Provide a concise explanation of how these features influence the prediction. Return the features, SHAP values, and explanation in the required JSON format.

Ensure that the output is well-formatted and easy to understand for clinicians.
`,
});

const shapAnalysisFlow = ai.defineFlow(
  {
    name: 'shapAnalysisFlow',
    inputSchema: ShapAnalysisInputSchema,
    outputSchema: ShapAnalysisOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
