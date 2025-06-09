"use client";

import { useState, useCallback, memo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Dumbbell, Loader2, Users } from "lucide-react";
import { gymsAPI } from "@/lib/api";

// Componente memoizado para códigos de prueba
const TestCodes = memo(() => (
  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
    <h4 className="text-sm font-medium text-blue-900 mb-2">
      ℹ️ Códigos de prueba:
    </h4>
    <ul className="text-xs text-blue-800 space-y-1">
      <li>• <strong>GYM123</strong> - GymCore Demo</li>
      <li>• <strong>FIT456</strong> - FitnessWorld</li>
      <li>• <strong>HEALTH789</strong> - HealthClub</li>
    </ul>
  </div>
));

TestCodes.displayName = 'TestCodes';

export default function GymJoinPage() {
  const [joinCode, setJoinCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setJoinCode(e.target.value.toUpperCase());
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!joinCode.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Por favor ingresa un código válido",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await gymsAPI.joinByCode(joinCode);
      
      toast({
        title: "¡Te has unido al gimnasio!",
        description: `Bienvenido a ${response.gym?.name || 'tu nuevo gimnasio'}`,
      });

      // Optimizar navegación
      router.replace("/member");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Código de gimnasio inválido",
      });
    } finally {
      setIsLoading(false);
    }
  }, [joinCode, router, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <Users className="h-8 w-8 text-blue-600" />
            <span className="ml-2 text-2xl font-bold">GymCore</span>
          </div>
          <CardTitle className="text-center">Únete a un Gimnasio</CardTitle>
          <CardDescription className="text-center">
            Ingresa el código que te proporcionó tu gimnasio
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="joinCode">Código del Gimnasio</Label>
              <Input
                id="joinCode"
                type="text"
                placeholder="Ej: GYM123"
                value={joinCode}
                onChange={handleInputChange}
                className="text-center text-lg font-mono"
                maxLength={6}
                required
              />
              <p className="text-sm text-muted-foreground">
                El código suele tener 6 caracteres (letras y números)
              </p>
            </div>
            
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !joinCode.trim()}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Unirse al Gimnasio
            </Button>
          </form>
          
          <div className="mt-6 space-y-2">
            <div className="text-center text-sm">
              ¿No tienes un código?{" "}
              <Link href="/register" className="text-blue-600 hover:underline">
                Contacta a tu gimnasio
              </Link>
            </div>
            <div className="text-center text-sm">
              ¿Ya tienes cuenta?{" "}
              <Link href="/login" className="text-blue-600 hover:underline">
                Inicia sesión
              </Link>
            </div>
          </div>

          <TestCodes />
        </CardContent>
      </Card>
    </div>
  );
}
