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
      try {
        setIsLoading(true);
        setError(null);
        
        // Primero obtenemos el gimnasio del manager si no está disponible
        let gymId = currentGym?.id;
        
        if (!gymId) {
          // Intentamos obtener el gimnasio del manager desde la API
          try {
            const myGym = await api.manager.getMyGym();
            if (myGym && myGym.id) {
              gymId = myGym.id;
              // Actualizamos el store con el gimnasio obtenido
              useGymStore.getState().setCurrentGym(myGym);
            }
          } catch (gymError) {
            console.error('Error al obtener el gimnasio del manager:', gymError);
            setError('No se pudo obtener información del gimnasio');
            setIsLoading(false);
            return;
          }
        }
        
        if (!gymId) {
          setError('No hay un gimnasio asociado a tu cuenta de manager');
          setIsLoading(false);
          return;
        }
        
        // Obtener métricas del dashboard para el manager
        const dashboardData = await api.manager.getDashboardMetrics(gymId);
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
        {/* Ocultamos las métricas de ventas ya que no tenemos datos reales */}
        {/*
        <MetricCard
          title="Ventas del Mes"
          value={metrics.monthlySales > 0 ? `$${metrics.monthlySales.toLocaleString()}` : 'No disponible'}
          description="Ingresos del mes actual"
          icon={<DollarSign className="h-4 w-4 text-green-500" />}
          loading={isLoading}
        />
        <MetricCard
          title="Ventas Totales"
          value={metrics.totalSales > 0 ? `$${metrics.totalSales.toLocaleString()}` : 'No disponible'}
          description="Ingresos acumulados"
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
          loading={isLoading}
        />
        */}
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
        {/* Mensaje informativo sobre métricas de ventas */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Métricas de Ventas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-24 text-muted-foreground">
              <p>Las métricas de ventas estarán disponibles próximamente</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Ventas Recientes</CardTitle>
            <CardDescription>Últimas transacciones registradas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80 flex flex-col items-center justify-center text-muted-foreground">
              {isLoading ? (
                <p>Cargando datos...</p>
              ) : (
                <>
                  <p className="mb-2">No hay datos de ventas disponibles</p>
                  <p className="text-sm text-center">El módulo de ventas está en desarrollo y estará disponible próximamente</p>
                </>
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
            <div className="h-80 flex flex-col items-center justify-center text-muted-foreground">
              {isLoading ? (
                <p>Cargando datos...</p>
              ) : metrics.totalMembers > 0 ? (
                <>
                  <p className="mb-2">No hay membresías próximas a vencer</p>
                  <p className="text-sm text-center">Cuando haya membresías por vencer en los próximos 7 días, aparecerán aquí</p>
                </>
              ) : (
                <>
                  <p className="mb-2">No hay miembros registrados</p>
                  <p className="text-sm text-center">Registra miembros en tu gimnasio para ver información sobre sus membresías</p>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}