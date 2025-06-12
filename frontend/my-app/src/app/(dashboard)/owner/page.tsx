'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MetricCard } from '@/components/shared/MetricCard';
import { useGymStore } from '@/lib/store';
import api from '@/lib/api';
import { Building2, Users, DollarSign, BarChart3 } from 'lucide-react';

interface DashboardMetrics {
  totalGyms: number;
  totalUsers: number;
  totalRevenue: number;
  activeGyms: number;
}

export default function OwnerDashboard() {
  const { data: metrics, isLoading, error, refetch } = useQuery<DashboardMetrics>({
    queryKey: ['owner-dashboard'],
    queryFn: async () => {
      try {
        const data = await api.gyms.getDashboardMetrics();
        return data;
      } catch (err) {
        console.error('Error al cargar datos del dashboard:', err);
        throw new Error('No se pudieron cargar los datos del dashboard');
      }
    },
    initialData: {
      totalGyms: 0,
      totalUsers: 0,
      totalRevenue: 0,
      activeGyms: 0,
    },
  });

  return (
    <div className="container mx-auto py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard de Propietario</h1>
        <p className="text-muted-foreground">
          Bienvenido al panel de administración de GymCore
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4">
          {error.message}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total de Gimnasios"
          value={metrics.totalGyms}
          description="Gimnasios registrados"
          icon={<Building2 className="h-4 w-4 text-muted-foreground" />}
          loading={isLoading}
        />
        <MetricCard
          title="Gimnasios Activos"
          value={metrics.activeGyms}
          description="Gimnasios en operación"
          icon={<Building2 className="h-4 w-4 text-green-500" />}
          loading={isLoading}
        />
        <MetricCard
          title="Total de Usuarios"
          value={metrics.totalUsers}
          description="Usuarios registrados"
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
          loading={isLoading}
        />
        <MetricCard
          title="Ingresos Totales"
          value={`$${metrics.totalRevenue.toLocaleString()}`}
          description="Ingresos acumulados"
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
          loading={isLoading}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Rendimiento de Gimnasios</CardTitle>
            <CardDescription>Comparativa de ingresos por gimnasio</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80 flex items-center justify-center text-muted-foreground">
              {isLoading ? (
                <p>Cargando datos...</p>
              ) : (
                <p>Gráfico de rendimiento (implementación pendiente)</p>
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
            <CardDescription>Últimas acciones en la plataforma</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80 flex items-center justify-center text-muted-foreground">
              {isLoading ? (
                <p>Cargando datos...</p>
              ) : (
                <p>Lista de actividades recientes (implementación pendiente)</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
