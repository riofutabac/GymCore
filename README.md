# 🏋️ GymCore - Sistema de Gestión de Gimnasios

## 📝 Descripción del Proyecto

**GymCore** es una plataforma integral diseñada para la gestión eficiente de gimnasios. Nuestro sistema modular abarca desde el control de acceso con códigos QR dinámicos hasta la administración de membresías, inventario y punto de venta. Desarrollado con una arquitectura moderna de microservicios usando **NestJS** para el backend y **Next.js** para el frontend, junto con **Prisma ORM** y **PostgreSQL** como base de datos, GymCore busca simplificar las operaciones diarias y potenciar el crecimiento de tu negocio.

### Características Principales:

* **Control de Acceso con QR:** Acceso rápido, seguro y sin contacto.
* **Gestión de Membresías:** Administración centralizada de socios, tipos de membresía, estados y renovaciones.
* **Punto de Venta (POS):** Control de inventario y registro de ventas de productos dentro del gimnasio.
* **Administración de Usuarios y Roles:** Diferentes roles (Cliente, Recepción, Gerente, Administrador del Sistema) con permisos específicos.
* **Métricas y Paneles:** Dashboards intuitivos para gerentes y recepcionistas con datos clave.

## 🚀 Configuración y Levantamiento del Proyecto

### 📋 Prerrequisitos

- **Node.js** >= 18.0.0
- **Docker Desktop** (recomendado para base de datos)
- **Git**
- **Postman** (para testing)

### ⚠️ IMPORTANTE: Verificar Puertos de Docker

Antes de continuar, es crucial que verifiques que los puertos **5432** (para PostgreSQL) y **6379** (para Redis) no estén en uso por otras aplicaciones en tu sistema. Nuestro `docker-compose.yml` utiliza el puerto **5433** para PostgreSQL para evitar conflictos comunes.

```bash
# Windows - Verificar puertos en uso
netstat -an | findstr :5432
netstat -an | findstr :5433
netstat -an | findstr :6379

# Linux/macOS
lsof -i :5432
lsof -i :5433
lsof -i :6379
```

## 🐳 Instalación con Docker (Recomendado)

### 1. Clonar y entrar al proyecto
```bash
git clone https://github.com/riofutabac/GymCore.git
cd GymCore
```

### 2. Configurar variables de entorno
```bash
# En la raíz del proyecto
cp .env.example .env
```

Abre el archivo `.env` y asegúrate de que las variables estén configuradas correctamente:

```env
# backend/.env
DATABASE_URL="postgresql://postgres:password@postgres:5432/gymcore_db"
REDIS_URL="redis://redis:6379"
PORT=3001
NODE_ENV=development
```

### 3. Levantar servicios con Docker
```bash
# Desde la raíz del proyecto
docker-compose up -d

# Verificar que estén corriendo
docker ps
```

### 4. Configurar el Backend
```bash
cd backend
npm install

# Generar cliente Prisma
npx prisma generate

# Aplicar schema a la base de datos
npx prisma db push
```

### 5. Poblar base de datos con datos de prueba
```bash
# Siembra completa (elimina todos los datos existentes)
npm run seed

# Opcional: Solo crear/actualizar usuario de prueba
npm run create-test-user

# Ver la base de datos en el navegador
npx prisma studio
```

### 6. Ejecutar el Backend
```bash
# Modo desarrollo (con hot-reload)
npm run start:dev

# El backend estará en: http://localhost:3001
# API endpoints en: http://localhost:3001/api
```

### 7. Configurar y ejecutar el Frontend
```bash
# Nueva terminal
cd frontend
npm install
npm run dev

# El frontend estará en: http://localhost:3000
```

## 🗄️ Instalación sin Docker (PostgreSQL Local)

### 1. Instalar PostgreSQL y Redis localmente
- PostgreSQL: https://www.postgresql.org/download/ (puerto 5433)
- Redis: https://redis.io/download/

### 2. Crear base de datos
```sql
-- Conectar a PostgreSQL (puerto 5433)
psql -U postgres -p 5433

-- Crear base de datos y usuario
CREATE DATABASE gymcore_db;
CREATE USER postgres WITH PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE gymcore_db TO postgres;
\q
```

