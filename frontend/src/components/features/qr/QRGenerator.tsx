
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { QrCode, RefreshCw, Download, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import { membersAPI } from '@/lib/api';
import { useUser } from '@/hooks/use-user';

export default function QRGenerator() {
  const [qrCode, setQrCode] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  
  const { user } = useUser();
  const { toast } = useToast();

  useEffect(() => {
    loadQRCode();
  }, []);

  const loadQRCode = async () => {
    if (!user?.gymId) {
      setError('No estás asociado a ningún gimnasio');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await membersAPI.getMyQR();
      if (response.data.qrCode) {
        setQrCode(response.data.qrCode);
      } else {
        setError('No se pudo generar el código QR');
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error al cargar el código QR');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadQRCode();
    setRefreshing(false);
    
    toast({
      title: 'QR actualizado',
      description: 'Tu código QR ha sido renovado',
    });
  };

  const handleDownload = () => {
    if (!qrCode) return;
    
    const link = document.createElement('a');
    link.href = qrCode;
    link.download = 'mi-qr-acceso.png';
    link.click();
    
    toast({
      title: 'QR descargado',
      description: 'El código QR se ha guardado en tu dispositivo',
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            Mi Código QR
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="h-5 w-5" />
          Mi Código QR
        </CardTitle>
        <CardDescription>
          Presenta este código para acceder al gimnasio
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : qrCode ? (
          <>
            <div className="flex justify-center">
              <img 
                src={qrCode} 
                alt="Código QR de acceso" 
                className="w-48 h-48 border rounded-lg"
              />
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={handleRefresh}
                disabled={refreshing}
                variant="outline"
                className="flex-1"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Renovar
              </Button>
              
              <Button 
                onClick={handleDownload}
                variant="outline"
                className="flex-1"
              >
                <Download className="h-4 w-4 mr-2" />
                Descargar
              </Button>
            </div>
            
            <div className="text-center">
              <Badge variant="outline">
                Válido por 24 horas
              </Badge>
            </div>
          </>
        ) : (
          <div className="text-center text-muted-foreground py-8">
            No se pudo cargar el código QR
          </div>
        )}
      </CardContent>
    </Card>
  );
}
