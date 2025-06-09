import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dumbbell,
  Users,
  QrCode,
  BarChart3,
  ShieldCheck,
  Zap,
  Package,
} from "lucide-react";
import type { Metadata } from 'next';
import { memo } from 'react';

export const metadata: Metadata = {
  title: 'GymCore - Gestión Integral de Gimnasios',
  description: 'La plataforma todo en uno para gestionar tu gimnasio. Simplifica la gestión de socios, automatiza el control de acceso con QR y optimiza tus ventas.',
  icons: {
    icon: '/favicon.ico',
  },
};

// Memoizar componente para evitar re-renders innecesarios
const FeatureCard = memo(({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) => (
  <Card className="transition-all duration-300 ease-in-out transform bg-card/50 hover:bg-card/90 hover:-translate-y-1">
    <CardHeader className="flex flex-col items-center text-center">
      <div className="p-4 mb-4 rounded-full bg-primary/10">{icon}</div>
      <CardTitle className="text-lg">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <CardDescription className="text-center text-sm">
        {description}
      </CardDescription>
    </CardContent>
  </Card>
));

FeatureCard.displayName = 'FeatureCard';

// Pre-definir las características para evitar recálculos
const features = [
  {
    icon: <QrCode className="w-10 h-10 text-primary" />,
    title: "Control de Acceso con QR",
    description: "Acceso rápido, seguro y sin contacto para tus socios mediante códigos QR dinámicos y únicos."
  },
  {
    icon: <Users className="w-10 h-10 text-primary" />,
    title: "Gestión de Socios",
    description: "Administra membresías, perfiles, pagos y seguimientos de manera centralizada y eficiente."
  },
  {
    icon: <BarChart3 className="w-10 h-10 text-primary" />,
    title: "Reportes y Analíticas",
    description: "Obtén métricas clave sobre ingresos, asistencia y ventas para tomar decisiones informadas."
  },
  {
    icon: <ShieldCheck className="w-10 h-10 text-primary" />,
    title: "Seguridad y Roles",
    description: "Asigna roles específicos (Gerente, Recepción, Cliente) con permisos definidos para cada función."
  },
  {
    icon: <Package className="w-10 h-10 text-primary" />,
    title: "Gestión de Inventario",
    description: "Controla el stock de tus productos, registra ventas en el punto de venta (POS) y optimiza tu inventario."
  },
  {
    icon: <Zap className="w-10 h-10 text-primary" />,
    title: "Plataforma Moderna",
    description: "Una interfaz rápida, intuitiva y adaptable a cualquier dispositivo para una experiencia de usuario superior."
  }
] as const;

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/60">
        <div className="container flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <Dumbbell className="h-7 w-7 text-primary" />
            <span className="text-xl font-bold">GymCore</span>
          </Link>
          <div className="flex items-center space-x-2">
            <Link href="/login">
              <Button variant="ghost">Iniciar Sesión</Button>
            </Link>
            <Link href="/register">
              <Button>Registrarse</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-24 sm:py-32">
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 h-full w-full bg-background bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(rgba(255,255,255,0.1)_1px,transparent_1px)] [background-size:16px_16px]"
          />

          <div className="container text-center">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              La plataforma todo en uno para
              <span className="block text-primary">gestionar tu gimnasio</span>
            </h1>
            <p className="max-w-2xl mx-auto mt-6 text-lg text-muted-foreground">
              Simplifica la gestión de socios, automatiza el control de acceso con
              QR y optimiza tus ventas. Todo en un solo lugar.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mt-10">
              <Link href="/register">
                <Button size="lg" className="px-8 py-6 text-lg">
                  Comenzar Gratis
                </Button>
              </Link>
              <Link href="/gym-join">
                <Button variant="outline" size="lg" className="px-8 py-6 text-lg">
                  Unirse a un Gimnasio
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-muted/40">
          <div className="container">
            <div className="mb-16 text-center">
              <h2 className="text-3xl font-bold tracking-tight">
                Potencia tu Gimnasio
              </h2>
              <p className="mt-2 text-lg text-muted-foreground">
                Descubre las herramientas diseñadas para llevar tu negocio al
                siguiente nivel.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => (
                <FeatureCard
                  key={index}
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                />
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t">
        <div className="container flex items-center justify-center h-20">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} GymCore. Todos los derechos
            reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
