"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Users, 
  DollarSign,
  Calendar,
  Download,
  Filter,
  Activity,
  Loader2
} from "lucide-react";
import { inventoryApi, membershipApi } from "@/lib/api";

interface ReportData {
  totalRevenue: number;
  totalMembers: number;
  totalSales: number;
  totalProducts: number;
  recentSales: any[];
  recentMembers: any[];
}

export default function ReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadReportData();
  }, [selectedPeriod]);

  const loadReportData = async () => {
    try {
      setLoading(true);
      
      // Cargar datos reales de la API
      const [salesResponse, membersResponse, productsResponse] = await Promise.all([
        inventoryApi.getSales(),
        membershipApi.getAllMemberships(),
        inventoryApi.getProducts()
      ]);

      const sales = salesResponse.data || [];
      const members = membersResponse.data || [];
      const products = productsResponse.data || [];

      // Calcular métricas
      const totalRevenue = sales.reduce((sum: number, sale: any) => sum + sale.total, 0);
      const totalSales = sales.length;
      const totalMembers = members.length;
      const totalProducts = products.length;

      setReportData({
        totalRevenue,
        totalMembers,
        totalSales,
        totalProducts,
        recentSales: sales.slice(0, 5),
        recentMembers: members.slice(0, 5)
      });

    } catch (error: any) {
      console.error('Error loading report data:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar los datos del reporte",
      });
    } finally {
      setLoading(false);
    }
  };

  const exportReport = () => {
    if (!reportData) return;
    
    // Crear datos para exportar
    const reportContent = `
REPORTE GYMCORE - ${new Date().toLocaleDateString()}
=====================================

RESUMEN EJECUTIVO:
- Ingresos Totales: $${reportData.totalRevenue.toFixed(2)}
- Total de Socios: ${reportData.totalMembers}
- Ventas Realizadas: ${reportData.totalSales}
- Productos en Inventario: ${reportData.totalProducts}

VENTAS RECIENTES:
${reportData.recentSales.map((sale: any, index: number) => 
  `${index + 1}. $${sale.total} - ${new Date(sale.createdAt).toLocaleDateString()}`
).join('\n')}

SOCIOS RECIENTES:
${reportData.recentMembers.map((member: any, index: number) => 
  `${index + 1}. ${member.user?.name || 'Sin nombre'} - ${member.user?.email}`
).join('\n')}
    `;

    // Crear y descargar archivo
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte-gymcore-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast({
      title: "Reporte exportado",
      description: "El reporte se ha descargado correctamente",
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Reportes y Analíticas</h1>
        </div>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Reportes y Analíticas</h1>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-32">
            <p className="text-muted-foreground">No se pudieron cargar los datos del reporte</p>
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
          <h1 className="text-3xl font-bold tracking-tight">Reportes y Analíticas</h1>
          <p className="text-muted-foreground">
            Métricas de rendimiento y análisis de datos en tiempo real
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Seleccionar período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Última semana</SelectItem>
              <SelectItem value="month">Último mes</SelectItem>
              <SelectItem value="quarter">Último trimestre</SelectItem>
              <SelectItem value="year">Último año</SelectItem>
            </SelectContent>
          </Select>
          
          <Button onClick={exportReport}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${reportData.totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              De {reportData.totalSales} ventas realizadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Socios Registrados</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.totalMembers}</div>
            <p className="text-xs text-muted-foreground">
              Total de membresías
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ventas Realizadas</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.totalSales}</div>
            <p className="text-xs text-muted-foreground">
              Transacciones completadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Productos en Stock</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              Productos disponibles
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Data Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Ventas Recientes
            </CardTitle>
            <CardDescription>
              Últimas transacciones realizadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reportData.recentSales.length > 0 ? (
                reportData.recentSales.map((sale: any, index: number) => (
                  <div key={sale.id || index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">${sale.total.toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">
                        {sale.items?.length || 0} productos - {sale.seller?.name || 'Vendedor'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        {new Date(sale.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-4">
                  No hay ventas registradas
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Socios Recientes
            </CardTitle>
            <CardDescription>
              Últimas membresías registradas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reportData.recentMembers.length > 0 ? (
                reportData.recentMembers.map((member: any, index: number) => (
                  <div key={member.id || index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{member.user?.name || 'Sin nombre'}</p>
                      <p className="text-sm text-muted-foreground">
                        {member.user?.email}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant={member.status === 'ACTIVE' ? 'default' : 'secondary'}>
                        {member.status}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        ${member.monthlyPrice}/mes
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-4">
                  No hay socios registrados
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Acciones Rápidas
          </CardTitle>
          <CardDescription>
            Generar reportes específicos y análisis detallados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-20 flex-col" onClick={exportReport}>
              <Calendar className="h-6 w-6 mb-2" />
              <span>Exportar Reporte</span>
            </Button>
            
            <Button variant="outline" className="h-20 flex-col" onClick={loadReportData}>
              <Users className="h-6 w-6 mb-2" />
              <span>Actualizar Datos</span>
            </Button>
            
            <Button variant="outline" className="h-20 flex-col">
              <DollarSign className="h-6 w-6 mb-2" />
              <span>Análisis Financiero</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}