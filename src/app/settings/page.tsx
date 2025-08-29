
"use client";

import { MainLayout } from '@/components/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/auth-context';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export default function SettingsPage() {
  const { user, login: updateUser } = useAuth();
  const { toast } = useToast();
  
  const [name, setName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Effect to update state when user object changes (e.g., after login)
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setSpecialty(user.specialty || '');
    }
  }, [user]);

  const handleSaveChanges = () => {
    if (!user) return;
    setIsSaving(true);
    // In a real app, you would call an API to save the changes.
    // Here we'll just update the context and localStorage.
    setTimeout(() => {
        const updatedUser = { ...user, name, specialty };
        updateUser(updatedUser);
        setIsSaving(false);
        toast({
        title: 'Profile Updated',
        description: 'Your changes have been saved successfully.',
        });
    }, 500); // Simulate network delay
  };

  return (
    <MainLayout pageTitle="Settings">
      {!user ? (
        <div className="flex h-64 w-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Profile</CardTitle>
              <CardDescription>Update your personal information and profile picture.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={user.avatar} data-ai-hint="person" alt={user.name} />
                  <AvatarFallback>{user.name?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                <Button variant="outline">Change Picture</Button>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" value={user.email} type="email" readOnly />
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="hospital">Hospital</Label>
                  <Input id="hospital" value={user.hospitalName} readOnly />
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="specialty">Specialty</Label>
                  <Input id="specialty" value={specialty} onChange={(e) => setSpecialty(e.target.value)} />
                </div>
              </div>
            </CardContent>
            <CardContent>
              <Button onClick={handleSaveChanges} disabled={isSaving}>
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
              </Button>
            </CardContent>
          </Card>
          
          <Card>
              <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription>Manage your account preferences and security.</CardDescription>
              </Header>
              <CardContent className="space-y-4">
                  <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                          <Label>Change Password</Label>
                          <p className="text-xs text-muted-foreground">
                              For security, you will be logged out after changing your password.
                          </p>
                      </div>
                      <Button variant="outline">Change Password</Button>
                  </div>
              </CardContent>
          </Card>
        </div>
      )}
    </MainLayout>
  );
}
