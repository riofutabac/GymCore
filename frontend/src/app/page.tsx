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

// Componente para las tarjetas de características para evitar repetición
const FeatureCard = ({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) => (
  <Card className="bg-card/50 hover:bg-card/90 transition-all duration-300 ease-in-out transform hover:-translate-y-1">
    <CardHeader className="flex flex-col items-center text-center">
      <div className="mb-4 rounded-full bg-primary/10 p-4">{icon}</div>
      <CardTitle>{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <CardDescription className="text-center">
        {description}
      </CardDescription>
    </CardContent>
  </Card>
);

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
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
          {/* Fondo decorativo */}
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 h-full w-full bg-background bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(rgba(255,255,255,0.1)_1px,transparent_1px)] [background-size:16px_16px]"
          ></div>

          <div className="container text-center">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              La plataforma todo en uno para
              <span className="block text-primary">gestionar tu gimnasio</span>
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-lg text-muted-foreground">
              Simplifica la gestión de socios, automatiza el control de acceso con
              QR y optimiza tus ventas. Todo en un solo lugar.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
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
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight">
                Potencia tu Gimnasio
              </h2>
              <p className="mt-2 text-lg text-muted-foreground">
                Descubre las herramientas diseñadas para llevar tu negocio al
                siguiente nivel.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <FeatureCard
                icon={<QrCode className="h-10 w-10 text-primary" />}
                title="Control de Acceso con QR"
                description="Acceso rápido, seguro y sin contacto para tus socios mediante códigos QR dinámicos y únicos."
              />
              <FeatureCard
                icon={<Users className="h-10 w-10 text-primary" />}
                title="Gestión de Socios"
                description="Administra membresías, perfiles, pagos y seguimientos de manera centralizada y eficiente."
              />
              <FeatureCard
                icon={<BarChart3 className="h-10 w-10 text-primary" />}
                title="Reportes y Analíticas"
                description="Obtén métricas clave sobre ingresos, asistencia y ventas para tomar decisiones informadas."
              />
              <FeatureCard
                icon={<ShieldCheck className="h-10 w-10 text-primary" />}
                title="Seguridad y Roles"
                description="Asigna roles específicos (Gerente, Recepción, Cliente) con permisos definidos para cada función."
              />
              <FeatureCard
                icon={<Package className="h-10 w-10 text-primary" />}
                title="Gestión de Inventario"
                description="Controla el stock de tus productos, registra ventas en el punto de venta (POS) y optimiza tu inventario."
              />
              <FeatureCard
                icon={<Zap className="h-10 w-10 text-primary" />}
                title="Plataforma Moderna"
                description="Una interfaz rápida, intuitiva y adaptable a cualquier dispositivo para una experiencia de usuario superior."
              />
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
