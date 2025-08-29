
import { MainLayout } from '@/components/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

export default function SettingsPage() {
  return (
    <MainLayout pageTitle="Settings">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>User Profile</CardTitle>
            <CardDescription>Update your personal information and profile picture.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src="https://picsum.photos/100" data-ai-hint="person" alt="Dr. Emily Carter" />
                <AvatarFallback>EC</AvatarFallback>
              </Avatar>
              <Button variant="outline">Change Picture</Button>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" defaultValue="Dr. Emily Carter" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" defaultValue="emily.carter@med.example.com" type="email" readOnly />
              </div>
               <div className="space-y-2">
                <Label htmlFor="hospital">Hospital</Label>
                <Input id="hospital" defaultValue="General Hospital" readOnly />
              </div>
               <div className="space-y-2">
                <Label htmlFor="specialty">Specialty</Label>
                <Input id="specialty" defaultValue="Cardiologist" />
              </div>
            </div>
          </CardContent>
          <CardContent>
            <Button>Save Changes</Button>
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
    </MainLayout>
  );
}
