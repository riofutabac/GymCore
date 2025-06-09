"use client";

import QRGenerator from "@/components/QRGenerator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Info, Shield, Clock } from "lucide-react";

export default function QRCodePage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Código QR de Acceso</h1>
        <p className="text-muted-foreground">
          Tu pase digital para ingresar al gimnasio
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* QR Generator */}
        <div className="lg:col-span-1">
          <QRGenerator autoRefresh={true} refreshInterval={30000} />
        </div>

        {/* Instructions */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                Instrucciones de Uso
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Badge variant="outline" className="mt-1">1</Badge>
                  <div>
                    <p className="font-medium">Acércate a la entrada</p>
                    <p className="text-sm text-muted-foreground">
                      Dirígete al lector QR en la recepción del gimnasio
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Badge variant="outline" className="mt-1">2</Badge>
                  <div>
                    <p className="font-medium">Muestra tu código</p>
                    <p className="text-sm text-muted-foreground">
                      Presenta la pantalla al personal o al lector automático
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Badge variant="outline" className="mt-1">3</Badge>
                  <div>
                    <p className="font-medium">Espera la validación</p>
                    <p className="text-sm text-muted-foreground">
                      El sistema verificará tu membresía activa
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Badge variant="outline" className="mt-1">4</Badge>
                  <div>
                    <p className="font-medium">¡Disfruta tu entrenamiento!</p>
                    <p className="text-sm text-muted-foreground">
                      Acceso concedido, puedes ingresar al gimnasio
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              <strong>Seguridad:</strong> Este código QR es único y personal. 
              Se renueva automáticamente cada 30 segundos para mayor seguridad.
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Características
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Badge variant="secondary" className="w-2 h-2 p-0"></Badge>
                  Renovación automática cada 30 segundos
                </li>
                <li className="flex items-center gap-2">
                  <Badge variant="secondary" className="w-2 h-2 p-0"></Badge>
                  Verificación de membresía en tiempo real
                </li>
                <li className="flex items-center gap-2">
                  <Badge variant="secondary" className="w-2 h-2 p-0"></Badge>
                  Registro de accesos para seguridad
                </li>
                <li className="flex items-center gap-2">
                  <Badge variant="secondary" className="w-2 h-2 p-0"></Badge>
                  Compatible con lectores QR estándar
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
