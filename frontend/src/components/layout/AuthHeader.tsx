
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Dumbbell, ArrowLeft } from 'lucide-react';

interface AuthHeaderProps {
  showBackToHome?: boolean;
}

export function AuthHeader({ showBackToHome = true }: AuthHeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/60">
      <div className="container flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2">
          <Dumbbell className="h-7 w-7 text-primary" />
          <span className="text-xl font-bold">GymCore</span>
        </Link>
        
        {showBackToHome && (
          <Link href="/">
            <Button variant="ghost" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Volver al inicio
            </Button>
          </Link>
        )}
      </div>
    </header>
  );
}
