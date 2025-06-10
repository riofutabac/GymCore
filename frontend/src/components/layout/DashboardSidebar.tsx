'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Home,
  Users,
  Package,
  ShoppingCart,
  BarChart3,
  Settings,
  LogOut,
  QrCode,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { User } from '@/lib/types';
import { logout } from '@/lib/auth';

// Componente para mostrar enlaces de navegación
const NavLink = ({
  href,
  icon: Icon,
  children,
  isActive,
}: {
  href: string;
  icon: any;
  children: React.ReactNode;
  isActive: boolean;
}) => (
  <Link href={href} className="w-full">
    <Button
      variant={isActive ? 'default' : 'ghost'}
      className={cn(
        'w-full justify-start',
        isActive ? 'bg-primary text-primary-foreground' : ''
      )}
    >
      <Icon className="mr-2 h-5 w-5" />
      <span className="truncate">{children}</span>
    </Button>
  </Link>
);

// Mapeo de rutas de navegación según rol de usuario
const roleBasedNavs = {
  SYS_ADMIN: [
    { href: '/admin', icon: Home, label: 'Dashboard' },
    { href: '/admin/gyms', icon: Users, label: 'Gimnasios' },
    { href: '/admin/users', icon: Users, label: 'Usuarios' },
    { href: '/admin/reports', icon: BarChart3, label: 'Reportes' },
    { href: '/admin/settings', icon: Settings, label: 'Configuración' },
  ],
  MANAGER: [
    { href: '/manager', icon: Home, label: 'Dashboard' },
    { href: '/manager/members', icon: Users, label: 'Socios' },
    { href: '/manager/inventory', icon: Package, label: 'Inventario' },
    { href: '/manager/sales', icon: ShoppingCart, label: 'Ventas' },
    { href: '/manager/reports', icon: BarChart3, label: 'Reportes' },
    { href: '/manager/settings', icon: Settings, label: 'Configuración' },
  ],
  RECEPTION: [
    { href: '/reception', icon: Home, label: 'Dashboard' },
    { href: '/reception/access-scan', icon: QrCode, label: 'Escanear QR' },
    { href: '/reception/manual-entry', icon: Users, label: 'Ingreso Manual' },
    { href: '/reception/pos', icon: ShoppingCart, label: 'Punto de Venta' },
  ],
  CLIENT: [
    { href: '/member', icon: Home, label: 'Dashboard' },
    { href: '/member/qr-code', icon: QrCode, label: 'Mi código QR' },
    { href: '/member/profile', icon: Users, label: 'Mi perfil' },
  ],
};

export function DashboardSidebar({ user }: { user: User }) {
  const pathname = usePathname();
  const userRole = user?.role || 'CLIENT';
  
  // Obtener las rutas de navegación según el rol del usuario
  const navLinks = roleBasedNavs[userRole as keyof typeof roleBasedNavs] || roleBasedNavs.CLIENT;

  return (
    <div className="hidden md:flex flex-col border-r bg-white p-4 w-64 shrink-0">
      <div className="flex items-center mb-8">
        <span className="text-2xl font-bold">GymCore</span>
      </div>

      <nav className="space-y-2 flex-1">
        {navLinks.map((link) => (
          <NavLink
            key={link.href}
            href={link.href}
            icon={link.icon}
            isActive={pathname === link.href}
          >
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t pt-4 mt-6">
        <p className="text-sm text-gray-500 mb-4">
          Conectado como <strong>{user?.name}</strong>
        </p>
        <Button 
          variant="outline" 
          className="w-full justify-start text-red-600" 
          onClick={() => logout()}
        >
          <LogOut className="mr-2 h-5 w-5" />
          Cerrar sesión
        </Button>
      </div>
    </div>
  );
}
