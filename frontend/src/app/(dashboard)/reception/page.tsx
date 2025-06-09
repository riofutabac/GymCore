"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  QrCode, 
  ShoppingCart, 
  Users, 
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle
} from "lucide-react";
import Link from "next/link";

export default function ReceptionDashboard() {
  const [todayStats, setTodayStats] = useState({
    accessValidations: 45,
    salesCount: 12,
    totalSales: 350.50,
    activeMemberships: 128
  });

  const [recentAccess, setRecentAccess] = useState([
    { id: 1, name: "Juan Pérez", time: "10:30", status: "granted" },
    { id: 2, name: "María García", time: "10:25", status: "granted" },
    { id: 3, name: "Carlos López", time: "10:20", status: "denied" },
    { id: 4, name: "Ana Rodríguez", time: "10:15", status: "granted" },
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Panel de Recepción</h1>
        <p className="text-muted-foreground">
          Gestiona el acceso y las ventas del gimnasio
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/reception/access-scan">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Escanear QR</CardTitle>
              <QrCode className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">Validar</div>
              <p className="text-xs text-muted-foreground">
                Verificar acceso de socios
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/reception/pos">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Punto de Venta</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">Vender</div>
              <p className="text-xs text-muted-foreground">
                Registrar ventas
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/reception/manual-entry">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ingreso Manual</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">Manual</div>
              <p className="text-xs text-muted-foreground">
                Registrar manualmente
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Validaciones Hoy</CardTitle>
            <QrCode className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayStats.accessValidations}</div>
            <p className="text-xs text-muted-foreground">
              +12% desde ayer
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ventas Hoy</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayStats.salesCount}</div>
            <p className="text-xs text-muted-foreground">
              ${todayStats.totalSales.toFixed(2)} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Hoy</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${todayStats.totalSales.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              +8% desde ayer
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Socios Activos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayStats.activeMemberships}</div>
            <p className="text-xs text-muted-foreground">
              Total registrados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Access */}
      <Card>
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
              <div key={access.id} className="flex items-center justify-between p-3 border rounded-lg">
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
