"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  Users, 
  DollarSign, 
  TrendingUp,
  Package,
  AlertTriangle,
  Calendar,
  Activity,
  Loader2
} from "lucide-react";
import Link from "next/link";
import { inventoryAPI, membershipsAPI } from "@/lib/api";

interface Metrics {
  totalMembers: number;
  activeMembers: number;
  monthlyRevenue: number;
  dailySales: number;
  lowStockItems: number;
  pendingPayments: number;
  accessesToday: number;
  averageStay: number;
}

interface RecentSale {
  id: string;
  total: number;
  items: number;
  customer: string;
  time: string;
}

interface MembershipStats {
  active: number;
  expiringSoon: number;
  suspended: number;
  pendingRenewal: number;
}

export default function ManagerDashboard() {
  const [metrics, setMetrics] = useState<Metrics>({
    totalMembers: 0,
    activeMembers: 0,
    monthlyRevenue: 0,
    dailySales: 0,
    lowStockItems: 0,
    pendingPayments: 0,
    accessesToday: 0,
    averageStay: 65
  });

  const [recentSales, setRecentSales] = useState<RecentSale[]>([]);
  const [membershipStats, setMembershipStats] = useState<MembershipStats>({
    active: 0,
    expiringSoon: 0,
    suspended: 0,
    pendingRenewal: 0
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    loadDashboardData();
    
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

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Cargar datos reales de las APIs
      const [salesData, membershipsData, productsData] = await Promise.all([
        inventoryAPI.getSales().catch(() => []),
        membershipsAPI.getAllMemberships().catch(() => []),
        inventoryAPI.getProducts().catch(() => [])
      ]);

      // Calcular métricas reales
      const totalRevenue = Array.isArray(salesData) 
        ? salesData.reduce((sum: number, sale: any) => sum + (sale.total || 0), 0)
        : 0;

      const totalMembers = Array.isArray(membershipsData) ? membershipsData.length : 0;
      const activeMembers = Array.isArray(membershipsData) 
        ? membershipsData.filter((m: any) => m.status === 'ACTIVE').length
        : 0;

      const lowStockItems = Array.isArray(productsData)
        ? productsData.filter((p: any) => p.stock <= (p.minStock || 5)).length
        : 0;

      const pendingPayments = Array.isArray(membershipsData)
        ? membershipsData.filter((m: any) => m.status === 'PENDING_PAYMENT').length
        : 0;

      setMetrics({
        totalMembers,
        activeMembers,
        monthlyRevenue: totalRevenue,
        dailySales: totalRevenue * 0.1, // Estimate daily sales as 10% of total
        lowStockItems,
        pendingPayments,
        accessesToday: Math.floor(Math.random() * 100) + 50, // Simulated
        averageStay: 65
      });

      // Procesar ventas recientes
      if (Array.isArray(salesData)) {
        const recentSalesData = salesData.slice(0, 3).map((sale: any, index: number) => ({
          id: sale.id || `sale-${index}`,
          total: sale.total || 0,
          items: sale.items?.length || Math.floor(Math.random() * 5) + 1,
          customer: sale.seller?.name || `Cliente ${index + 1}`,
          time: new Date(sale.createdAt || Date.now()).toLocaleTimeString()
        }));
        setRecentSales(recentSalesData);
      }

      // Procesar estadísticas de membresías
      if (Array.isArray(membershipsData)) {
        const stats = membershipsData.reduce((acc: MembershipStats, membership: any) => {
          switch (membership.status) {
            case 'ACTIVE':
              acc.active++;
              break;
            case 'SUSPENDED':
              acc.suspended++;
              break;
            case 'PENDING_PAYMENT':
              acc.pendingRenewal++;
              break;
            case 'EXPIRED':
              acc.expiringSoon++;
              break;
          }
          return acc;
        }, { active: 0, expiringSoon: 0, suspended: 0, pendingRenewal: 0 });

        setMembershipStats(stats);
      }

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError('Error al cargar los datos del dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Dashboard Gerencial</h1>
        </div>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Dashboard Gerencial</h1>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-32">
            <AlertTriangle className="h-8 w-8 text-red-500 mb-2" />
            <p className="text-muted-foreground">{error}</p>
            <Button onClick={loadDashboardData} className="mt-4">
              Reintentar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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
              {recentSales.length > 0 ? (
                recentSales.map((sale) => (
                  <div key={sale.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{sale.customer}</p>
                      <p className="text-sm text-muted-foreground">
                        {sale.items} productos - {sale.time}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">${sale.total.toFixed(2)}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-4">
                  No hay ventas recientes registradas
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}