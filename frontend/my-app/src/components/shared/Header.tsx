import React from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { UserRole } from '@/lib/types';

export function Header() {
  const { user, isAuthenticated, logout } = useAuthStore();

  // Función para obtener la ruta del dashboard según el rol del usuario
  const getDashboardPath = () => {
    if (!user) return '/';
    
    switch (user.role) {
      case UserRole.OWNER:
        return '/dashboard/owner';
      case UserRole.MANAGER:
        return '/dashboard/manager';
      case UserRole.RECEPTION:
        return '/dashboard/reception';
      case UserRole.CLIENT:
        return '/dashboard/client';
      default:
        return '/';
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center justify-between py-4">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold">GymCore</span>
          </Link>
        </div>
        
        <nav className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <Link href={getDashboardPath()}>
                <Button variant="ghost">Dashboard</Button>
              </Link>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{user?.name}</span>
                <Button variant="outline" size="sm" onClick={logout}>
                  Cerrar Sesión
                </Button>
              </div>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost">Iniciar Sesión</Button>
              </Link>
              <Link href="/register">
                <Button>Registrarse</Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
