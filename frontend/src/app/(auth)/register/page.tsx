
import Link from 'next/link';
import { RegisterForm } from '@/components/features/auth/RegisterForm';
import { AuthHeader } from '@/components/layout/AuthHeader';

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <AuthHeader />
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Crear tu cuenta
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              ¿Ya tienes cuenta?{' '}
              <Link
                href="/login"
                className="font-medium text-primary hover:text-primary/80"
              >
                Inicia sesión aquí
              </Link>
            </p>
          </div>
          
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}
