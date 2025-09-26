
'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/dataset-classification.ts';
import '@/ai/flows/disease-prediction.ts';
import '@/ai/flows/classify-dataset-from-file.ts';
import '@/ai/flows/medora-chat-flow.ts';
import '@/ai/flows/chat-flow.ts';
import '@/ai/flows/shap-analysis.ts';
import '@/ai/flows/digital-twin-flow.ts';
import '@/ai/flows/trial-matching-flow.ts';
