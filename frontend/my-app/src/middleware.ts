import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Constantes para mejorar mantenibilidad
const PUBLIC_ROUTES = ['/login', '/register', '/reset-password', '/forgot-password'];
const PROTECTED_ROUTES = ['/dashboard', '/owner', '/manager', '/reception', '/client', '/settings', '/join-gym'];
const COMMON_ROUTES = ['/settings']; // Rutas accesibles para todos los roles autenticados

/**
 * Función para decodificar Base64Url correctamente
 * Base64Url usa '-' y '_' en lugar de '+' y '/' y no tiene padding '='
 */
function base64UrlDecode(base64Url: string): string {
  // Reemplazar caracteres específicos de Base64Url con caracteres de Base64 estándar
  let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  
  // Agregar padding '=' si es necesario
  while (base64.length % 4) {
    base64 += '=';
  }
  
  return base64;
}

/**
 * Función mejorada para validar JWT y extraer su payload
 * @returns Un objeto con éxito/fallo y el payload si es válido
 */
function parseJwt(token: string): { valid: boolean; payload?: any } {
  try {
    // Verificar formato básico del token
    const parts = token.split('.');
    if (parts.length !== 3) return { valid: false };
    
    // Extraer payload
    const [, payloadBase64] = parts;
    if (!payloadBase64) return { valid: false };
    
    // Decodificar correctamente respetando el formato Base64Url
    const decodedPayload = JSON.parse(
      Buffer.from(base64UrlDecode(payloadBase64), 'base64').toString('utf-8')
    );
    
    // Verificar campos esenciales
    if (!decodedPayload || !decodedPayload.sub || !decodedPayload.role) {
      return { valid: false };
    }
    
    // Verificar expiración si existe
    if (decodedPayload.exp) {
      const currentTime = Math.floor(Date.now() / 1000);
      if (currentTime > decodedPayload.exp) {
        return { valid: false };
      }
    }
    
    return { valid: true, payload: decodedPayload };
  } catch (error) {
    return { valid: false };
  }
}

/**
 * Obtiene la ruta base correspondiente al rol del usuario
 */
function getBaseRouteByRole(role: string): string {
  if (!role) return '/login';
  
  // Normalizar el rol a minúsculas para comparación
  const normalizedRole = role.toLowerCase();
  
  // Mapa de roles a rutas
  const roleRoutes: Record<string, string> = {
    'owner': '/owner',
    'manager': '/manager',
    'reception': '/reception',
    'client': '/client',
  };

  return roleRoutes[normalizedRole] || '/login';
}

/**
 * Extrae la ruta base de una URL
 * Ejemplo: /owner/dashboard -> /owner
 */
function extractBaseRoute(pathname: string): string {
  if (!pathname || pathname === '/') return '/';
  
  const segments = pathname.split('/').filter(Boolean);
  return segments.length > 0 ? `/${segments[0]}` : '/';
}

export async function middleware(request: NextRequest) {
  // Obtener información de la solicitud
  const { pathname } = request.nextUrl;
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
  const isCommonRoute = COMMON_ROUTES.some(route => pathname.startsWith(route));
  const currentBaseRoute = extractBaseRoute(pathname);
  const referer = request.headers.get('referer') || '';
  
  // Crear cliente de Supabase para el servidor
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return request.cookies.get(name)?.value;
        },
        set(name, value, options) {
          // Este método no se utiliza en el middleware
        },
        remove(name, options) {
          // Este método no se utiliza en el middleware
        },
      },
    }
  );
  
  // Verificar la autenticación del usuario de forma segura
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  // Si hay un error al obtener el usuario o no hay usuario, tratar como no autenticado
  if (userError || !user) {
    // Si es una ruta pública o landing, permitir acceso
    if (isPublicRoute || pathname === '/') {
      return NextResponse.next();
    }

    // Si intenta acceder a ruta protegida sin autenticación
    if (PROTECTED_ROUTES.some(route => pathname.startsWith(route))) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  } else {
    // Usuario autenticado - Obtener el rol directamente del token JWT
    // El objeto 'user' ya contiene los metadatos con el rol. ¡No se necesita otra consulta!
    const role = user.user_metadata?.role || 'CLIENT';
    console.log(`Usuario autenticado con rol: ${role}`); // Log para depuración
    const baseRoute = getBaseRouteByRole(role);
    
    // CASO 1: Usuario autenticado en página pública (excepto reset-password y forgot-password) o raíz -> Redirigir a su dashboard
    if ((isPublicRoute && !['/reset-password', '/forgot-password'].includes(pathname)) || pathname === '/') {
      // IMPORTANTE: Verificar si ya estamos en un bucle
      if (referer && referer.includes(baseRoute)) {
        return NextResponse.next();
      }
      
      console.log(`Redirigiendo a ${baseRoute} desde ${pathname}`); // Log para depuración
      return NextResponse.redirect(new URL(baseRoute, request.url));
    }
    
    // CASO ESPECIAL: Si es la página de reset-password, permitir acceso siempre
    // Esto es necesario para el flujo de recuperación de contraseña
    if (pathname === '/reset-password') {
      return NextResponse.next();
    }
    
    // CASO 2: Usuario autenticado en /dashboard genérico -> Redirigir a su dashboard específico
    if (pathname === '/dashboard') {
      return NextResponse.redirect(new URL(baseRoute, request.url));
    }
    
    // CASO 3: Usuario autenticado en ruta común (como /settings) -> Permitir acceso
    if (isCommonRoute) {
      return NextResponse.next();
    }
    
    // CASO 4: Usuario autenticado en ruta protegida que no corresponde a su rol
    if (PROTECTED_ROUTES.includes(currentBaseRoute) && currentBaseRoute !== baseRoute) {
      return NextResponse.redirect(new URL(baseRoute, request.url));
    }
    
    // CASO 5: Usuario autenticado en su ruta correcta -> Permitir acceso
    return NextResponse.next();
  }
  
  // Usuario NO autenticado
  
  // Si ya está en página pública o landing page, permitir acceso
  if (isPublicRoute || pathname === '/') {
    return NextResponse.next();
  }
  
  // Si intenta acceder a ruta protegida sin autenticación
  if (PROTECTED_ROUTES.some(route => pathname.startsWith(route))) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  // Para cualquier otra ruta no protegida
  return NextResponse.next();
}

// Ya no necesitamos esta función con Supabase, que maneja las cookies automáticamente

// Configurar qué rutas deben ser procesadas por el middleware
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