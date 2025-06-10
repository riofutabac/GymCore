# 🏋️ GymCore Backend - Refactorizado

## 🚀 Mejoras Implementadas

### ✅ Seguridad y Autenticación
- **JWT Real**: Implementación completa de JSON Web Tokens con `@nestjs/jwt`
- **Validación Robusta**: Tokens con expiración configurable y validación en cada request
- **Manejo de Errores**: Excepciones HTTP específicas en lugar de errores genéricos
- **Logging Estructurado**: Logger de NestJS en lugar de `console.log`

### ✅ Arquitectura y Código Limpio
- **Eliminación de Redundancia**: Un solo `AuthGuard` consolidado
- **Servicios Centralizados**: `UserContextService` para lógica común de usuarios
- **Interceptores Globales**: Manejo consistente de respuestas y errores
- **Decoradores Personalizados**: `@CurrentGymId()` para eliminar código repetitivo

### ✅ Manejo de Errores Mejorado
- **Filtro Global**: `HttpExceptionFilter` para respuestas de error consistentes
- **Excepciones Específicas**: `BadRequestException`, `NotFoundException`, etc.
- **Logging de Errores**: Trazabilidad completa de errores con stack traces

### ✅ Configuración Robusta
- **Variables de Entorno**: Configuración centralizada con `@nestjs/config`
- **Validación de Entrada**: `ValidationPipe` global con configuración avanzada
- **CORS Configurado**: Configuración segura para múltiples entornos

## 🔧 Configuración

### Variables de Entorno Requeridas

Crea un archivo `.env` basado en `.env.example`:

```bash
cp .env.example .env
```

Variables críticas:
- `JWT_SECRET`: Clave secreta para firmar tokens JWT
- `DATABASE_URL`: URL de conexión a PostgreSQL
- `FRONTEND_URL`: URL del frontend para CORS

### Instalación y Ejecución

```bash
# Instalar dependencias
npm install

# Generar cliente Prisma
npx prisma generate

# Aplicar migraciones
npx prisma migrate deploy

# Poblar base de datos
npm run seed

# Ejecutar en desarrollo
npm run start:dev
```

## 🏗️ Arquitectura Mejorada

### Estructura de Carpetas
```
src/
├── auth/                     # Autenticación JWT
├── common/                   # Código compartido
│   ├── decorators/          # Decoradores personalizados
│   ├── filters/             # Filtros globales
│   ├── guards/              # Guards de autenticación/autorización
│   ├── interceptors/        # Interceptores globales
│   ├── interfaces/          # Interfaces TypeScript
│   └── services/            # Servicios compartidos
├── modules/                 # Módulos de negocio
│   ├── access-control/      # Control de acceso QR
│   ├── inventory/           # Inventario y ventas
│   └── memberships/         # Gestión de membresías
├── gyms/                    # Gestión de gimnasios
└── prisma/                  # Configuración de base de datos
```

### Flujo de Request Mejorado

1. **Validación Global**: `ValidationPipe` valida DTOs automáticamente
2. **Autenticación**: `AuthGuard` verifica JWT y adjunta usuario al request
3. **Autorización**: `RoleGuard` verifica permisos basados en roles
4. **Enriquecimiento**: `UserEnrichmentInterceptor` agrega datos completos del usuario
5. **Procesamiento**: Controlador ejecuta lógica de negocio
6. **Respuesta**: `ResponseInterceptor` formatea respuesta consistente
7. **Manejo de Errores**: `HttpExceptionFilter` captura y formatea errores

## 🔐 Seguridad

### JWT Implementation
- Tokens firmados con clave secreta configurable
- Expiración configurable (default: 7 días)
- Validación en cada request protegido
- Payload mínimo para reducir tamaño del token

### Autorización por Roles
```typescript
@Roles([Role.MANAGER, Role.SYS_ADMIN])
@UseGuards(AuthGuard, RoleGuard)
async createProduct() {
  // Solo gerentes y administradores pueden crear productos
}
```

### Validación de Entrada
```typescript
// DTOs con validación automática
export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @Min(0)
  price: number;
}
```

## 📊 Logging y Monitoreo

### Logger Estructurado
```typescript
private readonly logger = new Logger(ServiceName.name);

// Logs informativos
this.logger.log(`User ${userId} performed action`);

// Logs de error con stack trace
this.logger.error(`Error message: ${error.message}`, error.stack);
```

### Health Check
```bash
GET /health
```
Respuesta:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 3600,
  "environment": "development"
}
```

## 🧪 Testing

### Endpoints de Prueba

Todos los endpoints requieren autenticación excepto:
- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET /health`

### Usuarios de Prueba
Después de ejecutar `npm run seed`:

- **Admin**: `admin@gym.com` / `password123`
- **Manager**: `manager@gym.com` / `password123`
- **Reception**: `reception@gym.com` / `password123`
- **Client**: `client@gym.com` / `password123`

### Ejemplo de Request Autenticado
```bash
curl -X GET http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🚀 Próximos Pasos

### Mejoras Adicionales Recomendadas

1. **Rate Limiting**: Implementar `@nestjs/throttler`
2. **Caching**: Integrar Redis para cache de consultas frecuentes
3. **File Upload**: Configurar multer para subida de archivos
4. **API Documentation**: Integrar Swagger/OpenAPI
5. **Testing**: Implementar tests unitarios y e2e
6. **Monitoring**: Integrar APM (Application Performance Monitoring)

### Configuración de Producción

1. **Variables de Entorno**: Configurar todas las variables en `.env`
2. **Base de Datos**: Usar PostgreSQL en producción
3. **Secrets**: Usar gestores de secretos (AWS Secrets Manager, etc.)
4. **Logging**: Configurar logs estructurados para agregación
5. **Monitoring**: Implementar health checks y métricas

## 📝 Notas de Migración

### Cambios Breaking
- Los tokens de autenticación ahora son JWT reales
- Estructura de respuesta de error estandarizada
- Validación más estricta en DTOs

### Compatibilidad
- Todas las rutas existentes mantienen compatibilidad
- Respuestas de éxito mantienen el formato `{ success: true, data: ... }`
- Códigos de estado HTTP más precisos

---

**¡El backend ahora está listo para producción!** 🎉