'use server';

/**
 * @fileOverview An AI agent for matching patients to clinical trials.
 *
 * - findMatchingTrials - A function that finds clinical trials based on patient data.
 * - TrialMatchingInput - The input type for the function.
 * - TrialMatchingOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PatientInfoSchema = z.object({
  diagnosis: z.string().describe("The patient's primary diagnosis (e.g., 'Fabry Disease')."),
  age: z.number().describe('The age of the patient.'),
  geneticMarkers: z.array(z.string()).optional().describe('A list of known genetic markers.'),
});

export const TrialMatchingInputSchema = z.object({
  patientInfo: PatientInfoSchema,
});
export type TrialMatchingInput = z.infer<typeof TrialMatchingInputSchema>;


export const TrialSchema = z.object({
    id: z.string().describe('The official ID of the clinical trial (e.g., NCT02675461).'),
    title: z.string().describe('The title of the clinical trial.'),
    summary: z.string().describe('A brief summary of the trial.'),
    sponsor: z.string().describe('The organization sponsoring the trial.'),
    criteria: z.string().describe('Key inclusion criteria for the trial.'),
    locations: z.array(z.string()).describe('A list of locations where the trial is being conducted.'),
});
export type Trial = z.infer<typeof TrialSchema>;

export const TrialMatchingOutputSchema = z.object({
  trials: z.array(TrialSchema),
});
export type TrialMatchingOutput = z.infer<typeof TrialMatchingOutputSchema>;


export async function findMatchingTrials(input: TrialMatchingInput): Promise<TrialMatchingOutput> {
  return trialMatchingFlow(input);
}

// Mock database of clinical trials
const allTrials: Trial[] = [
    {
        id: "NCT02675461",
        title: "A Study of the Efficacy and Safety of Lucerastat in Adult Subjects With Fabry Disease",
        summary: "This is a multicenter, randomized, double-blind, placebo-controlled study to evaluate the efficacy and safety of oral lucerastat as monotherapy in adult subjects with Fabry disease.",
        sponsor: "Idorsia Pharmaceuticals",
        criteria: "Adults with confirmed Fabry Disease diagnosis.",
        locations: ["Boston, MA", "Palo Alto, CA", "London, UK"],
    },
    {
        id: "NCT04519717",
        title: "Gene Therapy for Krabbe Disease",
        summary: "A Phase 1/2, open-label, single-arm, dose-escalation study to evaluate the safety and efficacy of a single intravenous infusion of a gene therapy in patients with infantile Krabbe disease.",
        sponsor: "Forge Biologics",
        criteria: "Infants aged 2 to 12 months with early infantile Krabbe Disease.",
        locations: ["Philadelphia, PA", "Columbus, OH"],
    },
    {
        id: "NCT03721248",
        title: "A Study of Vatiquinone for Mitochondrial Disease (Leigh Syndrome)",
        summary: "An open-label study to evaluate the efficacy, safety, and pharmacokinetics of vatiquinone (EPI-743) in subjects with Leigh syndrome.",
        sponsor: "PTC Therapeutics",
        criteria: "Patients aged 1 to 21 years with a confirmed diagnosis of Leigh Syndrome.",
        locations: ["Atlanta, GA", "Houston, TX", "Paris, France"],
    },
];

const trialMatchingFlow = ai.defineFlow(
  {
    name: 'trialMatchingFlow',
    inputSchema: TrialMatchingInputSchema,
    outputSchema: TrialMatchingOutputSchema,
  },
  async ({ patientInfo }) => {
    
    console.log(`Finding trials for patient with diagnosis: ${patientInfo.diagnosis}`);

    // MOCK IMPLEMENTATION: In a real scenario, this would query a real clinical trial database
    // or use an LLM with tool-calling capabilities to search external APIs.
    
    const matchingTrials = allTrials.filter(trial => {
        const diagnosisMatch = trial.title.toLowerCase().includes(patientInfo.diagnosis.toLowerCase());
        
        let ageMatch = false;
        const ageCriteria = trial.criteria.match(/(\d+)\s+to\s+(\d+)\s+years/);
        const ageCriteriaInfant = trial.criteria.match(/(\d+)\s+to\s+(\d+)\s+months/);

        if (ageCriteria) {
            const minAge = parseInt(ageCriteria[1], 10);
            const maxAge = parseInt(ageCriteria[2], 10);
            if (patientInfo.age >= minAge && patientInfo.age <= maxAge) {
                ageMatch = true;
            }
        } else if (ageCriteriaInfant) {
            const minMonths = parseInt(ageCriteriaInfant[1], 10);
            const maxMonths = parseInt(ageCriteriaInfant[2], 10);
            if ((patientInfo.age * 12) >= minMonths && (patientInfo.age * 12) <= maxMonths) {
                ageMatch = true;
            }
        } else if (trial.criteria.toLowerCase().includes('adults')) {
            if (patientInfo.age >= 18) {
                ageMatch = true;
            }
        }

        return diagnosisMatch && ageMatch;
    });

    return {
      trials: matchingTrials,
    };
  }
);
