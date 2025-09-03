
"use client";

import { MainLayout } from '@/components/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/context/auth-context';
import { useEffect, useState } from 'react';
import { AdminGuard } from '@/components/admin-guard';
import { getAllDoctorsForAdmin, approveDoctor, rejectDoctor, suspendDoctor, type User } from '@/ai/flows/user-auth-flow';
import { Button } from '@/components/ui/button';
import { Loader2, ShieldCheck, ShieldX, UserX } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

function AdminPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [doctors, setDoctors] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const fetchDoctors = async () => {
      if (user && user.role === 'Admin') {
        setIsLoading(true);
        const allDoctorsData = await getAllDoctorsForAdmin(user.id);
        setDoctors(allDoctorsData.doctors);
        setIsLoading(false);
      }
    };

  useEffect(() => {
    fetchDoctors();
  }, [user]);

  const handleUpdate = async (action: 'approve' | 'reject' | 'suspend', userId: string, userName: string) => {
    setIsUpdating(userId);
    try {
        let result;
        let actionFn;
        let successTitle = '';
        let successMessage = '';

        if(action === 'approve') {
            actionFn = approveDoctor;
            successTitle = "Doctor Approved";
            successMessage = `Dr. ${userName} has been granted access.`;
        } else if (action === 'reject') {
            actionFn = rejectDoctor;
            successTitle = "Doctor Rejected";
            successMessage = `Access request for Dr. ${userName} has been rejected.`;
        } else { // suspend
            actionFn = suspendDoctor;
            successTitle = "Doctor Suspended";
            successMessage = `Access for Dr. ${userName} has been suspended.`;
        }

      result = await actionFn({ userId });

      if (result.success) {
        toast({
          title: successTitle,
          description: successMessage,
        });
        // Refresh list
        fetchDoctors();
      } else {
        toast({
          variant: "destructive",
          title: "Update Failed",
          description: "Could not update the doctor's status at this time.",
        });
      }
    } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "An unexpected error occurred.",
        });
    } finally {
      setIsUpdating(null);
    }
  };

  const getStatusBadge = (status: User['status']) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Approved</Badge>;
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'suspended':
        return <Badge variant="destructive" className="bg-orange-100 text-orange-800 border-orange-200">Suspended</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  }


  return (
    <AdminGuard>
        <MainLayout pageTitle="Doctor Management">
        <Card>
            <CardHeader>
            <CardTitle>Manage Hospital Doctors</CardTitle>
            <CardDescription>
                Review access requests and manage doctor accounts for your hospital.
            </CardDescription>
            </CardHeader>
            <CardContent>
            {isLoading ? (
                <div className="flex justify-center items-center h-48">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            ) : doctors.length === 0 ? (
                <div className="text-center text-muted-foreground py-12">
                    <p>No doctors associated with your hospital yet.</p>
                </div>
            ) : (
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>Doctor</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>License ID</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {doctors.map((doctor) => (
                        <TableRow key={doctor.id}>
                        <TableCell>
                            <div className="flex items-center gap-3">
                                <Avatar>
                                    <AvatarImage src={doctor.avatar} data-ai-hint="person" />
                                    <AvatarFallback>{doctor.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <div className="font-medium">{doctor.name}</div>
                                    <div className="text-sm text-muted-foreground">{doctor.email}</div>
                                </div>
                            </div>
                        </TableCell>
                        <TableCell>{doctor.department}</TableCell>
                        <TableCell>
                            <Badge variant="outline">{doctor.licenseId}</Badge>
                        </TableCell>
                         <TableCell>
                            {getStatusBadge(doctor.status)}
                         </TableCell>
                        <TableCell className="text-right">
                             <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" disabled={isUpdating === doctor.id}>
                                         {isUpdating === doctor.id ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Manage'}
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    {doctor.status === 'pending' && (
                                        <>
                                            <DropdownMenuItem onClick={() => handleUpdate('approve', doctor.id, doctor.name)}>
                                                <ShieldCheck className="mr-2 h-4 w-4" /> Approve
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="text-destructive" onClick={() => handleUpdate('reject', doctor.id, doctor.name)}>
                                                <ShieldX className="mr-2 h-4 w-4" /> Reject
                                            </DropdownMenuItem>
                                        </>
                                    )}
                                    {doctor.status === 'approved' && (
                                        <DropdownMenuItem className="text-destructive" onClick={() => handleUpdate('suspend', doctor.id, doctor.name)}>
                                            <UserX className="mr-2 h-4 w-4" /> Suspend
                                        </DropdownMenuItem>
                                    )}
                                     {doctor.status === 'suspended' && (
                                        <DropdownMenuItem onClick={() => handleUpdate('approve', doctor.id, doctor.name)}>
                                            <ShieldCheck className="mr-2 h-4 w-4" /> Re-Approve
                                        </DropdownMenuItem>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
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
