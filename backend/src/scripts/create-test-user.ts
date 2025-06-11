import { PrismaClient } from '@prisma/client';


async function createTestUser() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔧 Creating test user...');
    
    // Eliminar usuario existente si existe
    await prisma.user.deleteMany({
      where: {
        email: 'admin@gym.com'
      }
    });
    console.log('🗑️ Deleted existing user if any');

    // Esperar a que el trigger cree el usuario
    console.log('\n⏳ Esperando 5 segundos para que el trigger cree el usuario...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Verificar que se creó el usuario
    const user = await prisma.user.findUnique({
      where: { email: 'admin@gym.com' },
    });

    if (!user) {
      console.log('\n❌ ERROR: Usuario no encontrado. Asegúrate de crearlo primero en Supabase Auth.');
      return;
    }

    // Actualizar el rol a OWNER
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        role: 'OWNER',
        isActive: true,
      },
    });

    console.log('\n✅ Usuario actualizado:', updatedUser);
  } catch (error) {
    console.error('❌ Error creating test user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();
