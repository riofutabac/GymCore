"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { 
  UserPlus, 
  Search, 
  CheckCircle, 
  XCircle, 
  Clock,
  User,
  AlertTriangle
} from "lucide-react";

interface ManualEntry {
  id: string;
  memberName: string;
  memberEmail: string;
  entryTime: string;
  reason: string;
  authorizedBy: string;
}

export default function ManualEntryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedReason, setSelectedReason] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [recentEntries, setRecentEntries] = useState<ManualEntry[]>([
    {
      id: "1",
      memberName: "Juan Pérez",
      memberEmail: "juan@example.com",
      entryTime: new Date().toLocaleTimeString(),
      reason: "QR no funciona",
      authorizedBy: "Recepcionista"
    }
  ]);
  const { toast } = useToast();

  const handleManualEntry = async () => {
    if (!searchTerm.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Por favor ingresa el nombre o email del socio",
      });
      return;
    }

    if (!selectedReason) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Por favor selecciona una razón para el ingreso manual",
      });
      return;
    }

    setLoading(true);

    try {
      // Simular búsqueda y registro de entrada manual
      const newEntry: ManualEntry = {
        id: Date.now().toString(),
        memberName: searchTerm,
        memberEmail: `${searchTerm.toLowerCase().replace(' ', '.')}@example.com`,
        entryTime: new Date().toLocaleTimeString(),
        reason: selectedReason,
        authorizedBy: "Recepcionista Demo"
      };

      setRecentEntries([newEntry, ...recentEntries]);

      toast({
        title: "Entrada registrada",
        description: `Acceso manual concedido a ${searchTerm}`,
      });

      // Limpiar formulario
      setSearchTerm("");
      setSelectedReason("");
      setNotes("");

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error al registrar la entrada manual",
      });
    } finally {
      setLoading(false);
    }
  };

  const reasons = [
    "QR no funciona",
    "Teléfono sin batería",
    "Problemas técnicos",
    "Socio nuevo sin QR",
    "Emergencia",
    "Otro"
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Ingreso Manual</h1>
        <p className="text-muted-foreground">
          Registra el acceso de socios cuando el sistema QR no esté disponible
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Manual Entry Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Registrar Entrada Manual
            </CardTitle>
            <CardDescription>
              Busca al socio y registra su entrada manualmente
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="search">Buscar Socio</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Nombre o email del socio..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Ingresa el nombre completo o email del socio
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Razón del Ingreso Manual</Label>
              <Select value={selectedReason} onValueChange={setSelectedReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una razón" />
                </SelectTrigger>
                <SelectContent>
                  {reasons.map((reason) => (
                    <SelectItem key={reason} value={reason}>
                      {reason}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notas Adicionales (Opcional)</Label>
              <Input
                id="notes"
                placeholder="Información adicional..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <Button 
              onClick={handleManualEntry} 
              disabled={loading || !searchTerm.trim() || !selectedReason}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-pulse" />
                  Registrando...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Registrar Entrada
                </>
              )}
            </Button>

            {/* Warning */}
            <div className="p-3 border border-yellow-200 rounded-lg bg-yellow-50">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-yellow-800">Importante:</p>
                  <p className="text-yellow-700">
                    El ingreso manual debe usarse solo cuando el sistema QR no esté disponible. 
                    Siempre verifica la identidad del socio antes de conceder acceso.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Manual Entries */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Entradas Manuales Recientes
            </CardTitle>
            <CardDescription>
              Últimos registros de acceso manual del día
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentEntries.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-full">
                      <User className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">{entry.memberName}</p>
                      <p className="text-sm text-muted-foreground">{entry.memberEmail}</p>
                      <p className="text-xs text-muted-foreground">
                        Razón: {entry.reason}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="default">
                      Concedido
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {entry.entryTime}
                    </p>
                  </div>
                </div>
              ))}

              {recentEntries.length === 0 && (
                <div className="flex flex-col items-center justify-center h-32 text-center">
                  <UserPlus className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">
                    No hay entradas manuales registradas hoy
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Protocolo de Ingreso Manual
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="p-3 border rounded">
              <h4 className="font-medium mb-2">1. Verificar Identidad</h4>
              <p className="text-muted-foreground">
                Solicita identificación oficial y confirma que coincida con los datos del socio.
              </p>
            </div>
            
            <div className="p-3 border rounded">
              <h4 className="font-medium mb-2">2. Confirmar Membresía</h4>
              <p className="text-muted-foreground">
                Verifica que la membresía esté activa y no haya vencido antes de conceder acceso.
              </p>
            </div>
            
            <div className="p-3 border rounded">
              <h4 className="font-medium mb-2">3. Registrar Motivo</h4>
              <p className="text-muted-foreground">
                Siempre documenta la razón del ingreso manual para mantener un registro completo.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}