
"use client";
import { MainLayout } from '@/components/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { CaseBoardChat } from '@/components/case-board-chat';
import { Users, ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AnnotationCard } from '@/components/annotation-card';

// Mock data, in a real app this would be fetched based on params.caseId
const caseDetails = {
    patientId: 'P007',
    caseTitle: 'Suspected Krabbe Disease with Rapid Neurological Decline',
    status: 'Urgent Review',
    summary: 'A 6-month-old male presenting with irritability, feeding difficulties, and increased muscle tone. Initial MRI shows abnormalities in the white matter. Genomic screening was performed, results pending. Urgent multidisciplinary consultation required to establish a differential diagnosis and treatment plan.',
    assignedSpecialists: [
        { name: 'Dr. Carter', specialty: 'Cardiology', avatar: 'https://picsum.photos/100' },
        { name: 'Dr. Zhang', specialty: 'Neurology', avatar: 'https://picsum.photos/101' },
        { name: 'Dr. Patel', specialty: 'Genetics', avatar: 'https://picsum.photos/seed/patel/100' },
        { name: 'You', specialty: 'Pediatrics', avatar: 'https://picsum.photos/seed/me/100' },
    ],
};


export default function CaseBoardPage({ params }: { params: { caseId: string } }) {

  return (
    <MainLayout pageTitle="Case Board">
        <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Live Discussion</CardTitle>
                        <CardDescription>Real-time chat with assigned specialists for Patient {params.caseId}.</CardDescription>
                    </CardHeader>
                    <CardContent>
                       <CaseBoardChat caseId={params.caseId} />
                    </CardContent>
                </Card>
                 <AnnotationCard />
            </div>
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Case Details</CardTitle>
                        <CardDescription>Patient ID: {params.caseId}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <h3 className="font-semibold">{caseDetails.caseTitle}</h3>
                        <Badge className="bg-red-100 text-red-800 border-red-200 mt-2">{caseDetails.status}</Badge>
                        <p className="text-sm text-muted-foreground mt-4">{caseDetails.summary}</p>
                        <Button variant="outline" className="w-full mt-4">
                           <ClipboardList className="mr-2 h-4 w-4" /> View Full Patient File
                        </Button>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" /> Assigned Team</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {caseDetails.assignedSpecialists.map((specialist) => (
                            <div key={specialist.name} className="flex items-center gap-3">
                                 <Avatar>
                                    <AvatarImage src={specialist.avatar} data-ai-hint="person" />
                                    <AvatarFallback>{specialist.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <div className="font-medium">{specialist.name}</div>
                                    <div className="text-sm text-muted-foreground">{specialist.specialty}</div>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    </MainLayout>
  );
}
