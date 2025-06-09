"use client";

import { useState, useEffect, useCallback, memo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { 
  QrCode, 
  ShoppingCart, 
  Users, 
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle
} from "lucide-react";

// Componente memoizado para las tarjetas de acción rápida
const QuickActionCard = memo(({ href, icon: Icon, title, description, color }: {
  href: string;
  icon: any;
  title: string;
  description: string;
  color: string;
}) => (
  <Link href={href}>
    <Card className="cursor-pointer hover-scale transition-all duration-200 hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${color}`}>{description.split(' ')[0]}</div>
        <p className="text-xs text-muted-foreground">
          {description.split(' ').slice(1).join(' ')}
        </p>
      </CardContent>
    </Card>
  </Link>
));
QuickActionCard.displayName = 'QuickActionCard';

// Componente memoizado para las estadísticas
const StatCard = memo(({ title, value, description, icon: Icon }: {
  title: string;
  value: string | number;
  description: string;
  icon: any;
}) => (
  <Card className="animate-fade-in">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
));
StatCard.displayName = 'StatCard';

export default function ReceptionDashboard() {
  const [todayStats, setTodayStats] = useState({
    accessValidations: 45,
    salesCount: 12,
    totalSales: 350.50,
    activeMemberships: 128
  });

  const [recentAccess] = useState([
    { id: 1, name: "Juan Pérez", time: "10:30", status: "granted" },
    { id: 2, name: "María García", time: "10:25", status: "granted" },
    { id: 3, name: "Carlos López", time: "10:20", status: "denied" },
    { id: 4, name: "Ana Rodríguez", time: "10:15", status: "granted" },
  ]);

  // Optimización: useCallback para evitar recrear funciones
  const updateStats = useCallback(() => {
    setTodayStats(prev => ({
      ...prev,
      accessValidations: prev.accessValidations + Math.floor(Math.random() * 3)
    }));
  }, []);

  useEffect(() => {
    const interval = setInterval(updateStats, 30000);
    return () => clearInterval(interval);
  }, [updateStats]);

  return (
    <div className="space-y-6">
      {/* Header optimizado */}
      <div className="animate-fade-in">
        <h1 className="text-3xl font-bold tracking-tight">Panel de Recepción</h1>
        <p className="text-muted-foreground">
          Gestiona el acceso y las ventas del gimnasio
        </p>
      </div>

      {/* Quick Actions con componentes memoizados */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in">
        <QuickActionCard
          href="/reception/access-scan"
          icon={QrCode}
          title="Escanear QR"
          description="Validar acceso de socios"
          color="text-blue-600"
        />
        <QuickActionCard
          href="/reception/pos"
          icon={ShoppingCart}
          title="Punto de Venta"
          description="Vender productos"
          color="text-green-600"
        />
        <QuickActionCard
          href="/reception/manual-entry"
          icon={Users}
          title="Ingreso Manual"
          description="Manual registro"
          color="text-orange-600"
        />
      </div>

      {/* Stats Cards optimizadas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Validaciones Hoy"
          value={todayStats.accessValidations}
          description="+12% desde ayer"
          icon={QrCode}
        />
        <StatCard
          title="Ventas Hoy"
          value={todayStats.salesCount}
          description={`$${todayStats.totalSales.toFixed(2)} total`}
          icon={ShoppingCart}
        />
        <StatCard
          title="Ingresos Hoy"
          value={`$${todayStats.totalSales.toFixed(2)}`}
          description="+8% desde ayer"
          icon={TrendingUp}
        />
        <StatCard
          title="Socios Activos"
          value={todayStats.activeMemberships}
          description="Total registrados"
          icon={Users}
        />
      </div>

      {/* Recent Access optimizado */}
      <Card className="animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Accesos Recientes
          </CardTitle>
          <CardDescription>
            Últimas validaciones de códigos QR
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentAccess.map((access) => (
              <div key={access.id} className="flex items-center justify-between p-3 border rounded-lg hover-scale">
                <div className="flex items-center gap-3">
                  {access.status === 'granted' ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  <div>
                    <p className="font-medium">{access.name}</p>
                    <p className="text-sm text-muted-foreground">{access.time}</p>
                  </div>
                </div>
                <Badge variant={access.status === 'granted' ? 'default' : 'destructive'}>
                  {access.status === 'granted' ? 'Concedido' : 'Denegado'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
