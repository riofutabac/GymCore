'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { QrCode, RefreshCw, Download, AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import { accessControlAPI } from '@/lib/api';
import { getStoredUser } from '@/lib/auth';

export default function QRGenerator() {
  const [qrCode, setQrCode] = useState<string>('');
  const [qrData, setQrData] = useState<string>('');
  const [expiresIn, setExpiresIn] = useState<number>(0);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  
  const { toast } = useToast();

  useEffect(() => {
    loadQRCode();
  }, []);

  const loadQRCode = async () => {
    const user = getStoredUser();
    if (!user) {
      setError('No estás autenticado');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await accessControlAPI.getMyQR();
      
      if (response.qrCode) {
        setQrCode(response.qrCode);
        setQrData(response.qrData || '');
        setExpiresIn(response.expiresIn || 30000);
        setUserInfo(response.user || null);
      } else {
        setError('No se pudo generar el código QR');
      }
    } catch (error: any) {
      console.error('Error loading QR code:', error);
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Error al cargar el código QR';
      setError(errorMessage);
      
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
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
    
    try {
      const link = document.createElement('a');
      link.href = qrCode;
      link.download = 'mi-qr-acceso.png';
      link.click();
      
      toast({
        title: 'QR descargado',
        description: 'El código QR se ha guardado en tu dispositivo',
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo descargar el código QR",
      });
    }
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
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Generando código QR...</p>
          </div>
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
                onError={() => setError('Error al cargar la imagen del código QR')}
              />
            </div>
            
            {userInfo && (
              <div className="text-center space-y-1">
                <p className="font-medium">{userInfo.name || 'Usuario'}</p>
                <p className="text-sm text-muted-foreground">{userInfo.email}</p>
                {userInfo.membershipStatus && (
                  <Badge variant="default">
                    {userInfo.membershipStatus}
                  </Badge>
                )}
              </div>
            )}
            
            <div className="flex gap-2">
              <Button 
                onClick={handleRefresh}
                disabled={refreshing}
                variant="outline"
                className="flex-1"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Renovando...' : 'Renovar'}
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
                Válido por {Math.floor(expiresIn / 1000)} segundos
              </Badge>
            </div>
          </>
        ) : (
          <div className="text-center text-muted-foreground py-8">
            <QrCode className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No se pudo cargar el código QR</p>
            <Button onClick={loadQRCode} variant="outline" className="mt-4">
              Reintentar
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}