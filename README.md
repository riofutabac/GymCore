# 🏋️ GymCore Backend - Sistema de Gestión de Gimnasios

Sistema modular para gestión integral de gimnasios desarrollado con NestJS, Prisma y PostgreSQL.

## 🚀 Configuración Rápida

### 📋 Prerrequisitos

- **Node.js** >= 18.0.0
- **Docker Desktop** (recomendado para base de datos)
- **Git**
- **Postman** (para testing)

### ⚠️ IMPORTANTE: Verificar Puerto Docker

**Antes de continuar, verificar que no tengas otro Docker corriendo en el puerto 5432:**

```bash
# Windows - Verificar servicios activos
services.msc

# O verificar puertos en uso
netstat -an | findstr :5432
netstat -an | findstr :5433
```

Si tienes otro PostgreSQL/Docker corriendo, nuestro proyecto usa el **puerto 5433** para evitar conflictos.

## 🐳 Instalación con Docker (Recomendado)

### 1. Clonar y entrar al proyecto
```bash
git clone (https://github.com/riofutabac/GymCore.git)
cd GYMCORE/backend
```

### 2. Configurar variables de entorno
```bash
# Copiar el archivo de ejemplo
cp .env.example .env

# Editar .env con tus configuraciones
# DATABASE_URL="postgresql://gymcore:dev_password@localhost:5433/gymcore_dev?schema=public"
```

### 3. Levantar PostgreSQL con Docker
```bash
# Crear y correr contenedor PostgreSQL en puerto 5433
docker run --name gymcore-postgres \
  -e POSTGRES_DB=gymcore_dev \
  -e POSTGRES_USER=gymcore \
  -e POSTGRES_PASSWORD=dev_password \
  -p 5433:5432 \
  -d postgres:15

# Verificar que está corriendo
docker ps
```

### 4. Instalar dependencias
```bash
npm install
```

### 5. Configurar base de datos
```bash
# Generar cliente Prisma
npx prisma generate

# Aplicar schema a la base de datos
npx prisma db push

# (Opcional) Ver la base de datos en el navegador
npx prisma studio
```

### 6. Ejecutar el backend
```bash
# Modo desarrollo (con hot-reload)
npm run start:dev

# Modo producción
npm run build
npm run start
```

**✅ El backend estará corriendo en:** `http://localhost:3000`

## 🗄️ Instalación sin Docker (PostgreSQL Local)

Si prefieres usar PostgreSQL instalado localmente:

### 1. Instalar PostgreSQL
- Descargar desde: https://www.postgresql.org/download/
- **Configurar en puerto 5433** (no el 5432 por defecto)

### 2. Crear base de datos
```sql
-- Conectar a PostgreSQL
psql -U postgres -p 5433

-- Crear base de datos y usuario
CREATE DATABASE gymcore_dev;
CREATE USER gymcore WITH PASSWORD 'dev_password';
GRANT ALL PRIVILEGES ON DATABASE gymcore_dev TO gymcore;
```

### 3. Continuar con pasos 4-6 de arriba

## 🧪 Testing con Postman

### Importar Collection

1. Abrir Postman
2. Importar esta collection:

```json
{
  "info": {
    "name": "GymCore API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:3000"
    },
    {
      "key": "token",
      "value": ""
    }
  ]
}
```

### 🔑 Endpoints Principales

#### **Autenticación (Sin token requerido)**

```bash
# Login
POST {{baseUrl}}/api/auth/login
Content-Type: application/json

{
  "email": "admin@gym.com",
  "password": "password123"
}

# Register
POST {{baseUrl}}/api/auth/register
Content-Type: application/json

{
  "email": "newuser@gym.com",
  "password": "password123",
  "name": "Nuevo Usuario"
}
```

#### **Usuarios de Prueba Disponibles:**
- **Manager**: `admin@gym.com` / `password123` → Token: `mock-token-1`
- **Cliente**: `client@gym.com` / `password123` → Token: `mock-token-2`

#### **Gimnasios (Con token requerido)**

```bash
# Ver todos los gimnasios
GET {{baseUrl}}/api/gyms
Authorization: Bearer mock-token-1

# Crear gimnasio
POST {{baseUrl}}/api/gyms
Authorization: Bearer mock-token-1
Content-Type: application/json

{
  "name": "Mi Gimnasio",
  "address": "Calle 123, Ciudad",
  "description": "El mejor gimnasio de la ciudad",
  "phone": "+1234567890",
  "email": "info@migym.com"
}

# Mi gimnasio
GET {{baseUrl}}/api/gyms/my-gym
Authorization: Bearer mock-token-1

# Unirse por código
POST {{baseUrl}}/api/gyms/join-by-code
Authorization: Bearer mock-token-2
Content-Type: application/json

{
  "joinCode": "ABC123"
}
```

#### **Perfil de Usuario**

```bash
# Ver mi perfil
GET {{baseUrl}}/api/auth/profile
Authorization: Bearer mock-token-1
```

## 🔧 Comandos Útiles

```bash
# Ver logs de Docker
docker logs gymcore-postgres

# Resetear base de datos
npx prisma migrate reset

# Ver schema actual
npx prisma studio

# Verificar conexión a BD
npx prisma db push

# Parar contenedor Docker
docker stop gymcore-postgres

# Reiniciar contenedor Docker
docker start gymcore-postgres
```

## 🚨 Solución de Problemas

### ❌ Error: "Port 5432 is already in use"
```bash
# Cambiar puerto en .env
DATABASE_URL="postgresql://gymcore:dev_password@localhost:5434/gymcore_dev?schema=public"

# Y recrear contenedor Docker
docker run --name gymcore-postgres -p 5434:5432 ...
```

### ❌ Error: "Cannot connect to database"
```bash
# Verificar que Docker está corriendo
docker ps

# Verificar logs del contenedor
docker logs gymcore-postgres

# Reiniciar contenedor
docker restart gymcore-postgres
```

### ❌ Error: "Prisma Client not generated"
```bash
npx prisma generate
```

## 📁 Estructura del Proyecto

```
backend/
├── prisma/
│   ├── schema.prisma          # Schema de base de datos
│   └── migrations/            # Migraciones
├── src/
│   ├── auth/                  # Autenticación
│   ├── gyms/                  # Gestión de gimnasios
│   ├── modules/
│   │   ├── memberships/       # Membresías
│   │   ├── inventory/         # Inventario
│   │   └── access-control/    # Control de acceso
│   ├── common/                # Guards, decorators, etc.
│   └── prisma/                # Servicio Prisma
├── .env                       # Variables de entorno
└── package.json
```

## 👥 Roles Disponibles

- **CLIENT**: Socio del gimnasio (acceso básico)
- **RECEPTION**: Personal de recepción (ventas, validación)
- **MANAGER**: Gerente (gestión completa)
- **SYS_ADMIN**: Administrador del sistema

## 🚀 Próximos Pasos

1. **Frontend**: Desarrollar interfaz con Next.js
2. **Autenticación real**: Integrar Supabase Auth
3. **Pagos**: Integrar Stripe
4. **QR real**: Implementar generación real de QR
5. **Notificaciones**: Email/SMS reales

---

**¿Problemas?** Crear un issue en el repositorio o contactar al equipo de desarrollo.
