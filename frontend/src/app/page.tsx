import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Dumbbell, Users, QrCode, BarChart3 } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Dumbbell className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">
                GymCore
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button variant="ghost">Iniciar Sesión</Button>
              </Link>
              <Link href="/register">
                <Button>Registrarse</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-6xl">
            Gestiona tu gimnasio con{" "}
            <span className="text-blue-600">GymCore</span>
          </h1>
          <p className="mt-6 text-lg text-gray-600 max-w-3xl mx-auto">
            Plataforma integral para la gestión de gimnasios. Control de acceso,
            membresías, inventario y reportes en un solo lugar.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Link href="/register">
              <Button size="lg" className="px-8">
                Comenzar Gratis
              </Button>
            </Link>
            <Link href="/gym-join">
              <Button variant="outline" size="lg" className="px-8">
                Unirse a Gimnasio
              </Button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <Card>
            <CardHeader>
              <QrCode className="h-8 w-8 text-blue-600" />
              <CardTitle>Control de Acceso</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Códigos QR dinámicos para acceso seguro al gimnasio
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Users className="h-8 w-8 text-green-600" />
              <CardTitle>Gestión de Socios</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Administra membresías, pagos y perfiles de usuarios
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <BarChart3 className="h-8 w-8 text-purple-600" />
              <CardTitle>Reportes</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Análisis de ingresos, asistencia y métricas del negocio
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Dumbbell className="h-8 w-8 text-orange-600" />
              <CardTitle>Inventario</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Control de productos, ventas y stock en tiempo real
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
