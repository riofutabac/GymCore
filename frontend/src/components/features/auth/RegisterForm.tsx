'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle } from 'lucide-react';
import { authAPI } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
import { storeUserInfo, redirectByRole, setServerCookies } from '@/lib/auth';

export function RegisterForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !password) {
      setError('Por favor completa todos los campos');
      return;
    }
    
    // Validación simple de contraseña
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      // 1. Llama a la API para registrar al usuario
      const response = await authAPI.register(email, password, name);
      
      // 2. Guarda datos del usuario y token en localStorage Y cookies
      storeUserInfo(response.user, response.token);
      setServerCookies(response.user, response.token);
      
      // 3. Muestra mensaje de éxito
      toast({
        title: "¡Registro exitoso!",
        description: `Bienvenido a GymCore, ${response.user.name}`,
      });
      
      // 4. IMPORTANTE: Redirige según el rol asignado al nuevo usuario
      redirectByRole(response.user);
      
    } catch (error: any) {
      console.error('Error de registro:', error);
      
      const errorMessage = error.response?.data?.message || 
        error.message || 
        'Error al registrar la cuenta. Inténtalo de nuevo.';
      
      setError(errorMessage);
      
      toast({
        variant: "destructive",
        title: "Error de registro",
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
            <Label htmlFor="name">Nombre completo</Label>
            <Input
              id="name"
              type="text"
              placeholder="Tu nombre"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          
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
            <Label htmlFor="password">Contraseña</Label>
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
            {isLoading ? 'Registrando...' : 'Registrarse'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
