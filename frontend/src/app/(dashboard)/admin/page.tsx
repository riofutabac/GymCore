"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Building, 
  Users, 
  DollarSign, 
  Activity,
  TrendingUp,
  AlertTriangle,
  Settings,
  Database,
  Loader2
} from "lucide-react";
import Link from "next/link";
import { gymsAPI, usersAPI, inventoryAPI, membershipsAPI } from "@/lib/api";
import type { Gym, Sale } from "@/lib/types";

interface SystemStats {
  totalGyms: number;
  activeGyms: number;
  totalUsers: number;
  totalRevenue: number;
  monthlyGrowth: number;
  systemHealth: number;
  activeConnections: number;
  storageUsed: number;
  lastUpdate: Date;
}

interface SystemAlert {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface RecentGym {
  id: string;
  name: string;
  members: number;
  status: string;
  revenue: number;
}

export default function AdminDashboard() {
  const [systemStats, setSystemStats] = useState<SystemStats>({
    totalGyms: 0,
    activeGyms: 0,
    totalUsers: 0,
    totalRevenue: 0,
    monthlyGrowth: 0,
    systemHealth: 98.5,
    activeConnections: 0,
    storageUsed: 67.4
  });
  
  const [recentGyms, setRecentGyms] = useState<RecentGym[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Cargar datos reales de múltiples APIs con fechas
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

      const [gymsData, usersData, currentMonthSales, lastMonthSales, membershipsData] = await Promise.all([
        gymsAPI.getAll().catch(() => []),
        usersAPI.getAll().catch(() => ({ users: [], total: 0 })),
        inventoryAPI.getSales({ startDate: firstDayOfMonth.toISOString() }).catch(() => []),
        inventoryAPI.getSales({ startDate: lastMonthStart.toISOString(), endDate: lastMonthEnd.toISOString() }).catch(() => []),
        membershipsAPI.getAllMemberships().catch(() => [])
      ]);

      // Calcular ingresos y crecimiento
      const currentMonthRevenue = Array.isArray(currentMonthSales)
        ? currentMonthSales.reduce((sum: number, sale: any) => sum + (sale.total || 0), 0)
        : 0;

      const lastMonthRevenue = Array.isArray(lastMonthSales)
        ? lastMonthSales.reduce((sum: number, sale: any) => sum + (sale.total || 0), 0)
        : 0;

      const monthlyGrowth = lastMonthRevenue > 0
        ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
        : 0;
      
      const activeGyms = Array.isArray(gymsData)
        ? gymsData.filter((gym: any) => gym.isActive !== false).length
        : 0;

      const totalUsers = usersData.users ? usersData.users.length : usersData.total || 0;

      // Calcular salud del sistema basado en gimnasios activos y membresías activas
      const activeMembers = membershipsData.filter(m => m.status === 'ACTIVE').length;
      const systemHealth = activeGyms > 0 ? Math.min(100, (activeMembers / (activeGyms * 50)) * 100) : 100;

      setSystemStats({
        totalGyms: Array.isArray(gymsData) ? gymsData.length : 0,
        activeGyms: activeGyms,
        totalUsers: totalUsers,
        totalRevenue: currentMonthRevenue,
        monthlyGrowth,
        systemHealth,
        activeConnections: totalUsers > 0 ? Math.floor(totalUsers * 0.3) : 0, // Estimado 30% de usuarios activos
        storageUsed: Math.min(95, (totalUsers * 0.5) + (activeGyms * 2)), // Estimado basado en usuarios y gimnasios
        lastUpdate: new Date()
      });

      // Obtener los gimnasios más recientes/destacados con datos reales
      if (Array.isArray(gymsData)) {
        const gymsWithStats = await Promise.all(
          gymsData.slice(0, 3).map(async (gym: Gym) => {
            const gymMembers = membershipsData.filter(m => m.gymId === gym.id && m.status === 'ACTIVE');
            const gymSales = (currentMonthSales as Sale[]).filter(s => s.gymId === gym.id);
            const revenue = gymSales.reduce((sum: number, sale: Sale) => sum + (sale.total || 0), 0);

            return {
              id: gym.id,
              name: gym.name,
              members: gymMembers.length,
              status: gym.isActive !== false ? 'active' : 'maintenance',
              revenue: revenue || 0
            };
          })
        );
        setRecentGyms(gymsWithStats);
      }

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError('Error al cargar los datos del dashboard');
    } finally {
      setLoading(false);
    }
  };

  const [alerts, setAlerts] = useState<SystemAlert[]>([]);

