'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useGymStore } from '@/lib/store';
import api from '@/lib/api';
import { CalendarClock, CreditCard, QrCode, History } from 'lucide-react';
import Image from 'next/image';

interface MembershipInfo {
  id: string;
  type: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  daysLeft: number;
  gym: {
    id: string;
    name: string;
  };
}

export default function ClientDashboard() {
  const { user } = useCurrentUser();
  const { currentGym } = useGymStore();
  const [membership, setMembership] = useState<MembershipInfo | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMembershipData = async () => {
      if (!user?.id) return;

      try {
        setIsLoading(true);
        setError(null);
        
        // Obtener información de la membresía del cliente
        const membershipData = await api.members.getMyMembership();
        setMembership(membershipData);
        
        // Obtener código QR para acceso
        const qrData = await api.members.getMyQR();
        setQrCode(qrData.qrCode);
      } catch (err) {
        console.error('Error al cargar datos de membresía:', err);
        setError('No se pudieron cargar los datos de tu membresía');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMembershipData();
  }, [user]);

  const getMembershipStatusClass = () => {
    if (!membership) return 'bg-gray-100 text-gray-800';
    if (!membership.isActive) return 'bg-red-100 text-red-800';
    if (membership.daysLeft <= 3) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const getMembershipStatusText = () => {
    if (!membership) return 'Sin membresía';
    if (!membership.isActive) return 'Membresía vencida';
    if (membership.daysLeft === 0) return 'Vence hoy';
    if (membership.daysLeft === 1) return 'Vence mañana';
    return `Vence en ${membership.daysLeft} días`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="container mx-auto py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mi Membresía</h1>
        <p className="text-muted-foreground">
          Bienvenido, {user?.name || 'Usuario'}
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tarjeta de membresía */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Información de Membresía
            </CardTitle>
            <CardDescription>
              Detalles de tu membresía actual
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="h-40 flex items-center justify-center">
                <p>Cargando información...</p>
              </div>
            ) : membership ? (
              <>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-muted-foreground">Gimnasio</p>
                    <p className="font-medium">{membership.gym.name}</p>
                  </div>
                  <div>
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${getMembershipStatusClass()}`}>
                      {getMembershipStatusText()}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Tipo de Membresía</p>
                    <p className="font-medium">{membership.type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Estado</p>
                    <p className="font-medium">{membership.isActive ? 'Activa' : 'Inactiva'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Fecha de Inicio</p>
                    <p className="font-medium">{formatDate(membership.startDate)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Fecha de Vencimiento</p>
                    <p className="font-medium">{formatDate(membership.endDate)}</p>
                  </div>
                </div>
              </>
            ) : (
              <div className="h-40 flex flex-col items-center justify-center gap-4">
                <p>No tienes una membresía activa</p>
                <Button>Adquirir Membresía</Button>
              </div>
            )}
          </CardContent>
          {membership && membership.isActive && (
            <CardFooter className="flex justify-end">
              <Button variant="outline">Ver Historial de Pagos</Button>
            </CardFooter>
          )}
        </Card>

        {/* Tarjeta de QR */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              Código QR de Acceso
            </CardTitle>
            <CardDescription>
              Muestra este código en recepción para ingresar al gimnasio
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center">
            {isLoading ? (
              <div className="h-40 flex items-center justify-center">
                <p>Generando código QR...</p>
              </div>
            ) : qrCode ? (
              <div className="p-4 bg-white rounded-lg">
                <Image 
                  src={qrCode} 
                  alt="Código QR de acceso" 
                  width={200} 
                  height={200} 
                />
              </div>
            ) : (
              <div className="h-40 flex items-center justify-center">
                <p className="text-red-500">No se pudo generar el código QR</p>
              </div>
            )}
          </CardContent>
          {qrCode && (
            <CardFooter className="flex justify-center">
              <p className="text-sm text-muted-foreground">
                Válido solo si tu membresía está activa
              </p>
            </CardFooter>
          )}
        </Card>
      </div>

      {/* Historial de accesos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Historial de Accesos
          </CardTitle>
          <CardDescription>
            Registro de tus últimas visitas al gimnasio
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-60 flex items-center justify-center text-muted-foreground">
            {isLoading ? (
              <p>Cargando historial...</p>
            ) : (
              <p>Historial de accesos (implementación pendiente)</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}