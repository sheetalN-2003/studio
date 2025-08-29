
"use client";

import { MainLayout } from '@/components/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/context/auth-context';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AdminGuard } from '@/components/admin-guard';

const users = [
  {
    id: "USR001",
    name: "Dr. Emily Carter",
    email: "emily.carter@med.example.com",
    hospital: "General Hospital",
    role: "Clinician",
    avatar: "https://picsum.photos/100",
  },
  {
    id: "USR002",
    name: "Dr. Ben Zhang",
    email: "ben.zhang@med.example.com",
    hospital: "City Clinic",
    role: "Researcher",
    avatar: "https://picsum.photos/101",
  },
  {
    id: "USR003",
    name: "Dr. Aisha Khan",
    email: "aisha.khan@med.example.com",
    hospital: "General Hospital",
    role: "Clinician",
    avatar: "https://picsum.photos/102",
  },
   {
    id: "USR004",
    name: "Dr. David Lee",
    email: "david.lee@med.example.com",
    hospital: "Sunrise Medical",
    role: "Clinician",
    avatar: "https://picsum.photos/103",
  },
  {
    id: "admin01",
    name: "Admin User",
    email: "admin@med.example.com",
    hospital: "GenoSym-AI Corp",
    role: "Admin",
    avatar: "https://picsum.photos/110"
  }
];

function AdminPage() {
  return (
    <AdminGuard>
        <MainLayout pageTitle="User Management">
        <Card>
            <CardHeader>
            <CardTitle>All Users</CardTitle>
            <CardDescription>
                Manage all registered users in the GenoSym-AI platform.
            </CardDescription>
            </CardHeader>
            <CardContent>
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Hospital</TableHead>
                    <TableHead className="text-center">Role</TableHead>
                    <TableHead>Contact</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {users.map((user) => (
                    <TableRow key={user.id}>
                    <TableCell>
                        <div className="flex items-center gap-3">
                            <Avatar>
                                <AvatarImage src={user.avatar} data-ai-hint="person" />
                                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="font-medium">{user.name}</div>
                        </div>
                    </TableCell>
                    <TableCell>{user.hospital}</TableCell>
                    <TableCell className="text-center">
                        <Badge variant={user.role === 'Admin' ? 'destructive' : user.role === 'Researcher' ? 'secondary' : 'default'}>
                        {user.role}
                        </Badge>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
            </CardContent>
        </Card>
        </MainLayout>
    </AdminGuard>
  );
}

export default AdminPage;
