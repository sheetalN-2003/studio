"use client";

import { MainLayout } from '@/components/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ArrowRight, Users } from 'lucide-react';
import Link from 'next/link';

const cases = [
    {
        patientId: 'P007',
        caseTitle: 'Suspected Krabbe Disease with Rapid Neurological Decline',
        status: 'Urgent Review',
        assignedSpecialists: [
            { name: 'Dr. Carter', specialty: 'Cardiology', avatar: 'https://picsum.photos/100' },
            { name: 'Dr. Zhang', specialty: 'Neurology', avatar: 'https://picsum.photos/101' },
            { name: 'Dr. Patel', specialty: 'Genetics', avatar: 'https://picsum.photos/seed/patel/100' },
        ],
        lastUpdate: '2h ago',
    },
    {
        patientId: 'P015',
        caseTitle: 'Atypical Leigh Syndrome Presentation',
        status: 'Active Discussion',
        assignedSpecialists: [
            { name: 'Dr. Zhang', specialty: 'Neurology', avatar: 'https://picsum.photos/101' },
            { name: 'Dr. Kwon', specialty: 'Metabolics', avatar: 'https://picsum.photos/seed/kwon/100' },
        ],
        lastUpdate: '1 day ago',
    },
    {
        patientId: 'P021',
        caseTitle: 'Undiagnosed Lysosomal Storage Disorder',
        status: 'Awaiting Input',
        assignedSpecialists: [
             { name: 'Dr. Carter', specialty: 'Cardiology', avatar: 'https://picsum.photos/100' },
        ],
        lastUpdate: '3 days ago',
    }
];

const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Urgent Review':
        return <Badge className="bg-red-100 text-red-800 border-red-200">{status}</Badge>;
      case 'Active Discussion':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">{status}</Badge>;
      case 'Awaiting Input':
        return <Badge variant="secondary">{status}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  }


export default function CollaborationPage() {
  return (
    <MainLayout pageTitle="Collaboration Hub">
      <Card>
        <CardHeader>
          <CardTitle>Multidisciplinary Case Board</CardTitle>
          <CardDescription>
            Collaborate with specialists across your hospital on complex rare disease cases.
          </CardDescription>
        </CardHeader>
        <CardContent>
            {cases.length > 0 ? (
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>Case</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Assigned Specialists</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {cases.map((c) => (
                        <TableRow key={c.patientId}>
                            <TableCell>
                                <div className="font-medium">{c.caseTitle}</div>
                                <div className="text-sm text-muted-foreground">Patient ID: {c.patientId}</div>
                            </TableCell>
                            <TableCell>{getStatusBadge(c.status)}</TableCell>
                            <TableCell>
                                <div className="flex -space-x-2 overflow-hidden">
                                    {c.assignedSpecialists.map(s => (
                                        <Avatar key={s.name} className="inline-block h-8 w-8 rounded-full ring-2 ring-background">
                                            <AvatarImage src={s.avatar} data-ai-hint="person" alt={s.name} />
                                            <AvatarFallback>{s.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                    ))}
                                </div>
                            </TableCell>
                             <TableCell className="text-right">
                                <Button asChild variant="outline" size="sm">
                                    <Link href={`/collaboration/${c.patientId}`}>
                                        Enter Board <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
            ) : (
                <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/20 py-24 text-center">
                    <Users className="h-16 w-16 text-muted-foreground/50" />
                    <h3 className="mt-4 text-lg font-semibold">No Active Cases</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                        There are no multidisciplinary cases requiring collaboration at this time.
                    </p>
                </div>
            )}
        </CardContent>
      </Card>
    </MainLayout>
  );
}
