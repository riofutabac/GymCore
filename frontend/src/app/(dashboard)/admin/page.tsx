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
  Database
} from "lucide-react";
import Link from "next/link";

export default function AdminDashboard() {
  const [systemStats, setSystemStats] = useState({
    totalGyms: 12,
    activeGyms: 10,
    totalUsers: 2847,
    totalRevenue: 143520.75,
    monthlyGrowth: 15.8,
    systemHealth: 98.5,
    activeConnections: 156,
    storageUsed: 67.4
  });

  const [recentGyms] = useState([
    { id: 1, name: "FitZone Centro", members: 234, status: "active", revenue: 18420 },
    { id: 2, name: "PowerGym Norte", members: 189, status: "active", revenue: 15680 },
    { id: 3, name: "EliteTraining", members: 156, status: "maintenance", revenue: 12340 },
  ]);

  const [systemStatus, setSystemStatus] = useState("online");
  const [lastSystemCheck, setLastSystemCheck] = useState(new Date());

  useEffect(() => {
    // System health check simulation
    const healthCheck = setInterval(() => {
      setSystemStats(prev => ({
        ...prev,
        systemHealth: Math.max(95, prev.systemHealth + (Math.random() - 0.5) * 2),
        activeConnections: Math.max(100, prev.activeConnections + Math.floor((Math.random() - 0.5) * 20))
      }));
      setLastSystemCheck(new Date());
    }, 30000);

    return () => clearInterval(healthCheck);
  }, []);

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
              {recentGyms.map((gym) => (
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
              ))}
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
            <div className="flex items-center justify-between p-3 border border-blue-200 rounded-lg bg-blue-50">
              <div>
                <p className="font-medium text-blue-800">Actualización disponible</p>
                <p className="text-sm text-blue-600">GymCore v2.1.0 está disponible para instalación</p>
              </div>
              <Button variant="outline" size="sm">
                Ver detalles
              </Button>
            </div>
            
            <div className="flex items-center justify-between p-3 border border-green-200 rounded-lg bg-green-50">
              <div>
                <p className="font-medium text-green-800">Respaldo completado</p>
                <p className="text-sm text-green-600">Respaldo automático realizado exitosamente</p>
              </div>
              <span className="text-xs text-green-600">Hace 2 horas</span>
            </div>
            
            <div className="flex items-center justify-between p-3 border border-yellow-200 rounded-lg bg-yellow-50">
              <div>
                <p className="font-medium text-yellow-800">Mantenimiento programado</p>
                <p className="text-sm text-yellow-600">Mantenimiento del servidor programado para el domingo</p>
              </div>
              <Badge variant="secondary">Programado</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
