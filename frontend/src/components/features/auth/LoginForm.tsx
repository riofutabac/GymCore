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
import { storeUserInfo, redirectByRole, setServerCookies } from '@/lib/auth';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');
  
  // Este es el flujo principal cuando el usuario hace login
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Por favor completa todos los campos');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      // 1. Llamada a la API para autenticar al usuario
      const response = await authAPI.login(email, password);
      
      // 2. Guarda datos del usuario y token en localStorage Y cookies
      storeUserInfo(response.user, response.token);
      setServerCookies(response.user, response.token);
      
      // 3. Muestra mensaje de éxito
      toast({
        title: "¡Inicio de sesión exitoso!",
        description: `Bienvenido, ${response.user.name || response.user.email || 'Usuario'}`,
      });
      
      // 4. IMPORTANTE: Esta función redirige según el rol del usuario
      setTimeout(() => {
        redirectByRole(response.user, redirect ? `/${redirect}` : undefined);
      }, 500);
      
    } catch (error: any) {
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
