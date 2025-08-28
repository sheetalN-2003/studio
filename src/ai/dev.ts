import { config } from 'dotenv';
config();

import '@/ai/flows/dataset-classification.ts';
import '@/ai/flows/disease-prediction.ts';
import '@/ai/flows/shap-analysis.ts';