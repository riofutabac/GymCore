"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Calendar, 
  CreditCard, 
  Clock, 
  AlertTriangle, 
  CheckCircle,
  QrCode,
  User
} from "lucide-react";
import { membershipApi, gymApi } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import QRGenerator from "@/components/QRGenerator";
import Link from "next/link";

interface Membership {
  id: string;
  type: string;
  status: string;
  startDate: string;
  expiresAt: string;
  lastPayment: string;
  monthlyPrice: number;
  totalPaid: number;
  autoRenewal: boolean;
  payments?: Payment[];
}

interface Payment {
  id: string;
  amount: number;
  method: string;
  status: string;
  createdAt: string;
  description?: string;
}

interface Gym {
  id: string;
  name: string;
  address: string;
  phone?: string;
  email?: string;
}

export default function MemberDashboard() {
  const [membership, setMembership] = useState<Membership | null>(null);
  const [gym, setGym] = useState<Gym | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadMembershipData();
    loadGymData();
  }, []);

  const loadMembershipData = async () => {
    try {
      const response = await membershipApi.getMy();
      setMembership(response.data);
    } catch (err: any) {
      if (err.response?.status === 404) {
        setError("No tienes una membresía activa");
      } else {
        setError("Error al cargar información de membresía");
      }
    }
  };

  const loadGymData = async () => {
    try {
      const response = await gymApi.getMyGym();
      setGym(response.data);
    } catch (err: any) {
      console.error("Error loading gym data:", err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-500';
      case 'EXPIRED': return 'bg-red-500';
      case 'PENDING_PAYMENT': return 'bg-yellow-500';
      case 'SUSPENDED': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'Activa';
      case 'EXPIRED': return 'Expirada';
      case 'PENDING_PAYMENT': return 'Pago Pendiente';
      case 'SUSPENDED': return 'Suspendida';
      default: return status;
    }
  };

  const getDaysRemaining = (expiresAt: string) => {
    const today = new Date();
    const expiry = new Date(expiresAt);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
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
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mi Dashboard</h1>
        <p className="text-muted-foreground">
          Estado de tu membresía y acceso al gimnasio
        </p>
      </div>

      {/* Información del Gimnasio */}
      {gym && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Mi Gimnasio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">{gym.name}</h3>
              <p className="text-muted-foreground">{gym.address}</p>
              {gym.phone && (
                <p className="text-sm">📞 {gym.phone}</p>
              )}
              {gym.email && (
                <p className="text-sm">✉️ {gym.email}</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error state */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Membership Info */}
      {membership && (
        <>
          {/* Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Estado</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  <Badge className={getStatusColor(membership.status)}>
                    {getStatusText(membership.status)}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Días Restantes</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {getDaysRemaining(membership.expiresAt)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Vence el {new Date(membership.expiresAt).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Precio Mensual</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${membership.monthlyPrice?.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Total pagado: ${membership.totalPaid.toFixed(2)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Último Pago</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-sm font-bold">
                  {membership.lastPayment 
                    ? new Date(membership.lastPayment).toLocaleDateString()
                    : "Sin pagos"
                  }
                </div>
                <p className="text-xs text-muted-foreground">
                  Renovación {membership.autoRenewal ? "automática" : "manual"}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Progress Bar */}
          {membership.status === 'ACTIVE' && (
            <Card>
              <CardHeader>
                <CardTitle>Progreso de Membresía</CardTitle>
                <CardDescription>
                  Tiempo transcurrido en tu período actual
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Inicio: {new Date(membership.startDate).toLocaleDateString()}</span>
                    <span>Vence: {new Date(membership.expiresAt).toLocaleDateString()}</span>
                  </div>
                  <Progress value={75} className="w-full" />
                  <p className="text-xs text-muted-foreground text-center">
                    Te quedan {getDaysRemaining(membership.expiresAt)} días
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* QR Code Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <QRGenerator />
        
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
            <CardDescription>
              Gestiona tu membresía y perfil
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href="/member/qr-code">
              <Button className="w-full" variant="outline">
                <QrCode className="h-4 w-4 mr-2" />
                Ver Código QR Completo
              </Button>
            </Link>
            
            <Link href="/member/profile">
              <Button className="w-full" variant="outline">
                <User className="h-4 w-4 mr-2" />
                Editar Perfil
              </Button>
            </Link>

            {membership?.status === 'PENDING_PAYMENT' && (
              <Button className="w-full">
                <CreditCard className="h-4 w-4 mr-2" />
                Renovar Membresía
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Payments */}
      {membership?.payments && membership.payments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Últimos Pagos</CardTitle>
            <CardDescription>
              Historial de tus pagos recientes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {membership.payments.slice(0, 5).map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">${payment.amount.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">
                      {payment.description || payment.method}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant={payment.status === 'COMPLETED' ? 'default' : 'secondary'}>
                      {payment.status}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(payment.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
