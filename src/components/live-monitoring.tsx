
"use client";

import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Activity, Droplets, Gauge, HeartPulse, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';
import imageData from '@/app/lib/placeholder-images.json';

type Vital = {
  label: string;
  value: number;
  unit: string;
  isAbnormal: boolean;
};

type PatientVitals = {
  id: string;
  name: string;
  avatar: { src: string, hint: string };
  diagnosis: string;
  hr: Vital;
  spo2: Vital;
  bp: Vital;
};

const initialPatientData: PatientVitals[] = [
  {
    id: "P007",
    name: "Charlie Brown",
    avatar: imageData.patientMonitoring1,
    diagnosis: "Krabbe Disease",
    hr: { label: "HR", value: 135, unit: "bpm", isAbnormal: false },
    spo2: { label: "SpO2", value: 98, unit: "%", isAbnormal: false },
    bp: { label: "BP", value: 90, unit: "/60", isAbnormal: false },
  },
  {
    id: "P015",
    name: "David Chen",
    avatar: imageData.patientMonitoring2,
    diagnosis: "Leigh Syndrome",
    hr: { label: "HR", value: 110, unit: "bpm", isAbnormal: false },
    spo2: { label: "SpO2", value: 99, unit: "%", isAbnormal: false },
    bp: { label: "BP", value: 95, unit: "/65", isAbnormal: false },
  },
  {
    id: "P023",
    name: "Maria Garcia",
    avatar: imageData.patientMonitoring3,
    diagnosis: "Mitochondrial Myopathy",
    hr: { label: "HR", value: 88, unit: "bpm", isAbnormal: false },
    spo2: { label: "SpO2", value: 97, unit: "%", isAbnormal: false },
    bp: { label: "BP", value: 110, unit: "/70", isAbnormal: false },
  },
];

const normalRanges = {
    hr: { min: 60, max: 140 },
    spo2: { min: 95, max: 100 },
    bp: { min: 80, max: 120 },
}

export function LivePatientMonitoring() {
  const [patients, setPatients] = useState(initialPatientData);

  useEffect(() => {
    const interval = setInterval(() => {
      setPatients(prevPatients => 
        prevPatients.map(p => {
          // Simulate HR fluctuation
          const hrChange = Math.floor(Math.random() * 7) - 3; // -3 to +3
          let newHr = p.hr.value + hrChange;
          
          // Occasionally spike or drop for patient P015
          if(p.id === 'P015' && Math.random() < 0.1) {
              newHr = Math.random() < 0.5 ? 55 : 150;
          }

          // Simulate SpO2 fluctuation
          const spo2Change = Math.random() < 0.2 ? (Math.random() < 0.5 ? -1 : 1) : 0;
          let newSpo2 = p.spo2.value + spo2Change;
          
          // Clamp values
          newHr = Math.max(40, Math.min(200, newHr));
          newSpo2 = Math.max(85, Math.min(100, newSpo2));
          
          return {
            ...p,
            hr: { ...p.hr, value: newHr, isAbnormal: newHr < normalRanges.hr.min || newHr > normalRanges.hr.max },
            spo2: { ...p.spo2, value: newSpo2, isAbnormal: newSpo2 < normalRanges.spo2.min },
          };
        })
      );
    }, 2000); // Update every 2 seconds

    return () => clearInterval(interval);
  }, []);

  const hasAnomaly = patients.some(p => p.hr.isAbnormal || p.spo2.isAbnormal || p.bp.isAbnormal);

  return (
    <div className="space-y-4">
        {hasAnomaly && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-3">
                <ShieldAlert className="h-6 w-6 text-destructive" />
                <div>
                    <h4 className="font-bold text-destructive">Anomaly Detected</h4>
                    <p className="text-sm text-destructive/80">One or more patients have abnormal vital signs requiring immediate attention.</p>
                </div>
            </div>
        )}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {patients.map(patient => (
            <Card key={patient.id} className={cn("transition-all", (patient.hr.isAbnormal || patient.spo2.isAbnormal) && "border-destructive/50 ring-2 ring-destructive/20")}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className='flex items-center gap-3'>
                    <Avatar className="h-12 w-12">
                        <AvatarImage src={patient.avatar.src} data-ai-hint={patient.avatar.hint} alt={patient.name} />
                        <AvatarFallback>{patient.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <CardTitle className="text-lg">{patient.name}</CardTitle>
                        <p className="text-xs text-muted-foreground">{patient.diagnosis}</p>
                    </div>
                </div>
                <Activity className={cn("h-6 w-6 text-green-500", (patient.hr.isAbnormal || patient.spo2.isAbnormal) && "text-destructive animate-pulse")} />
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-3 gap-4 text-center">
                    <VitalDisplay icon={<HeartPulse />} vital={patient.hr} />
                    <VitalDisplay icon={<Droplets />} vital={patient.spo2} />
                    <VitalDisplay icon={<Gauge />} vital={patient.bp} />
                </div>
            </CardContent>
            </Card>
        ))}
        </div>
    </div>
  );
}


function VitalDisplay({ icon, vital }: { icon: React.ReactNode, vital: Vital }) {
    return (
        <div className={cn("flex flex-col items-center justify-center p-2 rounded-lg transition-colors", vital.isAbnormal && "bg-destructive/10")}>
            <div className={cn("h-6 w-6 mb-1", vital.isAbnormal && "text-destructive")}>{icon}</div>
            <div className={cn("text-2xl font-bold tracking-tight", vital.isAbnormal && "text-destructive")}>
                {vital.value}
                <span className="text-base font-normal text-muted-foreground">{vital.unit}</span>
            </div>
            <div className="text-xs text-muted-foreground">{vital.label}</div>
        </div>
    )
}
