'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/lib/store';
import { UserRole } from '@/lib/types';

interface SidebarLinkProps {
  href: string;
  children: React.ReactNode;
}

function SidebarLink({ href, children }: SidebarLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
        isActive
          ? 'bg-primary text-primary-foreground'
          : 'hover:bg-muted hover:text-foreground'
      )}
    >
      {children}
    </Link>
  );
}

export function Sidebar() {
  const { user } = useAuthStore();

  if (!user) return null;

  // Renderizar diferentes enlaces según el rol del usuario
  const renderLinks = () => {
    switch (user.role) {
      case UserRole.OWNER:
        return (
          <>
            <SidebarLink href="/dashboard/owner">Dashboard</SidebarLink>
            <SidebarLink href="/dashboard/owner/gyms">Gimnasios</SidebarLink>
            <SidebarLink href="/dashboard/owner/users">Usuarios</SidebarLink>
          </>
        );
      case UserRole.MANAGER:
        return (
          <>
            <SidebarLink href="/dashboard/manager">Dashboard</SidebarLink>
            <SidebarLink href="/dashboard/manager/members">Miembros</SidebarLink>
            <SidebarLink href="/dashboard/manager/staff">Personal</SidebarLink>
            <SidebarLink href="/dashboard/manager/inventory">Inventario</SidebarLink>
          </>
        );
      case UserRole.RECEPTION:
        return (
          <>
            <SidebarLink href="/dashboard/reception">Check-in</SidebarLink>
            <SidebarLink href="/dashboard/reception/pos">Punto de Venta</SidebarLink>
          </>
        );
      case UserRole.CLIENT:
        return (
          <>
            <SidebarLink href="/dashboard/client">Mi Membresía</SidebarLink>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-full w-64 flex-col border-r bg-background">
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-xl font-bold">GymCore</span>
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-4">
        <nav className="grid gap-1 px-2">
          {renderLinks()}
          <SidebarLink href="/dashboard/settings">Configuración</SidebarLink>
        </nav>
      </div>
      <div className="border-t p-4">
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-primary/10 p-1">
            <div className="h-8 w-8 rounded-full bg-primary text-center text-primary-foreground flex items-center justify-center">
              {user.name.substring(0, 2).toUpperCase()}
            </div>
          </div>
          <div>
            <p className="text-sm font-medium">{user.name}</p>
            <p className="text-xs text-muted-foreground">{user.role}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