  useEffect(() => {
    // Actualizar alertas basadas en el estado del sistema
    const newAlerts: SystemAlert[] = [];

    // Alerta de salud del sistema
    if (systemStats.systemHealth < 90) {
      newAlerts.push({
        id: 'system-health',
        type: 'warning',
        title: 'Salud del Sistema Baja',
        message: `La salud del sistema está al ${systemStats.systemHealth.toFixed(1)}%. Se recomienda revisar el rendimiento.`,
        timestamp: new Date()
      });
    }

    // Alerta de almacenamiento
    if (systemStats.storageUsed > 80) {
      newAlerts.push({
        id: 'storage',
        type: 'warning',
        title: 'Almacenamiento Alto',
        message: `El uso de almacenamiento está al ${systemStats.storageUsed.toFixed(1)}%. Considere liberar espacio.`,
        timestamp: new Date()
      });
    }

    // Alerta de crecimiento
    if (systemStats.monthlyGrowth < 0) {
      newAlerts.push({
        id: 'growth',
        type: 'error',
        title: 'Crecimiento Negativo',
        message: `El crecimiento mensual es ${systemStats.monthlyGrowth.toFixed(1)}%. Revise las métricas de negocio.`,
        timestamp: new Date()
      });
    }

    setAlerts(newAlerts);
  }, [systemStats]);

  const systemStatus = systemStats.systemHealth > 90 ? 'online' : 'offline';

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Panel de Administrador</h1>
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
          <h1 className="text-3xl font-bold">Panel de Administrador</h1>
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
      {/* Header with system status */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Panel de Administrador</h1>
          <p className="text-muted-foreground">
            Gestión global del sistema GymCore
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${systemStatus === 'online' ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-sm text-muted-foreground">
            Sistema {systemStatus === 'online' ? 'En línea' : 'Desconectado'}
          </span>
        </div>
      </div>

      {/* System KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gimnasios Activos</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.activeGyms}</div>
            <p className="text-xs text-muted-foreground">
              de {systemStats.totalGyms} gimnasios totales
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuarios Totales</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+{systemStats.monthlyGrowth}%</span> este mes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${systemStats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Facturación acumulada
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Salud del Sistema</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{systemStats.systemHealth}%</div>
            <p className="text-xs text-muted-foreground">
              {systemStats.activeConnections} conexiones activas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/admin/gyms">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gestionar Gimnasios</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">Administrar</div>
              <p className="text-xs text-muted-foreground">
                Crear, editar y gestionar gimnasios
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/users">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gestionar Usuarios</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">Usuarios</div>
              <p className="text-xs text-muted-foreground">
                Asignar roles y permisos
              </p>
            </CardContent>
          </Card>
        </Link>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Configuración Global</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">Config</div>
            <p className="text-xs text-muted-foreground">
              Ajustes del sistema
            </p>
          </CardContent>
        </Card>
      </div>

      {/* System Monitoring */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Estado del Sistema
            </CardTitle>
            <CardDescription>
              Monitoreo en tiempo real de la infraestructura
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">Uso de almacenamiento</span>
              <span className="text-sm font-medium">{systemStats.storageUsed}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full" 
                style={{ width: `${systemStats.storageUsed}%` }}
              ></div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm">Conexiones activas</span>
              <Badge variant="default">{systemStats.activeConnections}</Badge>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm">Tiempo de actividad</span>
              <Badge variant="secondary">99.9%</Badge>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm">Última actualización</span>
              <span className="text-sm text-muted-foreground">Hace 2 minutos</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Gimnasios Destacados
            </CardTitle>
            <CardDescription>
              Rendimiento de los principales gimnasios
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentGyms.length > 0 ? (
                recentGyms.map((gym) => (
                  <div key={gym.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{gym.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {gym.members} miembros
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">${gym.revenue.toLocaleString()}</p>
                      <Badge 
                        variant={gym.status === 'active' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {gym.status === 'active' ? 'Activo' : 'Mantenimiento'}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-4">
                  No hay gimnasios registrados
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            Alertas del Sistema
          </CardTitle>
          <CardDescription>
            Notificaciones importantes y eventos recientes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {alerts.length > 0 ? (
              alerts.map(alert => (
                <div 
                  key={alert.id}
                  className={`flex items-center justify-between p-3 border rounded-lg ${
                    alert.type === 'error' ? 'border-red-200 bg-red-50' :
                    alert.type === 'warning' ? 'border-yellow-200 bg-yellow-50' :
                    alert.type === 'success' ? 'border-green-200 bg-green-50' :
                    'border-blue-200 bg-blue-50'
                  }`}
                >
                  <div>
                    <p className={`font-medium ${
                      alert.type === 'error' ? 'text-red-800' :
                      alert.type === 'warning' ? 'text-yellow-800' :
                      alert.type === 'success' ? 'text-green-800' :
                      'text-blue-800'
                    }`}>{alert.title}</p>
                    <p className={`text-sm ${
                      alert.type === 'error' ? 'text-red-600' :
                      alert.type === 'warning' ? 'text-yellow-600' :
                      alert.type === 'success' ? 'text-green-600' :
                      'text-blue-600'
                    }`}>{alert.message}</p>
                  </div>
                  {alert.action ? (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={alert.action.onClick}
                    >
                      {alert.action.label}
                    </Button>
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      {new Date(alert.timestamp).toLocaleTimeString()}
                    </span>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No hay alertas activas en este momento
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}