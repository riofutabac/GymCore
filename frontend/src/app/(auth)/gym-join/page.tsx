
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, Users, ArrowLeft } from 'lucide-react';
import { authAPI } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
import { getStoredUser } from '@/lib/auth';

export default function GymJoinPage() {
  const [joinCode, setJoinCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { toast } = useToast();
  
  // Verificar si el usuario está autenticado
  const user = getStoredUser();

  // Cargar código pendiente si existe
  useState(() => {
    const pendingCode = localStorage.getItem('pending_gym_code');
    if (pendingCode) {
      setJoinCode(pendingCode);
    }
  });

  const handleJoinGym = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      // Si no está autenticado, guardar el código y redirigir a login
      if (joinCode.trim()) {
        localStorage.setItem('pending_gym_code', joinCode);
        router.push('/login?redirect=gym-join');
        return;
      }
    }

    if (!joinCode.trim()) {
      setError('Por favor ingresa un código de gimnasio');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Llamar API para unirse al gimnasio
      const response = await authAPI.joinGym(joinCode);

      toast({
        title: "¡Bienvenido!",
        description: `Te has unido exitosamente al gimnasio: ${response.gym.name}`,
      });

      // Limpiar código pendiente si existe
      localStorage.removeItem('pending_gym_code');

      // Redirigir al dashboard de miembro
      router.push('/member');

    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Código inválido o gimnasio no encontrado';
      setError(errorMessage);

      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header con botón de regresar */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => router.back()}
              className="mr-2"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Regresar
            </Button>
            <div className="flex items-center ml-auto">
              <Users className="h-6 w-6 text-blue-600" />
              <span className="ml-2 text-xl font-bold">GymCore</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <Card className="w-full">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center">
                Únete a un Gimnasio
              </CardTitle>
              <CardDescription className="text-center">
                Ingresa el código que te proporcionó tu gimnasio para unirte
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleJoinGym} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="joinCode">Código del Gimnasio</Label>
                  <Input
                    id="joinCode"
                    type="text"
                    placeholder="Ej: GYM123456"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                    required
                    disabled={isLoading}
                    className="text-center text-lg tracking-wider"
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading}
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isLoading ? 'Procesando...' : (user ? 'Unirse al Gimnasio' : 'Continuar')}
                </Button>
              </form>

              {/* Enlaces de autenticación */}
              <div className="pt-4 border-t">
                {user ? (
                  <p className="text-sm text-center text-gray-600">
                    Conectado como <span className="font-medium">{user.name}</span>
                  </p>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-center text-gray-600">
                      ¿Ya tienes cuenta?{' '}
                      <Link
                        href="/login"
                        className="font-medium text-primary hover:text-primary/80"
                      >
                        Inicia sesión aquí
                      </Link>
                    </p>
                    <p className="text-sm text-center text-gray-600">
                      ¿No tienes cuenta?{' '}
                      <Link
                        href="/register"
                        className="font-medium text-primary hover:text-primary/80"
                      >
                        Regístrate aquí
                      </Link>
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
