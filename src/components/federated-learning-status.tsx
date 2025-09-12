
"use client"

import { useState, useEffect } from 'react';
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

export function FederatedLearningStatus() {
    const [progress, setProgress] = useState(0);
    const [statusText, setStatusText] = useState("Initializing training cycle...");

    useEffect(() => {
        const statuses = [
            "Initializing training cycle...",
            "Aggregating models from 14 nodes...",
            "Applying privacy-preserving measures...",
            "Training global model v2.3...",
            "Evaluating new model against benchmarks...",
            "Deploying improved model...",
            "Training cycle complete. Awaiting next cycle.",
        ];

        let statusIndex = 0;
        let currentProgress = 0;

        const interval = setInterval(() => {
            if (statusIndex >= statuses.length - 1) {
                setStatusText("Training cycle complete. Model v2.3 is live.");
                setProgress(100);
                clearInterval(interval);
                return;
            }
            
            statusIndex++;
            setStatusText(statuses[statusIndex]);

            // Simulate progress increase
            const progressIncrement = 100 / (statuses.length -1);
            let progressInterval = setInterval(() => {
                currentProgress += 5;
                if (currentProgress >= (statusIndex) * progressIncrement) {
                    if (currentProgress > 100) currentProgress = 100;
                    setProgress(currentProgress);
                    clearInterval(progressInterval);
                } else {
                    setProgress(currentProgress);
                }
            }, 100);


        }, 3000); // Change status every 3 seconds

        return () => clearInterval(interval);
    }, []);
    
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <p className="text-sm font-medium text-muted-foreground">{statusText}</p>
                <Badge variant={progress === 100 ? "default" : "secondary"} className={progress === 100 ? "bg-green-100 text-green-800" : ""}>
                    {progress === 100 ? "Complete" : "In Progress"}
                </Badge>
            </div>
            <Progress value={progress} className="w-full" />
             <div className="text-xs text-muted-foreground flex justify-between">
                <span>Model v2.2 (Active)</span>
                <span>Training records this cycle: 512</span>
                <span>Next cycle: ~2 hours</span>
             </div>
        </div>
    )
}