### 3. Configurar variables de entorno locales
```env
# backend/.env
DATABASE_URL="postgresql://postgres:password@localhost:5433/gymcore_db?schema=public"
REDIS_URL="redis://localhost:6379"
PORT=3001
NODE_ENV=development
```

### 4. Continuar con pasos 4-7 de la instalación con Docker

## 📁 Estructura del Proyecto

```
GymCore/
├── backend/                  # Proyecto NestJS (API RESTful)
│   ├── prisma/               # Esquema de la base de datos y migraciones
│   │   ├── migrations/       # Historial de migraciones
│   │   └── schema.prisma     # Definición del modelo de datos
│   ├── src/                  # Código fuente del backend
│   │   ├── auth/             # Módulo de autenticación (login, registro)
│   │   ├── common/           # Decoradores, guards, enums (roles de usuario)
│   │   ├── config/           # Configuraciones (ej. Supabase)
│   │   ├── gyms/             # Módulo de gestión de gimnasios
│   │   ├── modules/          # Módulos principales de la aplicación
│   │   │   ├── access-control/ # Control de acceso (QR)
│   │   │   ├── inventory/    # Gestión de inventario y ventas (POS)
│   │   │   └── memberships/  # Gestión de membresías y pagos
│   │   ├── prisma/           # Servicio de Prisma ORM
│   │   └── scripts/          # Scripts utilitarios (siembra, crear usuario)
│   └── package.json          # Dependencias y scripts de Node.js
├── frontend/                 # Proyecto Next.js (Interfaz de usuario)
│   ├── src/                  # Código fuente del frontend
│   │   ├── app/              # Rutas y páginas de Next.js
│   │   │   ├── (auth)/       # Páginas de autenticación (login, registro)
│   │   │   └── (dashboard)/  # Páginas del dashboard (admin, member, reception)
│   │   ├── components/       # Componentes reutilizables (UI, módulos)
│   │   └── lib/              # Utilidades y configuración de API
│   └── package.json          # Dependencias y scripts de Next.js
└── docker-compose.yml        # Orquestación de servicios Docker
```

## ⚙️ Tecnologías Utilizadas

### Backend:
- **NestJS**: Framework progresivo de Node.js para aplicaciones escalables
- **Prisma ORM**: ORM de nueva generación para Node.js y TypeScript
- **PostgreSQL**: Base de datos relacional robusta
- **bcrypt**: Hashing de contraseñas
- **class-validator/class-transformer**: Validación de DTOs
- **JWT**: Autenticación (actualmente mockeado, migración a Supabase planeada)

### Frontend:
- **Next.js**: Framework de React con renderizado del lado del servidor
- **React**: Biblioteca para construir interfaces de usuario
- **TypeScript**: JavaScript con tipado estático
- **Tailwind CSS**: Framework CSS para interfaces personalizadas
- **Shadcn/ui**: Componentes UI basados en Tailwind CSS y Radix UI
- **Lucide React**: Biblioteca de iconos
- **axios**: Cliente HTTP para solicitudes a la API

### Contenedorización:
- **Docker** & **Docker Compose**: Orquestación de base de datos y Redis

## 🧪 Testing con Postman

### 🔑 Endpoints Principales

Todos los endpoints están prefijados con `/api`. Base URL: `http://localhost:3001/api`

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
  "email": "nuevo.usuario@example.com",
  "password": "password123",
  "name": "Nuevo Usuario"
}
```

#### **Endpoints Protegidos (Con token requerido)**

Incluir header: `Authorization: Bearer YOUR_AUTH_TOKEN`

```bash
# Perfil del usuario
GET {{baseUrl}}/api/auth/me

# Mi gimnasio
GET {{baseUrl}}/api/gyms/my

# Unirse a gimnasio
POST {{baseUrl}}/api/gyms/join
Content-Type: application/json
{
  "joinCode": "GYM123"
}

# Productos (Inventario)
GET {{baseUrl}}/api/inventory/products

# Mi código QR (solo CLIENT)
GET {{baseUrl}}/api/access-control/my-qr

