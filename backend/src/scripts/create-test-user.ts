import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

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
    
    // Hash de la contraseña "password123"
    const plainPassword = 'password123';
    const hashedPassword = await bcrypt.hash(plainPassword, 10);
    console.log('🔒 Plain password:', plainPassword);
    console.log('🔒 Hashed password:', hashedPassword);
    
    // Crear nuevo usuario con contraseña hasheada
    const user = await prisma.user.create({
      data: {
        email: 'admin@gym.com',
        password: hashedPassword,
        name: 'Admin User',
        role: 'MANAGER',
      }
    });
    
    console.log('✅ Test user created successfully:', {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    });
    
    // Verificar que la contraseña funciona
    console.log('\n🔍 Testing password verification...');
    const isValid = await bcrypt.compare(plainPassword, user.password);
    console.log('✅ Password verification test result:', isValid ? 'PASS ✅' : 'FAIL ❌');
    
    if (isValid) {
      console.log('\n🎉 SUCCESS! You can now login with:');
      console.log('📧 Email: admin@gym.com');
      console.log('🔑 Password: password123');
    } else {
      console.log('\n❌ ERROR: Password verification failed!');
    }
    
  } catch (error) {
    console.error('❌ Error creating test user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();
