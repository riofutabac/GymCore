# Sistema de Chat en Tiempo Real - GymCore

## Descripción General

El sistema de chat en tiempo real de GymCore permite la comunicación bidireccional entre propietarios de gimnasios y gerentes. Utiliza WebSockets para proporcionar una experiencia de mensajería instantánea con las siguientes características:

- Comunicación en tiempo real entre propietarios y gerentes
- Persistencia de mensajes en la base de datos
- Notificaciones de nuevos mensajes
- Interfaz de usuario intuitiva y responsiva

## Arquitectura

### Backend

- **NestJS** como framework principal
- **Socket.IO** para la comunicación WebSocket
- **Prisma** para el modelado y persistencia de datos
- **Supabase Auth** para la autenticación

### Frontend

- **Next.js** y **React** para la interfaz de usuario
- **Zustand** para la gestión del estado global
- **socket.io-client** para la conexión WebSocket con el backend
- **Tailwind CSS** y **shadcn/ui** para los componentes de UI

## Modelos de Datos

### Conversation

```typescript
interface Conversation {
  id: string;
  participants: User[];
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}
```

### Message

```typescript
interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  sender?: User;
  content: string;
  read: boolean;
  createdAt: Date;
}
```

## Flujo de Comunicación

1. **Autenticación**:
   - El usuario inicia sesión en la aplicación
   - El token de autenticación se utiliza para establecer la conexión WebSocket

2. **Conexión WebSocket**:
   - Al cargar la aplicación, se establece automáticamente una conexión WebSocket
   - El token de autenticación se envía en la conexión para validar al usuario

3. **Iniciar/Cargar Conversaciones**:
   - Los propietarios pueden ver todas sus conversaciones con gerentes
   - Los gerentes pueden iniciar una conversación con el propietario del gimnasio actual

4. **Envío de Mensajes**:
   - Los mensajes se envían a través del WebSocket
   - El backend los persiste en la base de datos y los reenvía a todos los participantes conectados

5. **Notificaciones**:
   - Se muestran notificaciones para mensajes nuevos cuando la conversación no está activa

## Endpoints API REST

### Conversaciones

- `GET /api/chat/conversations` - Obtener todas las conversaciones del usuario actual
- `POST /api/chat/conversations` - Iniciar una nueva conversación
- `GET /api/chat/conversations/:id/messages` - Obtener mensajes de una conversación específica

## Eventos WebSocket

### Cliente a Servidor

- `joinConversation` - Unirse a una sala de conversación específica
- `sendMessage` - Enviar un nuevo mensaje a una conversación

### Servidor a Cliente

- `newMessage` - Recibir un nuevo mensaje
- `error` - Recibir notificación de error

## Cómo Probar el Sistema de Chat

1. **Configuración Inicial**:
   - Asegúrate de que el backend esté ejecutándose
   - Verifica que las variables de entorno estén configuradas correctamente:
     - `NEXT_PUBLIC_API_URL` debe apuntar a la URL del backend

2. **Prueba como Propietario**:
   - Inicia sesión como propietario de un gimnasio
   - Navega a la sección de chat (`/owner/chat`)
   - Deberías ver la lista de conversaciones con tus gerentes

3. **Prueba como Gerente**:
   - Inicia sesión como gerente de un gimnasio
   - Navega a la sección de chat (`/manager/chat`)
   - Se iniciará automáticamente una conversación con el propietario del gimnasio

4. **Envío de Mensajes**:
   - Selecciona una conversación
   - Escribe un mensaje en el campo de texto
   - Presiona Enter o haz clic en el botón de enviar
   - El mensaje debería aparecer inmediatamente en tu ventana y en la del destinatario

5. **Prueba de Tiempo Real**:
   - Abre dos navegadores o pestañas diferentes
   - Inicia sesión como propietario en uno y como gerente en otro
   - Envía mensajes entre ambos para verificar la comunicación en tiempo real

## Solución de Problemas

### El WebSocket no se conecta

- Verifica que el backend esté ejecutándose
- Comprueba que la URL del backend sea correcta
- Asegúrate de que el token de autenticación sea válido

### Los mensajes no se envían o reciben

- Verifica la conexión WebSocket en la consola del navegador
- Comprueba que estés unido a la conversación correcta
- Verifica que no haya errores en la consola

### Errores de autenticación

- Asegúrate de haber iniciado sesión correctamente
- Verifica que el token no haya expirado
- Intenta cerrar sesión y volver a iniciarla

## Próximas Mejoras

- Indicadores de "escribiendo..."
- Estado de lectura de mensajes
- Envío de archivos y multimedia
- Búsqueda de mensajes
- Notificaciones push
