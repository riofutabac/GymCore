"use client";

import { useState, useEffect, memo, useMemo } from "react";
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
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";
import dynamic from "next/dynamic";

// Lazy loading del componente QR
const QRGenerator = dynamic(() => import("@/components/QRGenerator"), {
  loading: () => <div className="h-48 bg-gray-200 rounded-lg skeleton"></div>,
  ssr: false
});

// Componente memoizado para las tarjetas de métricas
const MetricCard = memo(({ title, value, description, icon: Icon, color = "" }: {
  title: string;
  value: string | number;
  description: string;
  icon: any;
  color?: string;
}) => (
  <Card className="animate-fade-in hover-scale">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className={`text-2xl font-bold ${color}`}>
        {typeof value === 'string' ? value : (
          typeof value === 'number' && title.includes('Precio') ? `$${value.toFixed(2)}` : value
        )}
      </div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
));
MetricCard.displayName = 'MetricCard';

export default function MemberDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Datos optimizados con useMemo
  const membershipData = useMemo(() => ({
    id: "demo-1",
    type: "PREMIUM",
    status: "ACTIVE",
    startDate: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    lastPayment: new Date().toISOString(),
    monthlyPrice: 50.00,
    totalPaid: 150.00,
    autoRenewal: true
  }), []);

  const gymData = useMemo(() => ({
    id: "demo-gym",
    name: "GymCore Demo",
    address: "Calle Principal 123, Ciudad",
    phone: "+1 234 567 8900",
    email: "info@gymcore.demo"
  }), []);

  // Funciones optimizadas
  const getStatusColor = (status: string) => {
    const colors = {
      'ACTIVE': 'bg-green-500',
      'EXPIRED': 'bg-red-500',
      'PENDING_PAYMENT': 'bg-yellow-500',
      'SUSPENDED': 'bg-gray-500'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-500';
  };

  const getStatusText = (status: string) => {
    const texts = {
      'ACTIVE': 'Activa',
      'EXPIRED': 'Expirada',
      'PENDING_PAYMENT': 'Pago Pendiente',
      'SUSPENDED': 'Suspendida'
    };
    return texts[status as keyof typeof texts] || status;
  };

  const getDaysRemaining = (expiresAt: string) => {
    const today = new Date();
    const expiry = new Date(expiresAt);
    const diffTime = expiry.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  useEffect(() => {
    // Simular carga rápida
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="skeleton h-8 w-64 rounded"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton h-32 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  const daysRemaining = getDaysRemaining(membershipData.expiresAt);

  return (
    <div className="space-y-6">
      {/* Header optimizado */}
      <div className="animate-fade-in">
        <h1 className="text-3xl font-bold tracking-tight">Mi Dashboard</h1>
        <p className="text-muted-foreground">
          Estado de tu membresía y acceso al gimnasio
        </p>
      </div>

      {/* Información del Gimnasio */}
      <Card className="animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Mi Gimnasio
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">{gymData.name}</h3>
            <p className="text-muted-foreground">{gymData.address}</p>
            <p className="text-sm">📞 {gymData.phone}</p>
            <p className="text-sm">✉️ {gymData.email}</p>
          </div>
        </CardContent>
      </Card>

      {/* Status Cards optimizadas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Estado"
          value={<Badge className={getStatusColor(membershipData.status)}>{getStatusText(membershipData.status)}</Badge>}
          description="Estado de membresía"
          icon={CheckCircle}
        />
        <MetricCard
          title="Días Restantes"
          value={daysRemaining}
          description={`Vence el ${new Date(membershipData.expiresAt).toLocaleDateString()}`}
          icon={Calendar}
        />
        <MetricCard
          title="Precio Mensual"
          value={membershipData.monthlyPrice}
          description={`Total pagado: $${membershipData.totalPaid.toFixed(2)}`}
          icon={CreditCard}
        />
        <MetricCard
          title="Último Pago"
          value={new Date(membershipData.lastPayment).toLocaleDateString()}
          description={`Renovación ${membershipData.autoRenewal ? "automática" : "manual"}`}
          icon={Clock}
        />
      </div>

      {/* Progress Bar optimizada */}
      <Card className="animate-fade-in">
        <CardHeader>
          <CardTitle>Progreso de Membresía</CardTitle>
          <CardDescription>
            Tiempo transcurrido en tu período actual
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Inicio: {new Date(membershipData.startDate).toLocaleDateString()}</span>
              <span>Vence: {new Date(membershipData.expiresAt).toLocaleDateString()}</span>
            </div>
            <Progress value={75} className="w-full h-2" />
            <p className="text-xs text-muted-foreground text-center">
              Te quedan {daysRemaining} días
            </p>
          </div>
        </CardContent>
      </Card>

      {/* QR Code Section con lazy loading */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <QRGenerator />
        
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
            <CardDescription>
              Gestiona tu membresía y perfil
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href="/member/qr-code">
              <Button className="w-full hover-scale" variant="outline">
                <QrCode className="h-4 w-4 mr-2" />
                Ver Código QR Completo
              </Button>
            </Link>
            
            <Link href="/member/profile">
              <Button className="w-full hover-scale" variant="outline">
                <User className="h-4 w-4 mr-2" />
                Editar Perfil
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
