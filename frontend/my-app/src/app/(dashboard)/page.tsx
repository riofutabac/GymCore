'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

// Esta página solo se mostrará momentáneamente mientras el middleware redirige
export default function DashboardPage() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Redirigiendo...</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center p-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-4 text-muted-foreground">Cargando tu panel...</p>
        </CardContent>
      </Card>
    </div>
  );
}
