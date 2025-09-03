
"use client";

import { MainLayout } from '@/components/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/context/auth-context';
import { useEffect, useState } from 'react';
import { AdminGuard } from '@/components/admin-guard';
import { getPendingRequests, approveDoctor, type User } from '@/ai/flows/user-auth-flow';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

function AdminPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isApproving, setIsApproving] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRequests() {
      if (user && user.role === 'Admin') {
        setIsLoading(true);
        const pendingData = await getPendingRequests(user.id);
        setRequests(pendingData.requests);
        setIsLoading(false);
      }
    }
    fetchRequests();
  }, [user]);

  const handleApprove = async (userId: string) => {
    setIsApproving(userId);
    try {
      const result = await approveDoctor({ userId });
      if (result.success) {
        toast({
          title: "Doctor Approved",
          description: "The doctor has been granted access to the platform.",
        });
        // Refresh list
        setRequests(requests.filter(req => req.id !== userId));
      } else {
        toast({
          variant: "destructive",
          title: "Approval Failed",
          description: "Could not approve the doctor at this time.",
        });
      }
    } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "An unexpected error occurred.",
        });
    } finally {
      setIsApproving(null);
    }
  };


  return (
    <AdminGuard>
        <MainLayout pageTitle="Doctor Management">
        <Card>
            <CardHeader>
            <CardTitle>Pending Access Requests</CardTitle>
            <CardDescription>
                Review and approve access requests from doctors at your hospital.
            </CardDescription>
            </CardHeader>
            <CardContent>
            {isLoading ? (
                <div className="flex justify-center items-center h-48">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            ) : requests.length === 0 ? (
                <div className="text-center text-muted-foreground py-12">
                    <p>No pending access requests.</p>
                </div>
            ) : (
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>Doctor</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>License ID</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {requests.map((request) => (
                        <TableRow key={request.id}>
                        <TableCell>
                            <div className="flex items-center gap-3">
                                <Avatar>
                                    <AvatarImage src={request.avatar} data-ai-hint="person" />
                                    <AvatarFallback>{request.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="font-medium">{request.name}</div>
                            </div>
                        </TableCell>
                        <TableCell>{request.department}</TableCell>
                        <TableCell>
                            <Badge variant="secondary">{request.licenseId}</Badge>
                        </TableCell>
                        <TableCell>{request.email}</TableCell>
                        <TableCell className="text-right">
                            <Button 
                                size="sm" 
                                onClick={() => handleApprove(request.id)}
                                disabled={isApproving === request.id}
                            >
                                {isApproving === request.id ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : null}
                                Approve
                            </Button>
                        </TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
            )}
            </CardContent>
        </Card>
        </MainLayout>
    </AdminGuard>
  );
}

export default AdminPage;
