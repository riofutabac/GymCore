import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const isAuthPage = request.nextUrl.pathname.startsWith('/login') || 
                    request.nextUrl.pathname.startsWith('/register');
  
  // Si el usuario intenta acceder a una página de auth estando autenticado
  if (isAuthPage && token) {
    // Obtener el token y decodificarlo para obtener el rol
    const tokenData = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    const role = tokenData.role;

    // Redirigir según el rol
    let redirectUrl = '/owner';
    if (role === 'MANAGER') redirectUrl = '/manager';
    if (role === 'STAFF') redirectUrl = '/staff';

    return NextResponse.redirect(new URL(redirectUrl, request.url));
  }

  // Si el usuario intenta acceder a una ruta protegida sin estar autenticado
  if (!isAuthPage && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

// Configurar qué rutas deben ser protegidas
export const config = {
  matcher: [
    '/owner/:path*',
    '/manager/:path*',
    '/staff/:path*',
    '/login',
    '/register'
  ],
};
