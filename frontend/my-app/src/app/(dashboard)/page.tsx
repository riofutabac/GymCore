'use client';

import React, { useEffect } from 'react';
import { redirect } from 'next/navigation';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export default function DashboardPage() {
  const { user, isLoading, isAuthenticated } = useCurrentUser();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      redirect('/login');
    }
  }, [isLoading, isAuthenticated]);

  // Redirigir según el rol del usuario
  useEffect(() => {
    if (!isLoading && user) {
      switch (user.role) {
        case 'OWNER':
          redirect('/owner');
          break;
        case 'MANAGER':
          redirect('/manager');
          break;
        case 'RECEPTION':
          redirect('/reception');
          break;
        case 'CLIENT':
          redirect('/client');
          break;
      }
    }
  }, [isLoading, user]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Página de fallback si no se redirige
  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Bienvenido a GymCore</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Cargando tu dashboard personalizado...</p>
        </CardContent>
      </Card>
    </div>
  );
}
