"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { 
  QrCode, 
  Scan, 
  User, 
  CheckCircle, 
  XCircle, 
  Clock,
  AlertTriangle
} from "lucide-react";
import { accessControlApi } from "@/lib/api";

interface ValidationResult {
  access: 'GRANTED' | 'DENIED';
  reason?: string;
  user: {
    name?: string;
    email: string;
    membershipStatus?: string;
    expiresAt?: string;
  };
}

export default function AccessScanPage() {
  const [qrData, setQrData] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastValidation, setLastValidation] = useState<ValidationResult | null>(null);
  const { toast } = useToast();

  const validateQR = async () => {
    if (!qrData.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Por favor ingresa los datos del código QR",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await accessControlApi.validateQR(qrData.trim());
      const result = response.data as ValidationResult;
      
      setLastValidation(result);
      
      toast({
        title: result.access === 'GRANTED' ? "Acceso Concedido" : "Acceso Denegado",
        description: result.access === 'GRANTED' 
          ? `Bienvenido ${result.user.name || result.user.email}`
          : result.reason || "Membresía no válida",
        variant: result.access === 'GRANTED' ? "default" : "destructive",
      });

      // Limpiar input después de validación
      setQrData("");

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Error al validar código QR",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      validateQR();
    }
  };

  // FIX: Función para simular escaneo de QR
  const simulateScan = () => {
    // Simula un código QR válido del cliente de prueba
    const mockUserId = 'client-demo-id';
    const mockQrData = `${mockUserId}-${Date.now()}`;
    setQrData(mockQrData);
    toast({
      title: "QR Simulado",
      description: "Datos de QR de prueba insertados. Haz clic en 'Validar'.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Escáner QR de Acceso</h1>
        <p className="text-muted-foreground">
          Valida los códigos QR de los socios para controlar el acceso
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scanner Input */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              Validador de Códigos QR
            </CardTitle>
            <CardDescription>
              Escanea o ingresa manualmente el código QR del socio
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="qrData">Datos del Código QR</Label>
              <Input
                id="qrData"
                type="text"
                placeholder="Escanea el código QR aquí..."
                value={qrData}
                onChange={(e) => setQrData(e.target.value)}
                onKeyPress={handleKeyPress}
                className="font-mono"
                autoFocus
              />
              <p className="text-sm text-muted-foreground">
                El lector QR escribirá automáticamente aquí, o puedes ingresar manualmente
              </p>
            </div>

            <Button 
              onClick={validateQR} 
              disabled={loading || !qrData.trim()}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <Scan className="h-4 w-4 mr-2 animate-pulse" />
                  Validando...
                </>
              ) : (
                <>
                  <Scan className="h-4 w-4 mr-2" />
                  Validar Acceso
                </>
              )}
            </Button>

            {/* FIX: Botón para simular escaneo */}
            <Button 
              onClick={simulateScan} 
              variant="outline" 
              className="w-full"
            >
              <QrCode className="h-4 w-4 mr-2" />
              Simular Escaneo de Cliente de Prueba
            </Button>

            {/* Instructions */}
            <Alert>
              <QrCode className="h-4 w-4" />
              <AlertDescription>
                <strong>Instrucciones:</strong> Coloca el cursor en el campo de texto y 
                escanea el código QR del socio. El sistema validará automáticamente 
                la membresía y mostrará el resultado.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Validation Result */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Resultado de Validación
            </CardTitle>
            <CardDescription>
              Información del último código QR validado
            </CardDescription>
          </CardHeader>
          <CardContent>
            {lastValidation ? (
              <div className="space-y-4">
                {/* Access Status */}
                <div className="flex items-center justify-center p-6 border rounded-lg">
                  {lastValidation.access === 'GRANTED' ? (
                    <div className="text-center">
                      <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-green-700">ACCESO CONCEDIDO</h3>
                      <p className="text-muted-foreground">El socio puede ingresar</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-red-700">ACCESO DENEGADO</h3>
                      <p className="text-muted-foreground">
                        {lastValidation.reason || "Membresía no válida"}
                      </p>
                    </div>
                  )}
                </div>

                <Separator />

                {/* User Info */}
                <div className="space-y-3">
                  <h4 className="font-medium">Información del Socio:</h4>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Nombre:</p>
                      <p className="font-medium">{lastValidation.user.name || "No disponible"}</p>
                    </div>
                    
                    <div>
                      <p className="text-muted-foreground">Email:</p>
                      <p className="font-medium">{lastValidation.user.email}</p>
                    </div>

                    {lastValidation.user.membershipStatus && (
                      <div>
                        <p className="text-muted-foreground">Estado:</p>
                        <Badge variant={lastValidation.access === 'GRANTED' ? 'default' : 'destructive'}>
                          {lastValidation.user.membershipStatus}
                        </Badge>
                      </div>
                    )}

                    {lastValidation.user.expiresAt && (
                      <div>
                        <p className="text-muted-foreground">Vence:</p>
                        <p className="font-medium">
                          {new Date(lastValidation.user.expiresAt).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  Validado a las {new Date().toLocaleTimeString()}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <QrCode className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Escanea un código QR para ver el resultado aquí
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Consejos Rápidos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="p-3 border rounded">
              <h4 className="font-medium mb-2">QR Expirado</h4>
              <p className="text-muted-foreground">
                Los códigos QR expiran cada 30 segundos. Pide al socio que actualice su código.
              </p>
            </div>
            
            <div className="p-3 border rounded">
              <h4 className="font-medium mb-2">Membresía Vencida</h4>
              <p className="text-muted-foreground">
                Si la membresía está vencida, dirije al socio a recepción para renovar.
              </p>
            </div>
            
            <div className="p-3 border rounded">
              <h4 className="font-medium mb-2">Problemas Técnicos</h4>
              <p className="text-muted-foreground">
                Si hay problemas con el escáner, usa el ingreso manual en el menú principal.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}