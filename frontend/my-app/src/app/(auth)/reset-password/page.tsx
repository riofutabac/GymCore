'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSessionReady, setIsSessionReady] = useState(false);
  const supabase = createSupabaseBrowserClient();

  // Verificar el estado de autenticación y el token de recuperación
  useEffect(() => {
    async function checkAuthState() {
      const { data: { user }, error } = await supabase.auth.getUser();
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
        if (event === 'PASSWORD_RECOVERY') {
          setIsSessionReady(true);
        }
      });

      // Si no hay error y tenemos un usuario, verificar si estamos en modo recuperación
      if (!error && user) {
        const hash = window.location.hash;
        if (hash && hash.includes('type=recovery')) {
          setIsSessionReady(true);
        } else {
          // Si no estamos en modo recuperación, redirigir al dashboard
          router.push('/login');
        }
      }

      return () => {
        subscription.unsubscribe();
      };
    }

    checkAuthState();
  }, [supabase.auth, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (password.length < 6) {
        toast.error('La contraseña debe tener al menos 6 caracteres');
        setIsLoading(false);
        return;
      }

      if (password !== confirmPassword) {
        toast.error('Las contraseñas no coinciden');
        setIsLoading(false);
        return;
      }

      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        toast.error(error.message);
        setIsLoading(false);
        return;
      }

      toast.success('Contraseña actualizada con éxito');
      
      // Cerrar sesión y redirigir al login
      await supabase.auth.signOut();
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (error) {
      toast.error('Error al actualizar la contraseña');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // No mostrar el formulario hasta que Supabase confirme que estamos en un flujo de recuperación
  if (!isSessionReady) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Verificando enlace de recuperación...</p>
      </div>
    );
  }

  return (
    <div className="container flex items-center justify-center min-h-screen py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Restablecer Contraseña
          </CardTitle>
          <CardDescription className="text-center">
            Por favor, introduce tu nueva contraseña
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Nueva contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Confirmar contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Actualizando...' : 'Actualizar Contraseña'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
