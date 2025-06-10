import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function isValidJWT(token: string): boolean {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    
    // Verificar que cada parte sea base64 válido
    const [header, payload, signature] = parts;
    if (!header || !payload || !signature) return false;
    
    // Intentar decodificar el payload
    const decodedPayload = JSON.parse(Buffer.from(payload, 'base64').toString());
    if (!decodedPayload || typeof decodedPayload !== 'object') return false;
    
    // Verificar campos requeridos
    if (!decodedPayload.sub || !decodedPayload.role) return false;
    
    return true;
  } catch {
    return false;
  }
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  const isAuthPage = request.nextUrl.pathname === '/login' || 
                    request.nextUrl.pathname === '/register';
  
  // Si el usuario intenta acceder a una página de auth estando autenticado
  if (isAuthPage && token && isValidJWT(token)) {
    try {
      const tokenData = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
      const role = tokenData.role;

      // Redirigir según el rol
      let redirectUrl = '/';
      if (role === 'OWNER') redirectUrl = '/owner';
      if (role === 'MANAGER') redirectUrl = '/manager';
      if (role === 'RECEPTION') redirectUrl = '/reception';
      if (role === 'CLIENT') redirectUrl = '/client';

      return NextResponse.redirect(new URL(redirectUrl, request.url));
    } catch {
      // Si hay un error al decodificar el token, lo tratamos como inválido
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('auth_token');
      return response;
    }
  }

  // Si el usuario intenta acceder a una ruta protegida
  if (!isAuthPage) {
    // Sin token o con token inválido
    if (!token || !isValidJWT(token)) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.search = `?callbackUrl=${encodeURIComponent(request.nextUrl.pathname)}`;
      const response = NextResponse.redirect(url);
      if (token) response.cookies.delete('auth_token'); // Limpiar token inválido
      return response;
    }
  }

  return NextResponse.next();
}

// Configurar qué rutas deben ser protegidas
export const config = {
  matcher: [
    '/owner/:path*',
    '/manager/:path*',
    '/reception/:path*',
    '/client/:path*',
    '/login',
    '/register'
  ],
};
