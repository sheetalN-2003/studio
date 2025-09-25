'use server';
/**
 * @fileOverview An AI agent for running digital twin simulations.
 *
 * - runDigitalTwinSimulation - A function that simulates patient biomarker progression based on a selected therapy.
 * - DigitalTwinInput - The input type for the simulation.
 * - DigitalTwinOutput - The return type for the simulation.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DigitalTwinInputSchema = z.object({
  patientId: z.string().describe('The ID of the patient to simulate.'),
  therapy: z.enum(['none', 'ert', 'gene_therapy']).describe('The therapy to simulate.'),
});
export type DigitalTwinInput = z.infer<typeof DigitalTwinInputSchema>;

const SimulationDataPointSchema = z.object({
  year: z.number().describe('The year of the simulation.'),
  biomarkerA: z.number().describe('Value of Biomarker A (e.g., Enzyme Activity).'),
  biomarkerB: z.number().describe('Value of Biomarker B (e.g., Substrate Level).'),
});

const DigitalTwinOutputSchema = z.object({
  simulationId: z.string(),
  projection: z.array(SimulationDataPointSchema).describe('An array of projected biomarker data over the next 5 years.'),
});
export type DigitalTwinOutput = z.infer<typeof DigitalTwinOutputSchema>;


export async function runDigitalTwinSimulation(input: DigitalTwinInput): Promise<DigitalTwinOutput> {
  return digitalTwinFlow(input);
}

// Mock implementation for the digital twin simulation flow
const digitalTwinFlow = ai.defineFlow(
  {
    name: 'digitalTwinFlow',
    inputSchema: DigitalTwinInputSchema,
    outputSchema: DigitalTwinOutputSchema,
  },
  async ({ patientId, therapy }) => {
    
    console.log(`Running simulation for patient ${patientId} with therapy: ${therapy}`);

    const projection = Array.from({ length: 6 }, (_, i) => {
      const year = new Date().getFullYear() + i;
      let biomarkerA, biomarkerB;

      // Base values
      const baseA = 30 - i * 4;
      const baseB = 50 + i * 8;

      switch (therapy) {
        case 'ert': // Enzyme Replacement Therapy - improves A, reduces B
          biomarkerA = baseA + (i * 8);
          biomarkerB = baseB - (i * 10);
          break;
        case 'gene_therapy': // Gene Therapy - significant improvement
           biomarkerA = baseA + (i * 15);
           biomarkerB = baseB - (i * 20);
          break;
        case 'none': // No intervention - natural progression
        default:
          biomarkerA = baseA;
          biomarkerB = baseB;
          break;
      }

      return {
        year: year,
        biomarkerA: Math.max(5, Math.round(biomarkerA + (Math.random() - 0.5) * 5)),
        biomarkerB: Math.max(10, Math.round(biomarkerB + (Math.random() - 0.5) * 8)),
      };
    });

    return {
      simulationId: `sim_${patientId}_${therapy}_${Date.now()}`,
      projection: projection,
    };
  }
);
