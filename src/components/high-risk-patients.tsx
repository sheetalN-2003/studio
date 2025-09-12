
"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle } from 'lucide-react';
import { Button } from "./ui/button";

const highRiskPatients = [
  {
    patientId: "P007",
    disease: "Krabbe Disease",
    probability: "98.2%",
    reason: "Critical genetic marker + Rapid symptom progression",
  },
  {
    patientId: "P015",
    disease: "Leigh Syndrome",
    probability: "96.5%",
    reason: "Key metabolic markers & Neuroimaging data match",
  },
  {
    patientId: "P001",
    disease: "Fabry Disease",
    probability: "92.5%",
    reason: "New onset of renal complications reported",
  },
];

export function HighRiskPatients() {
  return (
    <div className="w-full">
        <Table>
            <TableHeader>
                <TableRow>
                <TableHead className="w-[100px]">Patient ID</TableHead>
                <TableHead>Top Prediction</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead className="text-right">Action</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {highRiskPatients.map((patient) => (
                <TableRow key={patient.patientId} className="group hover:bg-red-50/50 dark:hover:bg-red-900/10">
                    <TableCell className="font-medium">{patient.patientId}</TableCell>
                    <TableCell>
                        <div className="flex flex-col">
                            <span className="font-medium">{patient.disease}</span>
                            <span className="text-sm text-destructive font-semibold">{patient.probability}</span>
                        </div>
                    </TableCell>
                    <TableCell>{patient.reason}</TableCell>
                    <TableCell className="text-right">
                        <Button variant="outline" size="sm">View Case</Button>
                    </TableCell>
                </TableRow>
                ))}
            </TableBody>
        </Table>
    </div>
  )
}
