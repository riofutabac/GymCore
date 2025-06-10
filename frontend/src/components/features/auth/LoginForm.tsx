'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle } from 'lucide-react';
import { authAPI } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
import { storeUserInfo, redirectByRole } from '@/lib/auth';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Por favor completa todos los campos');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      console.log('Intentando iniciar sesión con:', { email });
      
      // Llamar a la API de autenticación
      const response = await authAPI.login(email, password);
      console.log('Respuesta login procesada:', response);
      
      // Verificar la respuesta de manera más flexible
      if (!response) {
        throw new Error('No se recibió respuesta del servidor');
      }
      
      if (!response.user) {
        console.error('Respuesta sin datos de usuario:', response);
        throw new Error('Datos de usuario no disponibles');
      }
      
      if (!response.token) {
        console.error('Respuesta sin token de autenticación:', response);
        throw new Error('Token de autenticación no disponible');
      }
      
      // Almacenar datos de usuario y token
      storeUserInfo(response.user, response.token);
      
      console.log('Usuario autenticado con rol:', response.user.role);
      
      toast({
        title: "¡Inicio de sesión exitoso!",
        description: `Bienvenido, ${response.user.name || response.user.email || 'Usuario'}`,
      });
      
      // Redireccionar según el rol del usuario (con un pequeño retraso para que el toast se muestre)
      setTimeout(() => {
        console.log('Redireccionando al usuario con rol:', response.user.role);
        redirectByRole(response.user, redirect ? `/${redirect}` : undefined);
      }, 500);
      
    } catch (error: any) {
      console.error('Error de inicio de sesión detallado:', error);
      
      const errorMessage = error.response?.data?.message || 
        error.message || 
        'Credenciales inválidas. Inténtalo de nuevo.';
      
      setError(errorMessage);
      
      toast({
        variant: "destructive",
        title: "Error de inicio de sesión",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="email">Correo electrónico</Label>
            <Input
              id="email"
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Contraseña</Label>
              <a href="/forgot-password" className="text-xs text-primary hover:underline">
                ¿Olvidaste tu contraseña?
              </a>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
