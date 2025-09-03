
"use client";

import { MainLayout } from '@/components/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AdminGuard } from '@/components/admin-guard';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { FileDown, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

// Mock audit log data
const auditLogs = [
  { id: 1, userId: "1", userName: "Dr. Emily Carter", avatar: "https://picsum.photos/100", action: "login", target: "user_session", ipAddress: "192.168.1.10", timestamp: "2024-05-23T10:00:00Z" },
  { id: 2, userId: "1", userName: "Dr. Emily Carter", avatar: "https://picsum.photos/100", action: "create_analysis", target: "Patient P001", ipAddress: "192.168.1.10", timestamp: "2024-05-23T10:05:21Z" },
  { id: 3, userId: "2", userName: "Dr. Ben Zhang", avatar: "https://picsum.photos/101", action: "login", target: "user_session", ipAddress: "10.0.0.54", timestamp: "2024-05-23T10:15:00Z" },
  { id: 4, userId: "admin01", userName: "Dr. Admin User", avatar: "https://picsum.photos/110", action: "approve_doctor", target: "Dr. Sarah Day", ipAddress: "172.16.0.1", timestamp: "2024-05-23T11:30:10Z" },
  { id: 5, userId: "2", userName: "Dr. Ben Zhang", avatar: "https://picsum.photos/101", action: "view_report", target: "Patient P007", ipAddress: "10.0.0.54", timestamp: "2024-05-23T11:45:00Z" },
  { id: 6, userId: "1", userName: "Dr. Emily Carter", avatar: "https://picsum.photos/100", action: "logout", target: "user_session", ipAddress: "192.168.1.10", timestamp: "2024-05-23T12:00:00Z" },
];

function AuditLogPage() {
  return (
    <AdminGuard>
        <MainLayout pageTitle="Audit Log">
        <Card>
            <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <CardTitle>System & Access Logs</CardTitle>
                        <CardDescription>
                            Track all significant actions for security and compliance purposes.
                        </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Filter logs..." className="pl-9 w-full sm:w-64" />
                        </div>
                        <Button variant="outline">
                            <FileDown className="mr-2 h-4 w-4" />
                            Export CSV
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>Target</TableHead>
                        <TableHead>IP Address</TableHead>
                        <TableHead className="text-right">Timestamp</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {auditLogs.map((log) => (
                        <TableRow key={log.id}>
                        <TableCell>
                            <div className="flex items-center gap-3">
                                <Avatar className="h-9 w-9">
                                    <AvatarImage src={log.avatar} data-ai-hint="person" />
                                    <AvatarFallback>{log.userName.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="font-medium">{log.userName}</div>
                            </div>
                        </TableCell>
                        <TableCell>
                            <Badge variant="secondary">{log.action}</Badge>
                        </TableCell>
                        <TableCell>{log.target}</TableCell>
                        <TableCell>{log.ipAddress}</TableCell>
                        <TableCell className="text-right text-muted-foreground">
                            {new Date(log.timestamp).toLocaleString()}
                        </TableCell>
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

export default AuditLogPage;
