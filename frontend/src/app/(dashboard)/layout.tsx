import { redirect } from 'next/navigation';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { DashboardSidebar } from '@/components/layout/DashboardSidebar';
import { getCurrentUserServer } from '@/lib/auth-server';
import { cookies } from 'next/headers';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  console.log('🔍 Iniciando DashboardLayout...');
  
  // Verificar cookies disponibles
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();
  console.log('🍪 Cookies disponibles:', allCookies.map(c => ({ name: c.name, hasValue: !!c.value })));
  
  // Buscar cookies específicas de autenticación
  const authToken = cookieStore.get('gymcore_token') || cookieStore.get('token') || cookieStore.get('auth-token');
  const userInfo = cookieStore.get('gymcore_user') || cookieStore.get('user');
  
  console.log('🔑 Token de auth encontrado:', !!authToken);
  console.log('👤 Info de usuario encontrada:', !!userInfo);
  
  if (authToken) {
    console.log('🎫 Token preview:', authToken.value.substring(0, 20) + '...');
  }
  
  if (userInfo) {
    console.log('📋 User info preview:', userInfo.value.substring(0, 50) + '...');
  }

  let user = null;
  
  try {
    console.log('⏳ Llamando a getCurrentUserServer...');
    user = await getCurrentUserServer();
    console.log('✅ getCurrentUserServer completado sin errores');
  } catch (authError) {
    console.error('🚨 Error específico en getCurrentUserServer:', authError);
    console.error('📋 Tipo de error de auth:', typeof authError);
    console.error('💬 Mensaje de error de auth:', authError?.message);
    console.error('📚 Stack trace:', authError?.stack);
    
    console.log('❌ Error en autenticación, redirigiendo...');
    redirect('/login');
  }

  console.log('👤 Usuario final obtenido:', user);
  console.log('🔑 Tipo de usuario:', typeof user);
  console.log('📊 Usuario es null?:', user === null);
  console.log('📊 Usuario es undefined?:', user === undefined);
  console.log('📊 Propiedades del usuario:', user ? Object.keys(user) : 'Sin propiedades');

  if (!user) {
    console.log('❌ No hay usuario válido, redirigiendo a login...');
    console.log('🔍 Diagnóstico detallado:');
    console.log('  - getCurrentUserServer() retorna null/undefined');
    console.log('  - Verificar si el usuario se logueó correctamente');
    console.log('  - Verificar si las cookies se están estableciendo correctamente');
    console.log('  - Puede que necesites hacer login primero');
    
    redirect('/login');
  }

  console.log('✅ Usuario válido encontrado, renderizando dashboard');

  return (
    <div className="flex h-screen bg-gray-50">
      <DashboardSidebar user={user} />
      <div className="flex-1 overflow-auto">
        <DashboardHeader user={user} />
        <main className="p-4 md:p-6 max-w-[1600px] mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}