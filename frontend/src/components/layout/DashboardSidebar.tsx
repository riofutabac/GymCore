
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dumbbell,
  Users,
  BarChart3,
  Settings,
  QrCode,
  ScanLine,
  ShoppingCart,
  Package,
  UserCheck,
  User,
  Building2,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { User as UserType } from '@/lib/types';
import { authAPI } from '@/lib/api';
import { clearAuth } from '@/lib/auth';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

interface DashboardSidebarProps {
  user: UserType;
}

const roleMenus = {
  SYS_ADMIN: [
    { href: '/admin', icon: BarChart3, label: 'Dashboard' },
    { href: '/admin/gyms', icon: Building2, label: 'Gimnasios' },
    { href: '/admin/users', icon: Users, label: 'Usuarios' },
    { href: '/admin/reports', icon: BarChart3, label: 'Reportes' },
    { href: '/admin/settings', icon: Settings, label: 'Configuración' },
  ],
  MANAGER: [
    { href: '/manager', icon: BarChart3, label: 'Dashboard' },
    { href: '/manager/members', icon: Users, label: 'Miembros' },
    { href: '/manager/inventory', icon: Package, label: 'Inventario' },
    { href: '/manager/reports', icon: BarChart3, label: 'Reportes' },
  ],
  RECEPTION: [
    { href: '/reception', icon: BarChart3, label: 'Dashboard' },
    { href: '/reception/access-scan', icon: ScanLine, label: 'Escanear Acceso' },
    { href: '/reception/manual-entry', icon: UserCheck, label: 'Entrada Manual' },
    { href: '/reception/pos', icon: ShoppingCart, label: 'Punto de Venta' },
  ],
  CLIENT: [
    { href: '/member', icon: BarChart3, label: 'Mi Panel' },
    { href: '/member/qr-code', icon: QrCode, label: 'Mi Código QR' },
    { href: '/member/profile', icon: User, label: 'Mi Perfil' },
  ],
};

export function DashboardSidebar({ user }: DashboardSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();

  const menuItems = roleMenus[user.role] || [];

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      clearAuth();
      
      toast({
        title: 'Sesión cerrada',
        description: 'Has cerrado sesión exitosamente',
      });
      
      router.push('/login');
      router.refresh();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Error al cerrar sesión',
      });
    }
  };

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      {/* Mobile overlay */}
      {!collapsed && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setCollapsed(true)}
        />
      )}

      <aside
        className={cn(
          'fixed left-0 top-0 z-50 h-full bg-white border-r transition-all duration-300 lg:relative lg:translate-x-0',
          collapsed ? '-translate-x-full lg:w-20' : 'w-64',
          'lg:block'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            {!collapsed && (
              <div className="flex items-center space-x-2">
                <Dumbbell className="h-8 w-8 text-primary" />
                <span className="text-xl font-bold">GymCore</span>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCollapsed(!collapsed)}
              className="lg:hidden"
            >
              {collapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? 'default' : 'ghost'}
                    className={cn(
                      'w-full justify-start',
                      collapsed && 'px-2'
                    )}
                  >
                    <Icon className={cn('h-4 w-4', !collapsed && 'mr-3')} />
                    {!collapsed && item.label}
                  </Button>
                </Link>
              );
            })}
          </nav>

          <Separator />

          {/* User menu */}
          <div className="p-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className={cn(
                    'w-full justify-start',
                    collapsed && 'px-2'
                  )}
                >
                  <Avatar className={cn('h-6 w-6', !collapsed && 'mr-3')}>
                    <AvatarFallback className="text-xs">
                      {getUserInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  {!collapsed && (
                    <div className="flex flex-col items-start text-sm">
                      <span className="font-medium">{user.name}</span>
                      <span className="text-muted-foreground text-xs">{user.role}</span>
                    </div>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/member/profile">
                    <User className="mr-2 h-4 w-4" />
                    Mi Perfil
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Cerrar Sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </aside>
    </>
  );
}
