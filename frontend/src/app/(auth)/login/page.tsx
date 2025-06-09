"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Dumbbell, Loader2 } from "lucide-react";
import { authAPI } from "@/lib/api";

export default function LoginPage() {
  const [email, setEmail] = useState("admin@gym.com");
  const [password, setPassword] = useState("password123");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await authAPI.login(email, password);
      
      const { user, token } = response;
      
      // Guardar token en localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      toast({
        title: "¡Bienvenido!",
        description: "Has iniciado sesión correctamente.",
      });

      // Redirigir según el rol
      switch (user.role) {
        case "CLIENT":
          router.push("/member");
          break;
        case "RECEPTION":
          router.push("/reception");
          break;
        case "MANAGER":
          router.push("/manager");
          break;
        case "SYS_ADMIN":
          router.push("/admin");
          break;
        default:
          router.push("/member");
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Error al iniciar sesión",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 py-12 bg-muted/40 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <Dumbbell className="w-8 h-8 text-primary" />
            <span className="ml-2 text-2xl font-bold">GymCore</span>
          </div>
          <CardTitle className="text-center">Iniciar Sesión</CardTitle>
          <CardDescription className="text-center">
            Ingresa tus credenciales para acceder
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Iniciar Sesión
            </Button>
          </form>
          <div className="mt-4 text-sm text-center">
            ¿No tienes cuenta?{" "}
            <Link href="/register" className="text-primary hover:underline">
              Regístrate aquí
            </Link>
          </div>
          
          <div className="p-4 mt-6 rounded-lg bg-secondary">
            <h4 className="mb-2 text-sm font-medium">Usuarios de prueba:</h4>
            <div className="space-y-1 text-xs text-muted-foreground">
              <p>👤 <span className="font-semibold">Manager:</span> admin@gym.com / password123</p>
              <p>👤 <span className="font-semibold">Cliente:</span> client@gym.com / password123</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
