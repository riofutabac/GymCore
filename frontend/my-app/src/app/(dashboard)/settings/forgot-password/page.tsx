'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { ArrowLeft, Mail, Shield } from 'lucide-react';
import Link from 'next/link';

export default function SettingsForgotPasswordPage() {
  const router = useRouter();
  const { user } = useCurrentUser();
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createSupabaseBrowserClient();

  const handleSendResetEmail = async () => {
    if (!user?.email) {
      toast.error('No se pudo obtener tu email. Por favor, inicia sesión nuevamente.');
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success('Se ha enviado un correo con las instrucciones para restablecer tu contraseña');
      setTimeout(() => {
        router.push('/settings');
      }, 2000);
    } catch (error) {
      toast.error('Error al enviar el correo de recuperación');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto py-10">
        <div className="h-96 flex items-center justify-center">
          <p>Cargando información del usuario...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 space-y-6 max-w-2xl">
      {/* Botón de volver */}
      <div className="flex justify-start">
        <Link href="/settings">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al Perfil
          </Button>
        </Link>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Restablecer Contraseña</h1>
        <p className="text-muted-foreground text-lg">
          Te enviaremos un correo para restablecer tu contraseña
        </p>
      </div>

      {/* Card principal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Confirmar Envío de Correo
          </CardTitle>
          <CardDescription>
            Se enviará un enlace de restablecimiento de contraseña a tu email registrado
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Mostrar el email del usuario */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Correo Electrónico
            </label>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-md border">
              <Mail className="h-4 w-4 text-gray-500" />
              <span className="font-medium">{user.email}</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Este es el email registrado en tu cuenta. El enlace de restablecimiento se enviará a esta dirección.
            </p>
          </div>

          {/* Información adicional */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <h4 className="font-medium text-blue-900 mb-2">¿Qué sucederá después?</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Recibirás un correo con un enlace seguro</li>
              <li>• El enlace tendrá una validez limitada por seguridad</li>
              <li>• Podrás crear una nueva contraseña siguiendo las instrucciones</li>
              <li>• Tu sesión actual se mantendrá activa hasta que cambies la contraseña</li>
            </ul>
          </div>

          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button 
              onClick={handleSendResetEmail}
              disabled={isLoading}
              className="sm:flex-1"
            >
              {isLoading ? 'Enviando...' : 'Enviar Correo de Restablecimiento'}
            </Button>
            <Link href="/settings" className="sm:w-auto">
              <Button type="button" variant="outline" className="w-full sm:w-auto">
                Cancelar
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
