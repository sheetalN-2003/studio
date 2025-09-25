
"use client";

import { MainLayout } from '@/components/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import { User, Dna, FlaskConical, MapPin, Building, Loader2, Search } from 'lucide-react';
import { findMatchingTrials, type Trial, type TrialMatchingInput } from '@/ai/flows/trial-matching-flow';
import { useToast } from '@/hooks/use-toast';

const patients = [
  { id: "P001", name: "Alice Johnson", diagnosis: "Fabry Disease", age: 42, markers: ["GLA gene c.679C>T"] },
  { id: "P015", name: "David Chen", diagnosis: "Leigh Syndrome", age: 4, markers: ["SURF1 gene mutation"] },
  { id: "P007", name: "Charlie Brown", diagnosis: "Krabbe Disease", age: 1, markers: ["GALC gene deficiency"] },
];

export default function TrialsPage() {
    const [selectedPatientId, setSelectedPatientId] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [matchingTrials, setMatchingTrials] = useState<Trial[] | null>(null);
    const { toast } = useToast();

    const handleFindTrials = async () => {
        if (!selectedPatientId) {
            toast({
                variant: 'destructive',
                title: 'No Patient Selected',
                description: 'Please select a patient to find matching trials.',
            });
            return;
        }

        setIsLoading(true);
        setMatchingTrials(null);

        try {
            const patient = patients.find(p => p.id === selectedPatientId);
            if (!patient) return;

            const input: TrialMatchingInput = {
                patientInfo: {
                    age: patient.age,
                    diagnosis: patient.diagnosis,
                    geneticMarkers: patient.markers
                }
            };

            const result = await findMatchingTrials(input);
            setMatchingTrials(result.trials);
        } catch (error) {
             console.error("Trial matching failed:", error);
             toast({
                variant: "destructive",
                title: "Error",
                description: "Could not fetch matching clinical trials at this time.",
             });
        } finally {
            setIsLoading(false);
        }
    };

  return (
    <MainLayout pageTitle="Clinical Trial Finder">
        <Card>
            <CardHeader>
                <CardTitle>Match Patients to Research Trials</CardTitle>
                <CardDescription>
                    Select a patient to automatically find relevant, ongoing clinical trials based on their diagnosis and genetic markers.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col sm:flex-row sm:items-end sm:gap-4 space-y-4 sm:space-y-0">
                    <div className="flex-grow">
                        <label htmlFor="patient-select" className="text-sm font-medium">Patient</label>
                        <div className="flex items-center gap-2 mt-1">
                             <User className="h-5 w-5 text-muted-foreground" />
                            <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
                                <SelectTrigger id="patient-select" className="w-full md:w-[300px]">
                                    <SelectValue placeholder="Select a patient..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {patients.map(p => (
                                        <SelectItem key={p.id} value={p.id}>{p.name} ({p.id}) - {p.diagnosis}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <Button onClick={handleFindTrials} disabled={isLoading || !selectedPatientId} className="w-full sm:w-auto">
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                        Find Matching Trials
                    </Button>
                </div>
            </CardContent>
        </Card>

        {isLoading && (
            <div className="mt-8 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/20 py-24 text-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <h3 className="mt-4 text-lg font-semibold">Searching Trial Databases...</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                    Matching patient profile against global clinical trial data.
                </p>
            </div>
        )}
        
        {matchingTrials && (
             <div className="mt-8">
                {matchingTrials.length > 0 ? (
                    <div className="space-y-6">
                         <h2 className="text-xl font-bold">Found {matchingTrials.length} Potential Trial(s)</h2>
                        {matchingTrials.map(trial => (
                            <Card key={trial.id} className="hover:border-primary/50 transition-colors">
                                <CardHeader>
                                    <CardTitle className="text-lg">{trial.title}</CardTitle>
                                    <CardDescription>Trial ID: {trial.id}</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <p className="text-sm text-muted-foreground">{trial.summary}</p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                                        <div className="flex items-start gap-2">
                                            <Dna className="h-5 w-5 text-primary mt-0.5" />
                                            <div>
                                                <h4 className="font-semibold">Key Criteria</h4>
                                                <p className="text-muted-foreground">{trial.criteria}</p>
                                            </div>
                                        </div>
                                         <div className="flex items-start gap-2">
                                            <Building className="h-5 w-5 text-primary mt-0.5" />
                                            <div>
                                                <h4 className="font-semibold">Sponsor</h4>
                                                <p className="text-muted-foreground">{trial.sponsor}</p>
                                            </div>
                                        </div>
                                         <div className="flex items-start gap-2">
                                            <MapPin className="h-5 w-5 text-primary mt-0.5" />
                                            <div>
                                                <h4 className="font-semibold">Locations</h4>
                                                <p className="text-muted-foreground">{trial.locations.join(', ')}</p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="mt-8 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/20 py-24 text-center">
                        <FlaskConical className="h-16 w-16 text-muted-foreground/50" />
                        <h3 className="mt-4 text-lg font-semibold">No Matching Trials Found</h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                            There are currently no active clinical trials matching this patient's profile.
                        </p>
                    </div>
                )}
            </div>
        )}

    </MainLayout>
  );
}
