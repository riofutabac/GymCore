'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/lib/store';
import { createSupabaseBrowserClient } from '@/lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore.getState().login;
  const authError = useAuthStore.getState().error;
  const clearError = useAuthStore.getState().clearError;
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Limpiar errores cuando el usuario empieza a escribir
    if (error) setError(null);
    if (authError) clearError();
  };

  // Verificar si ya hay una sesión activa al cargar la página
  useEffect(() => {
    const checkSession = async () => {
      try {
        const supabase = createSupabaseBrowserClient();
        const { data } = await supabase.auth.getSession();
        
        if (data.session) {
          // Ya hay una sesión activa, refrescar datos del usuario
          await useAuthStore.getState().refreshUser();
          redirectBasedOnRole();
        }
      } catch (error) {
        console.error('Error al verificar sesión:', error);
      }
    };
    
    checkSession();
  }, []);

  const redirectBasedOnRole = () => {
    const user = useAuthStore.getState().user;
    if (!user) return;
    
    // Redirigir según el rol del usuario
    switch (user.role) {
      case 'OWNER':
        router.push('/owner');
        break;
      case 'MANAGER':
        router.push('/manager');
        break;
      case 'STAFF':
        router.push('/staff');
        break;
      default:
        router.push('/dashboard');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validación básica
    if (!formData.email || !formData.password) {
      setError('Por favor completa todos los campos');
      return;
    }

    try {
      setIsLoading(true);
      await login(formData.email, formData.password);
      redirectBasedOnRole();
    } catch (err) {
      console.error('Error en inicio de sesión:', err);
      setError('Error al iniciar sesión. Verifica tus credenciales.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <style jsx global>{`
        .login-card {
          backdrop-filter: blur(10px);
          background: rgba(255, 255, 255, 0.9);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.1);
        }
        .input-focus:focus {
          box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.1);
          border-color: #000;
        }
        .floating-label {
          transition: all 0.2s ease-in-out;
        }
      `}</style>

      {/* Header */}
      <header className="fixed w-full z-50 bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-black to-gray-800 flex items-center justify-center shadow-lg overflow-hidden">
                <Image
                  src="/assets/img/logo.png"
                  alt="GymCore Logo"
                  width={36}
                  height={36}
                  className="w-9 h-9 object-contain"
                />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                GymCore
              </span>
            </Link>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 hidden sm:inline">¿No tienes cuenta?</span>
              <Link href="/register">
                <Button className="bg-gradient-to-r from-black to-gray-800 hover:from-gray-800 hover:to-black text-white px-6 py-2 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                  Registrarse
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 items-center justify-center px-4 py-12 pt-32">
        <div className="w-full max-w-md">
          <Card className="login-card border-0 shadow-2xl">
            <CardHeader className="space-y-4 text-center pb-8">
              <div className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-black to-gray-800 flex items-center justify-center shadow-lg overflow-hidden">
                <Image
                  src="/assets/img/logo.png"
                  alt="GymCore Logo"
                  width={64}
                  height={64}
                  className="w-14 h-14 object-contain"
                />
              </div>
              <div className="space-y-2">
                <CardTitle className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Bienvenido
                </CardTitle>
                <CardDescription className="text-gray-600 text-base">
                  Ingresa a tu cuenta para continuar
                </CardDescription>
              </div>
            </CardHeader>
            
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-6 px-8">
                {(error || authError) && (
                  <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700 flex items-center space-x-3">
                    <span className="text-red-500">⚠️</span>
                    <span>{error || authError}</span>
                  </div>
                )}
                
                <div className="space-y-3">
                  <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
                    Correo electrónico
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="ejemplo@correo.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="input-focus border-gray-200 rounded-xl h-12 px-4 text-base transition-all duration-200 hover:border-gray-300"
                    required
                  />
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-sm font-semibold text-gray-700">
                      Contraseña
                    </Label>
                    <Link
                      href="/forgot-password"
                      className="text-xs text-gray-500 hover:text-black transition-colors duration-200 hover:underline"
                    >
                      ¿Olvidaste tu contraseña?
                    </Link>
                  </div>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    className="input-focus border-gray-200 rounded-xl h-12 px-4 text-base transition-all duration-200 hover:border-gray-300"
                    required
                  />
                </div>
              </CardContent>
              
              <CardFooter className="flex flex-col space-y-6 px-8 pb-8">
                <Button 
                  type="submit" 
                  className="w-full h-12 bg-gradient-to-r from-black to-gray-800 hover:from-gray-800 hover:to-black text-white rounded-xl font-medium text-base transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:hover:scale-100" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Iniciando sesión...</span>
                    </div>
                  ) : (
                    'Iniciar Sesión'
                  )}
                </Button>
                
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
