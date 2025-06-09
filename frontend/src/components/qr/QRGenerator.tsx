"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, RefreshCw, QrCode } from "lucide-react";
import { accessControlApi } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";

interface QRGeneratorProps {
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export default function QRGenerator({ 
  autoRefresh = true, 
  refreshInterval = 30000 
}: QRGeneratorProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchQRCode = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await accessControlApi.getMyQR();
      
      if (response.data.qrCode) {
        setQrCodeUrl(response.data.qrCode);
        setTimeLeft(30); // Reset countdown
        
        toast({
          title: "QR Actualizado",
          description: "Tu código QR ha sido generado correctamente",
        });
      } else {
        throw new Error("No se recibió el código QR");
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Error al generar código QR";
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

  // Auto-refresh QR code
  useEffect(() => {
    if (autoRefresh) {
      fetchQRCode(); // Initial load
      
      const interval = setInterval(() => {
        fetchQRCode();
      }, refreshInterval);

      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval]);

  // Countdown timer
  useEffect(() => {
    if (autoRefresh && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [timeLeft, autoRefresh]);

  const handleManualRefresh = () => {
    fetchQRCode();
  };

  if (loading && !qrCodeUrl) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            Código QR de Acceso
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin mb-2" />
          <p className="text-sm text-muted-foreground">Generando código QR...</p>
        </CardContent>
      </Card>
    );
  }

  if (error && !qrCodeUrl) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            Código QR de Acceso
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-64">
          <p className="text-sm text-red-500 mb-4 text-center">{error}</p>
          <Button onClick={handleManualRefresh} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Reintentar
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              Código QR de Acceso
            </CardTitle>
            <CardDescription>
              Muestra este código al personal para ingresar al gimnasio
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {autoRefresh && (
              <Badge variant="secondary">
                Renueva en {timeLeft}s
              </Badge>
            )}
            <Button
              onClick={handleManualRefresh}
              variant="outline"
              size="sm"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        {qrCodeUrl ? (
          <div className="relative">
            <Image
              src={qrCodeUrl}
              alt="Código QR de acceso al gimnasio"
              width={200}
              height={200}
              className="border rounded-lg"
              priority
            />
            {loading && (
              <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-lg">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            )}
          </div>
        ) : (
          <div className="w-[200px] h-[200px] border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
            <p className="text-sm text-muted-foreground text-center">
              No hay código QR disponible
            </p>
          </div>
        )}
        
        <div className="mt-4 text-center">
          <p className="text-sm text-muted-foreground">
            Este código es válido por 30 segundos
          </p>
          {autoRefresh && (
            <p className="text-xs text-muted-foreground mt-1">
              Se renovará automáticamente
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
