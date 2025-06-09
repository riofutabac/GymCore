"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart3, 
  Users, 
  DollarSign, 
  TrendingUp,
  Package,
  AlertTriangle,
  Calendar,
  Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ManagerDashboard() {
  const [metrics, setMetrics] = useState({
    totalMembers: 234,
    activeMembers: 198,
    monthlyRevenue: 15420.50,
    dailySales: 850.00,
    lowStockItems: 5,
    pendingPayments: 12,
    accessesToday: 89,
    averageStay: 65 // minutes
  });

  const [recentSales, setRecentSales] = useState([
    { id: 1, total: 45.99, items: 2, customer: "Juan Pérez", time: "14:30" },
    { id: 2, total: 129.50, items: 5, customer: "María García", time: "13:45" },
    { id: 3, total: 25.00, items: 1, customer: "Carlos López", time: "12:20" },
  ]);

  const [membershipStats, setMembershipStats] = useState({
    active: 198,
    expiringSoon: 23,
    suspended: 8,
    pendingRenewal: 12
  });

  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        accessesToday: prev.accessesToday + Math.floor(Math.random() * 2),
        dailySales: prev.dailySales + (Math.random() * 50)
      }));
      setLastUpdate(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Gerencial</h1>
          <p className="text-muted-foreground">
            Resumen ejecutivo y métricas clave del gimnasio
          </p>
        </div>
        <div className="text-sm text-muted-foreground">
          Última actualización: {lastUpdate.toLocaleTimeString()}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos del Mes</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${metrics.monthlyRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12.5%</span> vs mes anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Socios Activos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activeMembers}</div>
            <p className="text-xs text-muted-foreground">
              de {metrics.totalMembers} socios totales
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ventas Hoy</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${metrics.dailySales.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+8.2%</span> vs ayer
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accesos Hoy</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.accessesToday}</div>
            <p className="text-xs text-muted-foreground">
              Promedio: {metrics.averageStay} min
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Membership Overview */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Estado de Membresías
            </CardTitle>
            <CardDescription>
              Distribución y estado actual de las membresías
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{membershipStats.active}</div>
                <p className="text-sm text-muted-foreground">Activas</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{membershipStats.expiringSoon}</div>
                <p className="text-sm text-muted-foreground">Por vencer</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{membershipStats.suspended}</div>
                <p className="text-sm text-muted-foreground">Suspendidas</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{membershipStats.pendingRenewal}</div>
                <p className="text-sm text-muted-foreground">Pendientes</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Tasa de retención</span>
                <span>87%</span>
              </div>
              <Progress value={87} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
            <CardDescription>
              Gestión diaria del gimnasio
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/manager/inventory">
              <Button variant="outline" className="w-full justify-start">
                <Package className="h-4 w-4 mr-2" />
                Gestionar Inventario
              </Button>
            </Link>
            
            <Link href="/manager/reports">
              <Button variant="outline" className="w-full justify-start">
                <BarChart3 className="h-4 w-4 mr-2" />
                Ver Reportes
              </Button>
            </Link>
            
            <Link href="/manager/members">
              <Button variant="outline" className="w-full justify-start">
                <Users className="h-4 w-4 mr-2" />
                Administrar Socios
              </Button>
            </Link>
            
            <Button variant="outline" className="w-full justify-start">
              <Calendar className="h-4 w-4 mr-2" />
              Programar Mantenimiento
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Alerts and Recent Sales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Alertas del Sistema
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 border border-yellow-200 rounded-lg bg-yellow-50">
              <div>
                <p className="font-medium text-yellow-800">Stock bajo</p>
                <p className="text-sm text-yellow-600">{metrics.lowStockItems} productos necesitan reposición</p>
              </div>
              <Badge variant="secondary">{metrics.lowStockItems}</Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 border border-blue-200 rounded-lg bg-blue-50">
              <div>
                <p className="font-medium text-blue-800">Pagos pendientes</p>
                <p className="text-sm text-blue-600">{metrics.pendingPayments} membresías por renovar</p>
              </div>
              <Badge variant="secondary">{metrics.pendingPayments}</Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 border border-green-200 rounded-lg bg-green-50">
              <div>
                <p className="font-medium text-green-800">Capacidad actual</p>
                <p className="text-sm text-green-600">68% de ocupación promedio</p>
              </div>
              <Badge variant="secondary">68%</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Recent Sales */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Ventas Recientes
            </CardTitle>
            <CardDescription>
              Últimas transacciones del día
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentSales.map((sale) => (
                <div key={sale.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{sale.customer}</p>
                    <p className="text-sm text-muted-foreground">
                      {sale.items} productos - {sale.time}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">${sale.total}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}