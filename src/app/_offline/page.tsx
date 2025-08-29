import { Logo } from '@/components/icons';
import { WifiOff } from 'lucide-react';

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-center">
      <div className="mb-8 flex items-center gap-2 text-2xl font-semibold">
        <Logo className="size-8" />
        <h1>GenoSym-AI</h1>
      </div>
      <div className="space-y-4">
        <WifiOff className="mx-auto h-16 w-16 text-muted-foreground" />
        <h2 className="text-3xl font-bold">You are offline</h2>
        <p className="text-muted-foreground">
          It looks like you've lost your connection. Please check your network and try again.
        </p>
        <p className="text-sm text-muted-foreground">
          Some functionality may be limited until you are back online.
        </p>
      </div>
    </div>
  );
}