# Validar QR (RECEPTION, MANAGER)
POST {{baseUrl}}/api/access-control/validate-qr
```

### 👤 Usuarios de Prueba Disponibles

Después de ejecutar `npm run seed`, tendrás estos usuarios:

- **Propietario (SYS_ADMIN):** `owner@gym.com` / `password123`
- **Gerente (MANAGER):** `admin@gym.com` / `password123`
- **Recepcionista (RECEPTION):** `reception@gym.com` / `password123`
- **Cliente (CLIENT):** `client@gym.com` / `password123`

**Código de gimnasio:** `GYM123`

## 👥 Roles Disponibles

- **CLIENT**: Socio del gimnasio (acceso básico)
- **RECEPTION**: Personal de recepción (ventas, validación de acceso)
- **MANAGER**: Gerente (gestión completa del gimnasio)
- **SYS_ADMIN**: Administrador del sistema (propietario)

## 🔧 Comandos Útiles

### Backend (desde directorio `backend/`):
```bash
# Desarrollo
npm run start:dev

# Producción
npm run build
npm run start

# Base de datos
npm run seed                    # Borra y rellena con datos de prueba
npm run create-test-user        # Crea/actualiza usuario admin@gym.com
npx prisma generate            # Regenera cliente Prisma
npx prisma db push             # Sincroniza schema con BD
npx prisma studio              # Interface web para ver BD
```

### Docker:
```bash
# Gestión de contenedores
docker-compose up -d           # Iniciar servicios
docker-compose stop            # Detener servicios
docker-compose down            # Detener y eliminar contenedores
docker logs gymcore-postgres   # Ver logs de PostgreSQL
docker ps                      # Ver contenedores activos
```

## 🚨 Solución de Problemas

### ❌ Error: "Port 5432 is already in use"
```bash
# Cambiar puerto en docker-compose.yml
# De: "5433:5432" a "5434:5432"
# Y actualizar DATABASE_URL en .env

# Recrear contenedor
docker-compose down
docker-compose up -d
```

### ❌ Error: "Cannot connect to database"
```bash
# Verificar Docker
docker ps
docker logs gymcore-postgres

# Reiniciar contenedor
docker restart gymcore-postgres

# Verificar variables de entorno en backend/.env
```

### ❌ Error: "Prisma Client not generated"
```bash
cd backend
npx prisma generate
```

### ❌ Error: "Membresía no activa" en panel de cliente
```bash
cd backend
npm run seed  # Resetea y crea membresía activa

# Verificar en Prisma Studio que client@gym.com tenga 
# membresía con status 'ACTIVE' y expiresAt futura
npx prisma studio
```

## 🚀 Próximos Pasos e Integraciones Futuras

### 1. **Autenticación Real con Supabase**
Migración del sistema actual de autenticación mock a **Supabase Auth** para autenticación robusta y gestionada.

**Pasos planificados:**
- Configurar proyecto Supabase
- Integrar SDK de Supabase (`@supabase/supabase-js`)
- Actualizar `auth.service.ts` para usar API de Supabase
- Mantener sincronización con base de datos local para roles específicos

### 2. **Notificaciones por Email (SendGrid)**
Envío de correos electrónicos para confirmaciones, recordatorios de membresía, etc.

**Pasos planificados:**
- Configurar cuenta SendGrid
- Crear módulo `NotificationsModule`
- Integrar SDK SendGrid (`@sendgrid/mail`)
- Endpoints protegidos por roles para envío de correos

### 3. **Notificaciones por SMS (Twilio)**
Mensajes de texto para códigos de verificación y alertas de acceso.

**Pasos planificados:**
- Configurar cuenta Twilio
- Extender `NotificationsService` para SMS
- Integrar SDK Twilio (`twilio`)
- Endpoints para envío de SMS

### 4. **Pasarelas de Pago Reales**
Actualmente los pagos están simulados. Integración con Stripe planeada para fase posterior.

## 📊 Datos de Prueba Incluidos

El script `npm run seed` crea:

- **1 Gimnasio:** "GymCore Demo" con código `GYM123`
- **4 Usuarios:** Uno por cada rol disponible
- **1 Membresía activa:** Para el cliente demo
- **4 Productos:** Suplementos y accesorios con stock
- **1 Venta de prueba:** Con 2 productos
- **Logs de acceso:** Entradas QR y manuales

---

**¿Problemas?** Crear un issue en el repositorio o contactar al equipo de desarrollo.

**Repositorio:** https://github.com/riofutabac/GymCore.git
