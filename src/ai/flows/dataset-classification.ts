'use server';
// src/ai/flows/dataset-classification.ts
/**
 * @fileOverview A dataset classification AI agent.
 *
 * - datasetClassification - A function that handles the dataset classification process.
 * - DatasetClassificationInput - The input type for the datasetClassification function.
 * - DatasetClassificationOutput - The return type for the datasetClassification function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DatasetClassificationInputSchema = z.object({
  sampleRecords: z.string().describe('A small set of sample patient records with known rare disease classifications.'),
  newDatasetDescription: z.string().describe('A description of the newly uploaded, unclassified dataset.'),
});
export type DatasetClassificationInput = z.infer<typeof DatasetClassificationInputSchema>;

const DatasetClassificationOutputSchema = z.object({
  suggestedClasses: z.array(z.string()).describe('An array of suggested classes for the new dataset based on the sample records and dataset description.'),
});
export type DatasetClassificationOutput = z.infer<typeof DatasetClassificationOutputSchema>;

export async function datasetClassification(input: DatasetClassificationInput): Promise<DatasetClassificationOutput> {
  return datasetClassificationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'datasetClassificationPrompt',
  input: {schema: DatasetClassificationInputSchema},
  output: {schema: DatasetClassificationOutputSchema},
  prompt: `You are an expert in rare disease dataset classification.

You will analyze a small set of sample patient records with known rare disease classifications and a description of a newly uploaded, unclassified dataset.

Based on the sample records and dataset description, suggest possible classes for the new dataset.

Sample Records:
{{sampleRecords}}

New Dataset Description:
{{newDatasetDescription}}`,
});

const datasetClassificationFlow = ai.defineFlow(
  {
    name: 'datasetClassificationFlow',
    inputSchema: DatasetClassificationInputSchema,
    outputSchema: DatasetClassificationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

    