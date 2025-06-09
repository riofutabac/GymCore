"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Users, 
  DollarSign,
  Calendar,
  Download,
  Filter,
  Activity
} from "lucide-react";

interface ReportData {
  period: string;
  revenue: number;
  members: number;
  accessCount: number;
  salesCount: number;
  growth: number;
}

export default function ReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [reportData, setReportData] = useState<ReportData[]>([]);
  const [loading, setLoading] = useState(true);

  // Datos simulados para demostración
  useEffect(() => {
    loadReportData();
  }, [selectedPeriod]);

  const loadReportData = async () => {
    setLoading(true);
    
    // Simulamos datos de reportes
    const mockData: ReportData[] = [
      {
        period: "Enero 2024",
        revenue: 15420.50,
        members: 234,
        accessCount: 1850,
        salesCount: 156,
        growth: 12.5
      },
      {
        period: "Febrero 2024",
        revenue: 16890.75,
        members: 251,
        accessCount: 2100,
        salesCount: 178,
        growth: 9.5
      },
      {
        period: "Marzo 2024",
        revenue: 18250.00,
        members: 267,
        accessCount: 2350,
        salesCount: 195,
        growth: 8.1
      },
      {
        period: "Abril 2024",
        revenue: 17650.25,
        members: 259,
        accessCount: 2200,
        salesCount: 182,
        growth: -3.3
      }
    ];
    
    setTimeout(() => {
      setReportData(mockData);
      setLoading(false);
    }, 1000);
  };

  const currentPeriodData = reportData[reportData.length - 1];
  const previousPeriodData = reportData[reportData.length - 2];

  const calculateChange = (current: number, previous: number) => {
    if (!previous) return 0;
    return ((current - previous) / previous) * 100;
  };

  const exportReport = () => {
    // Aquí iría la lógica para exportar el reporte
    alert("Funcionalidad de exportación en desarrollo");
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Reportes y Analíticas</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
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
            Métricas de rendimiento y análisis de datos
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
      {currentPeriodData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${currentPeriodData.revenue.toLocaleString()}</div>
              {previousPeriodData && (
                <p className="text-xs text-muted-foreground">
                  <span className={calculateChange(currentPeriodData.revenue, previousPeriodData.revenue) >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {calculateChange(currentPeriodData.revenue, previousPeriodData.revenue) >= 0 ? '+' : ''}
                    {calculateChange(currentPeriodData.revenue, previousPeriodData.revenue).toFixed(1)}%
                  </span> vs período anterior
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Miembros Activos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{currentPeriodData.members}</div>
              {previousPeriodData && (
                <p className="text-xs text-muted-foreground">
                  <span className={calculateChange(currentPeriodData.members, previousPeriodData.members) >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {calculateChange(currentPeriodData.members, previousPeriodData.members) >= 0 ? '+' : ''}
                    {calculateChange(currentPeriodData.members, previousPeriodData.members).toFixed(1)}%
                  </span> vs período anterior
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Accesos Registrados</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{currentPeriodData.accessCount}</div>
              {previousPeriodData && (
                <p className="text-xs text-muted-foreground">
                  <span className={calculateChange(currentPeriodData.accessCount, previousPeriodData.accessCount) >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {calculateChange(currentPeriodData.accessCount, previousPeriodData.accessCount) >= 0 ? '+' : ''}
                    {calculateChange(currentPeriodData.accessCount, previousPeriodData.accessCount).toFixed(1)}%
                  </span> vs período anterior
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ventas Realizadas</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{currentPeriodData.salesCount}</div>
              {previousPeriodData && (
                <p className="text-xs text-muted-foreground">
                  <span className={calculateChange(currentPeriodData.salesCount, previousPeriodData.salesCount) >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {calculateChange(currentPeriodData.salesCount, previousPeriodData.salesCount) >= 0 ? '+' : ''}
                    {calculateChange(currentPeriodData.salesCount, previousPeriodData.salesCount).toFixed(1)}%
                  </span> vs período anterior
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Historical Data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Tendencia de Ingresos
            </CardTitle>
            <CardDescription>
              Evolución de los ingresos por período
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reportData.map((data, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{data.period}</p>
                    <p className="text-sm text-muted-foreground">
                      {data.members} miembros • {data.accessCount} accesos
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">${data.revenue.toLocaleString()}</p>
                    <div className="flex items-center gap-1">
                      {data.growth >= 0 ? (
                        <TrendingUp className="h-3 w-3 text-green-500" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-red-500" />
                      )}
                      <span className={`text-xs ${data.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {data.growth >= 0 ? '+' : ''}{data.growth}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Métricas de Actividad
            </CardTitle>
            <CardDescription>
              Resumen de actividad del gimnasio
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Tasa de ocupación promedio</span>
                  <span>68%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '68%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Retención de miembros</span>
                  <span>87%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '87%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Satisfacción del cliente</span>
                  <span>92%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full" style={{ width: '92%' }}></div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">4.8</p>
                <p className="text-sm text-muted-foreground">Rating promedio</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">156</p>
                <p className="text-sm text-muted-foreground">Nuevos miembros</p>
              </div>
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
            <Button variant="outline" className="h-20 flex-col">
              <Calendar className="h-6 w-6 mb-2" />
              <span>Reporte Mensual</span>
            </Button>
            
            <Button variant="outline" className="h-20 flex-col">
              <Users className="h-6 w-6 mb-2" />
              <span>Análisis de Miembros</span>
            </Button>
            
            <Button variant="outline" className="h-20 flex-col">
              <DollarSign className="h-6 w-6 mb-2" />
              <span>Reporte Financiero</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}