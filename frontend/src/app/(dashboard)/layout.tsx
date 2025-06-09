"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
  Building
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface User {
  id: string;
  email: string;
  role: string;
  name?: string;
}

const roleConfig = {
  CLIENT: {
    title: "Panel del Socio",
    links: [
      { href: "/member", label: "Mi Membresía", icon: User },
      { href: "/member/qr-code", label: "Código QR", icon: QrCode },
      { href: "/member/profile", label: "Mi Perfil", icon: Settings },
    ]
  },
  RECEPTION: {
    title: "Panel de Recepción", 
    links: [
      { href: "/reception/access-scan", label: "Escáner QR", icon: QrCode },
      { href: "/reception/pos", label: "Punto de Venta", icon: ShoppingCart },
      { href: "/reception/manual-entry", label: "Ingreso Manual", icon: Users },
    ]
  },
  MANAGER: {
    title: "Panel del Gerente",
    links: [
      { href: "/manager", label: "Dashboard", icon: BarChart3 },
      { href: "/manager/inventory", label: "Inventario", icon: ShoppingCart },
      { href: "/manager/reports", label: "Reportes", icon: BarChart3 },
      { href: "/manager/members", label: "Socios", icon: Users },
    ]
  },
  SYS_ADMIN: {
    title: "Panel de Administrador",
    links: [
      { href: "/admin", label: "Dashboard", icon: BarChart3 },
      { href: "/admin/gyms", label: "Gimnasios", icon: Building },
      { href: "/admin/users", label: "Usuarios", icon: Users },
    ]
  }
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      router.push("/login");
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
    } catch (error) {
      console.error("Error parsing user data:", error);
      router.push("/login");
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const config = roleConfig[user.role as keyof typeof roleConfig];
  const userInitials = user.name?.split(' ').map(n => n[0]).join('') || user.email.slice(0, 2).toUpperCase();

  const Sidebar = ({ className = "" }: { className?: string }) => (
    <div className={`flex flex-col h-full bg-white border-r ${className}`}>
      <div className="p-6 border-b">
        <div className="flex items-center gap-2">
          <Dumbbell className="h-8 w-8 text-blue-600" />
          <span className="text-xl font-bold">GymCore</span>
        </div>
        <p className="text-sm text-muted-foreground mt-1">{config.title}</p>
      </div>
      
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {config.links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <link.icon className="h-5 w-5" />
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
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64">
              <Sidebar />
            </SheetContent>
          </Sheet>
          
          <div className="flex items-center gap-2">
            <Dumbbell className="h-6 w-6 text-blue-600" />
            <span className="font-bold">GymCore</span>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{userInitials}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Perfil</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Configuración</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
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
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{userInitials}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Perfil</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Configuración</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
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
