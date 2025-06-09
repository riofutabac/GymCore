"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Dumbbell, 
  User, 
  Settings, 
  LogOut, 
  Menu,
  QrCode,
  ShoppingCart,
  Users,
  BarChart3,
  Building,
  Loader2
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface User {
  id: string;
  email: string;
  role: 'CLIENT' | 'RECEPTION' | 'MANAGER' | 'SYS_ADMIN';
  name?: string;
}

const roleConfig = {
  CLIENT: {
    title: "Panel del Socio",
    home: "/member",
    links: [
      { href: "/member", label: "Mi Membresía", icon: User },
      { href: "/member/qr-code", label: "Código QR", icon: QrCode },
      { href: "/member/profile", label: "Mi Perfil", icon: Settings },
    ]
  },
  RECEPTION: {
    title: "Panel de Recepción",
    home: "/reception",
    links: [
      { href: "/reception", label: "Dashboard", icon: BarChart3 },
      { href: "/reception/access-scan", label: "Escáner QR", icon: QrCode },
      { href: "/reception/pos", label: "Punto de Venta", icon: ShoppingCart },
      { href: "/reception/manual-entry", label: "Ingreso Manual", icon: Users },
    ]
  },
  MANAGER: {
    title: "Panel del Gerente",
    home: "/manager",
    links: [
      { href: "/manager", label: "Dashboard", icon: BarChart3 },
      { href: "/manager/inventory", label: "Inventario", icon: ShoppingCart },
      { href: "/manager/reports", label: "Reportes", icon: BarChart3 },
      { href: "/manager/members", label: "Socios", icon: Users },
    ]
  },
  SYS_ADMIN: {
    title: "Panel de Administrador",
    home: "/admin",
    links: [
      { href: "/admin", label: "Dashboard", icon: BarChart3 },
      { href: "/admin/gyms", label: "Gimnasios", icon: Building },
      { href: "/admin/users", label: "Usuarios", icon: Users },
      { href: "/admin/settings", label: "Configuración", icon: Settings },
    ]
  }
};

// Mapa de acceso a rutas por rol
const rolePathAccess: Record<string, User['role'][]> = {
  '/member': ['CLIENT'],
  '/reception': ['RECEPTION', 'MANAGER', 'SYS_ADMIN'],
  '/manager': ['MANAGER', 'SYS_ADMIN'],
  '/admin': ['SYS_ADMIN'],
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      router.push("/login");
      return;
    }

    try {
      const parsedUser: User = JSON.parse(userData);
      setUser(parsedUser);

      // Verificación de acceso por rol
      const currentRoute = Object.keys(rolePathAccess).find(path => pathname.startsWith(path));
      
      if (currentRoute) {
        const allowedRoles = rolePathAccess[currentRoute];
        if (!allowedRoles.includes(parsedUser.role)) {
          console.warn(`ACCESO DENEGADO: Usuario con rol '${parsedUser.role}' intentó acceder a '${pathname}'. Redirigiendo...`);
          const userHome = roleConfig[parsedUser.role]?.home || '/login';
          router.push(userHome);
          return;
        }
      }

    } catch (error) {
      console.error("Error parsing user data, logging out:", error);
      localStorage.clear();
      router.push("/login");
    } finally {
      setIsLoading(false);
    }
  }, [pathname, router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="w-16 h-16 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const config = roleConfig[user.role];
  const userInitials = user.name?.split(' ').map(n => n[0]).join('') || user.email.slice(0, 2).toUpperCase();

  const Sidebar = ({ className = "" }: { className?: string }) => (
    <div className={`flex flex-col h-full bg-white border-r ${className}`}>
      <div className="p-6 border-b">
        <div className="flex items-center gap-2">
          <Dumbbell className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold">GymCore</span>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{config.title}</p>
      </div>
      
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {config.links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  pathname === link.href ? 'bg-primary/10 text-primary font-semibold' : 'hover:bg-gray-100'
                }`}
              >
                <link.icon className="w-5 h-5" />
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:block lg:w-64">
        <Sidebar />
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden">
        <div className="flex h-16 items-center justify-between px-4 border-b bg-white">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64">
              <Sidebar />
            </SheetContent>
          </Sheet>
          
          <div className="flex items-center gap-2">
            <Dumbbell className="h-6 w-6 text-primary" />
            <span className="font-bold">GymCore</span>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative w-8 h-8 rounded-full">
                <Avatar className="w-8 h-8">
                  <AvatarFallback>{userInitials}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuItem onClick={() => router.push('/member/profile')}>
                <User className="w-4 h-4 mr-2" />
                <span>Perfil</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/admin/settings')}>
                <Settings className="w-4 h-4 mr-2" />
                <span>Configuración</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                <span>Cerrar sesión</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Desktop Header */}
        <div className="hidden lg:flex h-16 items-center justify-between px-6 border-b bg-white">
          <div>
            <h1 className="text-xl font-semibold">{config.title}</h1>
            <p className="text-sm text-muted-foreground">
              Bienvenido, {user.name || user.email}
            </p>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative w-8 h-8 rounded-full">
                <Avatar className="w-8 h-8">
                  <AvatarFallback>{userInitials}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuItem onClick={() => router.push('/member/profile')}>
                <User className="w-4 h-4 mr-2" />
                <span>Perfil</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/admin/settings')}>
                <Settings className="w-4 h-4 mr-2" />
                <span>Configuración</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                <span>Cerrar sesión</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}