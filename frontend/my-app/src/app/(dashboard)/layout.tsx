'use client';

import React, { useState, useEffect } from 'react';
import { redirect } from 'next/navigation';
import { Sidebar } from '@/components/shared/Sidebar';
import { useAuthStore } from '@/lib/store';
import QueryProvider from '@/providers/query-provider';
import { Loader2 } from 'lucide-react';
import { ChatNotification } from '@/components/modules/chat/ChatNotification';
import { Toaster } from 'sonner';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isVerifying, setIsVerifying] = useState(true);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    // El hook de persistencia de Zustand necesita un momento para rehidratarse desde localStorage
    // Usamos un efecto para verificar el estado de autenticación después de la carga inicial
    const checkAuth = () => {
      const state = useAuthStore.getState();
      
      if (!state.isAuthenticated || !state.user) {
        redirect('/login');
      } else {
        setIsVerifying(false);
      }
    };

    // Si la tienda ya está hidratada, verificamos de inmediato
    if (useAuthStore.persist.hasHydrated()) {
      checkAuth();
    } else {
      // Si no, esperamos al evento de rehidratación
      const unsubscribe = useAuthStore.persist.onHydrate(() => {
        // Esperar un momento para asegurarse de que la hidratación se completó
        setTimeout(checkAuth, 50);
      });
      
      return () => {
        if (unsubscribe) unsubscribe();
      };
    }
  }, []);

  // Muestra un loader mientras se verifica la sesión
  if (isVerifying) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Verificando sesión...</p>
      </div>
    );
  }

  // Una vez verificado, muestra el layout normal
  return (
    <QueryProvider>
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
        {/* Componente invisible que maneja las notificaciones de chat */}
        <ChatNotification />
        <Toaster position="top-right" richColors />
      </div>
    </QueryProvider>
  );
}
