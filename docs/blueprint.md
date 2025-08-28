# **App Name**: RareFind AI

## Core Features:

- Hospital-Only Access: Secure user authentication via Firebase, restricted to verified hospital personnel.
- Real-time Notifications: Real-time diagnosis alerts and federated training progress updates via WebSocket integration.
- Data Upload: Secure upload interface for multi-modal data (genomic, imaging) with direct storage to S3/GCS. Limit uploads to hospital-authorized users.
- Disease Prediction: AI-powered rare disease prediction engine, trained via federated learning, leveraging uploaded datasets.
- SHAP Analysis: Tool for interactive SHAP analysis, allowing clinicians to explore contributing factors to predictions.
- Dataset Auto-Classification: AI model to suggest dataset classes given an initial set of conditions, allowing the app to learn the variety of data in the hospital without revealing private data.
- Compliance: HIPAA/GDPR compliance adherence, including TLS encryption, server-side encryption, and audit logging.

## Style Guidelines:

- Primary color: Deep blue (#2E3192) to convey trust, intelligence, and stability, suitable for medical applications.
- Background color: Very light blue (#EBF4FA), close in hue to the primary color but almost fully desaturated, provides a clean and calming backdrop.
- Accent color: Soft lavender (#D0C9E2), analogous to the primary color, highlights key interactions without overwhelming the interface.
- Body and headline font: 'Inter', a grotesque-style sans-serif, for a modern, neutral, and objective feel that ensures readability and clarity.
- Minimalist icons with a focus on clarity and ease of understanding, using the accent color for highlights.
- Clean, card-based layout with clear visual hierarchy for ease of navigation and data interpretation.
- Subtle animations for data loading and real-time updates to enhance user experience without being distracting.