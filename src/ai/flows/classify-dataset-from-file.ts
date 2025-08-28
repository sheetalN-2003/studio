'use server';
/**
 * @fileOverview An AI agent for classifying a dataset from a file (CSV/Excel).
 *
 * - classifyDatasetFromFile - A function that handles the dataset classification process from a file.
 * - ClassifyDatasetFromFileInput - The input type for the classifyDatasetFromFile function.
 * - ClassifyDatasetFromFileOutput - The return type for the classifyDatasetFromFile function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ClassifyDatasetFromFileInputSchema = z.object({
  datasetDataUri: z
    .string()
    .describe(
      "The dataset file (CSV or Excel) as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'"
    ),
  fileName: z.string().describe('The name of the uploaded file.'),
});
export type ClassifyDatasetFromFileInput = z.infer<typeof ClassifyDatasetFromFileInputSchema>;

const ClassifyDatasetFromFileOutputSchema = z.object({
  suggestedClasses: z.array(z.string()).describe('An array of suggested classes (50+ rare diseases) for the new dataset based on the file content.'),
  analysisSummary: z.string().describe('A brief description of the dataset and why the classes were suggested.'),
});
export type ClassifyDatasetFromFileOutput = z.infer<typeof ClassifyDatasetFromFileOutputSchema>;

export async function classifyDatasetFromFile(input: ClassifyDatasetFromFileInput): Promise<ClassifyDatasetFromFileOutput> {
  return classifyDatasetFromFileFlow(input);
}

const prompt = ai.definePrompt({
  name: 'classifyDatasetFromFilePrompt',
  input: {schema: ClassifyDatasetFromFileInputSchema},
  output: {schema: ClassifyDatasetFromFileOutputSchema},
  prompt: `You are an expert in rare disease dataset classification. You are tasked with analyzing a dataset file and suggesting potential rare disease classifications.

You will analyze the provided dataset file (CSV or Excel) which contains patient data. Based on the columns and sample data within the file, you must suggest over 50 possible rare disease classes that this dataset could be used to train a model for.

Also provide a brief summary of your analysis, explaining why you are suggesting these classes based on the dataset's structure and content.

Uploaded File: {{media url=datasetDataUri}}
File Name: {{{fileName}}}

Your output must be a JSON object conforming to the schema.
`,
});

const classifyDatasetFromFileFlow = ai.defineFlow(
  {
    name: 'classifyDatasetFromFileFlow',
    inputSchema: ClassifyDatasetFromFileInputSchema,
    outputSchema: ClassifyDatasetFromFileOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
