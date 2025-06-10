'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MetricCard } from '@/components/shared/MetricCard';
import { useGymStore } from '@/lib/store';
import api from '@/lib/api';
import { Users, DollarSign, Package, Calendar } from 'lucide-react';

interface GymMetrics {
  totalMembers: number;
  activeMembers: number;
  totalSales: number;
  monthlySales: number;
  totalProducts: number;
  lowStockProducts: number;
}

export default function ManagerDashboard() {
  const { currentGym } = useGymStore();
  const [metrics, setMetrics] = useState<GymMetrics>({
    totalMembers: 0,
    activeMembers: 0,
    totalSales: 0,
    monthlySales: 0,
    totalProducts: 0,
    lowStockProducts: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!currentGym?.id) {
        setError('No hay un gimnasio seleccionado');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        // Obtener métricas del dashboard para el manager
        const dashboardData = await api.manager.getDashboardMetrics(currentGym.id);
        setMetrics(dashboardData);
      } catch (err) {
        console.error('Error al cargar datos del dashboard:', err);
        setError('No se pudieron cargar los datos del dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [currentGym]);

  return (
    <div className="container mx-auto py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard de Gerente</h1>
        <p className="text-muted-foreground">
          {currentGym ? `Gimnasio: ${currentGym.name}` : 'Seleccione un gimnasio'}
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <MetricCard
          title="Miembros Activos"
          value={metrics.activeMembers}
          description="Membresías vigentes"
          icon={<Users className="h-4 w-4 text-green-500" />}
          loading={isLoading}
        />
        <MetricCard
          title="Total de Miembros"
          value={metrics.totalMembers}
          description="Miembros registrados"
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
          loading={isLoading}
        />
        <MetricCard
          title="Ventas del Mes"
          value={`$${metrics.monthlySales.toLocaleString()}`}
          description="Ingresos del mes actual"
          icon={<DollarSign className="h-4 w-4 text-green-500" />}
          loading={isLoading}
        />
        <MetricCard
          title="Ventas Totales"
          value={`$${metrics.totalSales.toLocaleString()}`}
          description="Ingresos acumulados"
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
          loading={isLoading}
        />
        <MetricCard
          title="Productos en Inventario"
          value={metrics.totalProducts}
          description="Productos registrados"
          icon={<Package className="h-4 w-4 text-muted-foreground" />}
          loading={isLoading}
        />
        <MetricCard
          title="Productos con Bajo Stock"
          value={metrics.lowStockProducts}
          description="Requieren reposición"
          icon={<Package className="h-4 w-4 text-red-500" />}
          loading={isLoading}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Ventas Recientes</CardTitle>
            <CardDescription>Últimas transacciones registradas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80 flex items-center justify-center text-muted-foreground">
              {isLoading ? (
                <p>Cargando datos...</p>
              ) : (
                <p>Lista de ventas recientes (implementación pendiente)</p>
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Membresías por Vencer</CardTitle>
            <CardDescription>Próximas a expirar en los siguientes 7 días</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80 flex items-center justify-center text-muted-foreground">
              {isLoading ? (
                <p>Cargando datos...</p>
              ) : (
                <p>Lista de membresías por vencer (implementación pendiente)</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}