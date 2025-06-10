import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Constantes para mejorar mantenibilidad
const AUTH_PAGES = ['/login', '/register'];
const PROTECTED_ROUTES = ['/dashboard', '/owner', '/manager', '/reception', '/client', '/settings'];

// Función para obtener la ruta base según el rol
function getBaseRouteByRole(role: string): string {
  // Normalizar el rol a minúsculas para comparación
  const normalizedRole = role.toLowerCase();
  
  // Mapa de roles a rutas
  const roleRoutes: Record<string, string> = {
    'owner': '/owner',
    'manager': '/manager',
    'reception': '/reception',
    'client': '/client',
  };

  // Obtener la ruta correspondiente o default a /login
  return roleRoutes[normalizedRole] || '/login';
}

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
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('auth_token')?.value;
  const isAuthPage = AUTH_PAGES.includes(pathname);
  
  // 1. Si el usuario está autenticado
  if (token && isValidJWT(token)) {
    try {
      // Decodificar el token para obtener el rol del usuario
      const tokenData = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
      const role = tokenData.role;
      console.log('Role from token:', role); // Debug log
      const baseRoute = getBaseRouteByRole(role);
      console.log('Base route:', baseRoute); // Debug log

      // Si intenta acceder a login/register, raíz o dashboard estando autenticado
      if (isAuthPage || pathname === '/' || pathname === '/dashboard') {
        console.log('Redirecting to base route:', baseRoute); // Debug log
        const response = NextResponse.redirect(new URL(baseRoute, request.url));
        // Asegurarnos de mantener el token en la redirección
        if (token) {
          response.cookies.set('auth_token', token);
        }
        return response;
      }
      
      // Si la ruta actual no coincide con su rol (e.g., un CLIENT intentando acceder a /owner)
      const currentBaseRoute = '/' + pathname.split('/')[1]; // Obtiene /owner de /owner/users
      if (PROTECTED_ROUTES.includes(currentBaseRoute) && currentBaseRoute !== baseRoute) {
        console.log('Invalid route access, redirecting to:', baseRoute); // Debug log
        const response = NextResponse.redirect(new URL(baseRoute, request.url));
        // Asegurarnos de mantener el token en la redirección
        if (token) {
          response.cookies.set('auth_token', token);
        }
        return response;
      }
      
      return NextResponse.next();
    } catch {
      // Si hay un error al decodificar el token, lo tratamos como inválido
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('auth_token');
      return response;
    }
  }

  // 2. Si el usuario NO está autenticado
  if (!token || !isValidJWT(token)) {
    // Si ya está en una página de autenticación o la landing page, permitirlo
    if (isAuthPage || pathname === '/') {
      return NextResponse.next();
    }
    
    // Si intenta acceder a cualquier ruta protegida sin autenticación
    if (PROTECTED_ROUTES.some(route => pathname.startsWith(route))) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      
      const response = NextResponse.redirect(loginUrl);
      if (token) {
        response.cookies.delete('auth_token');
      }
      return response;
    }
  }

  return NextResponse.next();
}

// Configurar qué rutas deben ser protegidas
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
