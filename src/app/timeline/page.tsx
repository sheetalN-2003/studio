"use client";

import { MainLayout } from '@/components/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Stethoscope, Dna, Lightbulb, User, GitBranch, Bot, TestTube, TrendingUp, Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState, useEffect } from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { runDigitalTwinSimulation, type DigitalTwinOutput, type DigitalTwinInput } from '@/ai/flows/digital-twin-flow';
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line } from 'recharts';
import { ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

const timelineData = {
  "P001": [
    { date: "2023-01-15", type: "symptom", title: "Initial Consultation", description: "Patient presents with intermittent severe pain in hands and feet.", icon: <Stethoscope /> },
    { date: "2023-02-10", type: "symptom", title: "New Symptom Reported", description: "Patient develops skin lesions (angiokeratomas) on the lower abdomen.", icon: <Stethoscope /> },
    { date: "2023-03-05", type: "genomic", title: "Genomic Sequencing", description: "GLA gene sequencing ordered to investigate suspected lysosomal storage disorder.", icon: <Dna /> },
    { date: "2023-03-20", type: "genomic", "title-class": "text-primary", title: "Genetic Marker Identified", description: "Variant c.679C>T in GLA gene detected.", icon: <Dna /> },
    { date: "2023-04-01", type: "prediction", title: "Initial AI Analysis", description: "AI predicts Fabry Disease with 78% probability based on symptoms and initial labs.", icon: <Lightbulb /> },
    { date: "2023-04-05", type: "prediction", "title-class": "text-primary", title: "Confirmed AI Prediction", description: "AI prediction updated to 92.5% probability for Fabry Disease after including genomic data.", icon: <Lightbulb /> },
    { date: "2023-04-15", type: "symptom", title: "Treatment Started", description: "Enzyme replacement therapy (ERT) initiated.", icon: <Stethoscope /> },
  ],
  "P002": [
    { date: "2022-11-20", type: "symptom", title: "First Noticed Symptoms", description: "Patient reports Kayser-Fleischer rings and slight tremor in hands.", icon: <Stethoscope /> },
    { date: "2022-12-15", type: "genomic", title: "Genetic Test Ordered", description: "ATP7B gene analysis requested.", icon: <Dna /> },
    { date: "2023-01-10", type: "genomic", "title-class": "text-primary", title: "Mutation Confirmed", description: "Compound heterozygous mutation in ATP7B gene found.", icon: <Dna /> },
    { date: "2023-01-20", type: "prediction", title: "AI Analysis Complete", description: "AI predicts Wilson's Disease with 94% probability.", icon: <Lightbulb /> },
  ]
};

type TimelineEvent = {
  date: string;
  type: 'symptom' | 'genomic' | 'prediction';
  title: string;
  description: string;
  icon: React.ReactElement;
  'title-class'?: string;
};

const patients = [
  { id: "P001", name: "Alice Johnson" },
  { id: "P002", name: "Robert Miller" },
];

export default function TimelinePage() {
  const [selectedPatient, setSelectedPatient] = useState("P001");
  const [simulationTherapy, setSimulationTherapy] = useState<DigitalTwinInput['therapy']>('none');
  const [simulationData, setSimulationData] = useState<DigitalTwinOutput | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  useEffect(() => {
    const runSimulation = async () => {
      setIsSimulating(true);
      const result = await runDigitalTwinSimulation({
        patientId: selectedPatient,
        therapy: simulationTherapy,
      });
      setSimulationData(result);
      setIsSimulating(false);
    };
    runSimulation();
  }, [selectedPatient, simulationTherapy]);
  
  const getIconBgClass = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'symptom': return 'bg-blue-100 text-blue-600';
      case 'genomic': return 'bg-purple-100 text-purple-600';
      case 'prediction': return 'bg-amber-100 text-amber-600';
    }
  };

  const currentTimeline = timelineData[selectedPatient as keyof typeof timelineData] || [];

  return (
    <MainLayout pageTitle="Patient Timeline & Simulation">
        <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
                <Card>
                    <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <CardTitle className="flex items-center gap-2"><GitBranch className="h-5 w-5" /> Historical & Predictive Timeline</CardTitle>
                            <CardDescription>
                            A log of the patient’s past events and a simulation of their future.
                            </CardDescription>
                        </div>
                        <div className='flex items-center gap-2'>
                            <User className="h-5 w-5 text-muted-foreground" />
                            <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                                <SelectTrigger className="w-[200px]">
                                    <SelectValue placeholder="Select Patient" />
                                </SelectTrigger>
                                <SelectContent>
                                    {patients.map(p => (
                                        <SelectItem key={p.id} value={p.id}>{p.name} ({p.id})</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    </CardHeader>
                    <CardContent>
                    <div className="relative pl-6 after:absolute after:inset-y-0 after:w-px after:bg-muted-foreground/20 after:left-10">
                        {currentTimeline.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((item, index) => (
                        <div key={index} className="grid grid-cols-[auto_1fr] items-start gap-x-6 gap-y-2 mb-8">
                            <div className="flex items-center gap-x-6">
                            <div className={`flex h-8 w-8 items-center justify-center rounded-full z-10 ring-8 ring-background ${getIconBgClass(item.type)}`}>
                                {item.icon}
                            </div>
                            </div>
                            <div className="w-full">
                            <time className="text-sm font-semibold text-muted-foreground">
                                {new Date(item.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                            </time>
                            <h3 className={`mt-1 text-lg font-semibold ${item['title-class'] || ''}`}>{item.title}</h3>
                            <p className="mt-1 text-muted-foreground">{item.description}</p>
                            </div>
                        </div>
                        ))}
                    </div>
                    </CardContent>
                </Card>
            </div>
             <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Bot className="h-5 w-5" /> Digital Twin Simulation</CardTitle>
                        <CardDescription>Simulate the patient's future biomarker progression based on different therapeutic interventions.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Label>Select Simulation Scenario</Label>
                        <RadioGroup
                            value={simulationTherapy}
                            onValueChange={(value: DigitalTwinInput['therapy']) => setSimulationTherapy(value)}
                            className="flex flex-col space-y-1"
                        >
                            <div className="flex items-center space-x-3">
                                <RadioGroupItem value="none" id="sim-none" />
                                <Label htmlFor="sim-none" className="font-normal">No Intervention</Label>
                            </div>
                            <div className="flex items-center space-x-3">
                                <RadioGroupItem value="ert" id="sim-ert" />
                                <Label htmlFor="sim-ert" className="font-normal">Enzyme Replacement Therapy (ERT)</Label>
                            </div>
                            <div className="flex items-center space-x-3">
                                <RadioGroupItem value="gene_therapy" id="sim-gt" />
                                <Label htmlFor="sim-gt" className="font-normal">Gene Therapy</Label>
                            </div>
                        </RadioGroup>
                    </CardContent>
                </Card>

                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5" /> 5-Year Biomarker Projection</CardTitle>
                        <CardDescription>Projected values for key disease markers.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isSimulating ? (
                            <div className="flex h-64 w-full items-center justify-center text-muted-foreground">
                                <Loader2 className="h-8 w-8 animate-spin" />
                            </div>
                        ) : (
                             <div className="h-64 w-full">
                                <ResponsiveContainer>
                                    <LineChart data={simulationData?.projection}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="year" />
                                        <YAxis />
                                        <ChartTooltip content={<ChartTooltipContent />} />
                                        <Legend />
                                        <Line type="monotone" dataKey="biomarkerA" name="Enzyme Activity" stroke="hsl(var(--primary))" strokeWidth={2} />
                                        <Line type="monotone" dataKey="biomarkerB" name="Substrate Level" stroke="hsl(var(--destructive))" strokeWidth={2} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                       
                    </CardContent>
                </Card>
            </div>
        </div>
    </MainLayout>
  );
}
