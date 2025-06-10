import Link from 'next/link';
import { LoginForm } from '@/components/features/auth/LoginForm';
import { AuthHeader } from '@/components/layout/AuthHeader';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <AuthHeader />
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Bienvenido a GymCore
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              ¿No tienes cuenta?{' '}
              <Link
                href="/register"
                className="font-medium text-primary hover:text-primary/80"
              >
                Regístrate aquí
              </Link>
            </p>
          </div>

          <LoginForm />
        </div>
      </div>
    </div>
  );
}