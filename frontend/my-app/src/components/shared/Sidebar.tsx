'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/lib/store';
import { UserRole } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

interface SidebarLinkProps {
  href: string;
  children: React.ReactNode;
}

function SidebarLink({ href, children }: SidebarLinkProps) {
  const pathname = usePathname();
  // Check if current path matches exactly or if it's a settings subpage
  const isActive = pathname === href || (href === '/settings' && pathname.startsWith('/settings'));

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
  const { user, logout } = useAuthStore();

  if (!user) return null;

  // Renderizar diferentes enlaces según el rol del usuario
  const renderLinks = () => {
    switch (user.role) {
      case UserRole.OWNER:
        return (
          <>
            <SidebarLink href="/owner">Dashboard</SidebarLink>
            <SidebarLink href="/owner/gyms">Gimnasios</SidebarLink>
            <SidebarLink href="/owner/users">Usuarios</SidebarLink>
            <SidebarLink href="/settings">Mi Perfil</SidebarLink>
          </>
        );
      case UserRole.MANAGER:
        return (
          <>
            <SidebarLink href="/manager">Dashboard</SidebarLink>
            <SidebarLink href="/manager/members">Miembros</SidebarLink>
            <SidebarLink href="/manager/staff">Personal</SidebarLink>
            <SidebarLink href="/manager/inventory">Inventario</SidebarLink>
            <SidebarLink href="/settings">Mi Perfil</SidebarLink>
          </>
        );
      case UserRole.RECEPTION:
        return (
          <>
            <SidebarLink href="/reception">Check-in</SidebarLink>
            <SidebarLink href="/reception/pos">Punto de Venta</SidebarLink>
            <SidebarLink href="/settings">Mi Perfil</SidebarLink>
          </>
        );
      case UserRole.CLIENT:
        return (
          <>
            <SidebarLink href="/client">Mi Membresía</SidebarLink>
            <SidebarLink href="/settings">Mi Perfil</SidebarLink>
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
        </nav>
      </div>
      <div className="border-t p-4">
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-primary/10 p-1">
            <div className="h-8 w-8 rounded-full bg-primary text-center text-primary-foreground flex items-center justify-center">
              {user.name?.substring(0, 2).toUpperCase() || 'U'}
            </div>
          </div>
          <div>
            <p className="text-sm font-medium">{user.name}</p>
            <p className="text-xs text-muted-foreground">{user.role}</p>
          </div>
        </div>
        
        <Button 
          variant="outline" 
          className="w-full mt-4 flex items-center justify-center gap-2" 
          onClick={() => logout()}
        >
          <LogOut className="h-4 w-4" />
          Cerrar Sesión
        </Button>
      </div>
    </div>
  );
}
