'use client';

import React from 'react';
import { redirect } from 'next/navigation';
import { Sidebar } from '@/components/shared/Sidebar';
import { useAuthStore } from '@/lib/store';
import QueryProvider from '@/providers/query-provider';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Verificar autenticación del lado del cliente
  const isAuthenticated = useAuthStore.getState().isAuthenticated;
  const user = useAuthStore.getState().user;

  // Si no está autenticado, redirigir al login
  if (!isAuthenticated || !user) {
    redirect('/login');
  }

  return (
    <QueryProvider>
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>
    </QueryProvider>
  );
}
