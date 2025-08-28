// disease-prediction.ts
'use server';

/**
 * @fileOverview A rare disease prediction AI agent.
 *
 * - diseasePrediction - A function that handles the disease prediction process.
 * - DiseasePredictionInput - The input type for the diseasePrediction function.
 * - DiseasePredictionOutput - The return type for the diseasePrediction function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DiseasePredictionInputSchema = z.object({
  genomicDataUri: z
    .string()
    .optional()
    .describe(
      "Genomic data of the patient, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  imagingDataUri: z
    .string()
    .optional()
    .describe(
      "Imaging data of the patient (e.g., MRI), as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  patientHistory: z.string().describe('Relevant patient history and symptoms, or manual EHR data.'),
});
export type DiseasePredictionInput = z.infer<typeof DiseasePredictionInputSchema>;

const DiseasePredictionOutputSchema = z.object({
  predictions: z.array(
    z.object({
      disease: z.string().describe('The name of the predicted disease.'),
      probability: z
        .number()
        .describe('The probability of the patient having the disease (0-1).'),
      supportingFactors: z
        .string()
        .describe('Factors from the data supporting the prediction.'),
    })
  ).describe('A list of predicted diseases and their probabilities.'),
  confidenceLevel: z
    .string()
    .describe(
      'Overall confidence level in the predictions (e.g., low, medium, high).'
    ),
  suggestedTests: z
    .string()
    .describe('A comma separated list of suggested tests for confirming diagnosis.'),
});
export type DiseasePredictionOutput = z.infer<typeof DiseasePredictionOutputSchema>;

export async function diseasePrediction(input: DiseasePredictionInput): Promise<DiseasePredictionOutput> {
  return diseasePredictionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'diseasePredictionPrompt',
  input: {schema: DiseasePredictionInputSchema},
  output: {schema: DiseasePredictionOutputSchema},
  prompt: `You are a highly specialized AI assistant designed to predict rare diseases based on patient data.

  Analyze the provided genomic data, imaging data, and patient history to predict the likelihood of specific rare diseases.

  Provide a list of potential diseases, their probabilities, and supporting factors from the provided data.
  Also suggest tests to perform in order to confirm the diagnoses.

  {{#if genomicDataUri}}Genomic Data: {{media url=genomicDataUri}}{{/if}}
  {{#if imagingDataUri}}Imaging Data: {{media url=imagingDataUri}}{{/if}}
  Patient History / EHR: {{{patientHistory}}}

  If genomic or imaging data are not provided, base your analysis on the patient history and EHR data. Acknowledge that the confidence will be lower due to the missing data.

  Format the output as a JSON object conforming to the DiseasePredictionOutputSchema schema.
  Set the confidenceLevel based on the quality and completeness of the provided data.
  `,
});

const diseasePredictionFlow = ai.defineFlow(
  {
    name: 'diseasePredictionFlow',
    inputSchema: DiseasePredictionInputSchema,
    outputSchema: DiseasePredictionOutputSchema,
  },
  async input => {
    // In a real app, you might have complex logic here to fetch models,
    // pre-process data, etc. before calling the LLM.
    // For this prototype, we will just call the prompt directly.
    
    // MOCK IMPLEMENTATION - In a real scenario, this would call the prompt.
    // const {output} = await prompt(input);
    // return output!;
    
    console.log("Prediction Input:", input);

    const hasGenomic = !!input.genomicDataUri;
    const hasImaging = !!input.imagingDataUri;
    
    let confidenceLevel = 'low';
    if (hasGenomic && hasImaging) {
        confidenceLevel = 'high';
    } else if (hasGenomic || hasImaging) {
        confidenceLevel = 'medium';
    }

    return {
      predictions: [
        {
          disease: "Fabry Disease",
          probability: 0.92,
          supportingFactors: "Patient history shows episodes of severe pain in extremities, presence of angiokeratomas, and decreased kidney function. Genomic data marker GL-3 points towards Fabry.",
        },
        {
          disease: "Gaucher Disease",
          probability: 0.45,
          supportingFactors: "Reported fatigue and enlarged spleen could be indicators, but other key symptoms are missing. Less likely given the other factors.",
        },
      ],
      confidenceLevel: confidenceLevel,
      suggestedTests: "Enzyme activity assay for alpha-galactosidase A, Genetic testing for GLA gene mutations",
    };
  }
);
