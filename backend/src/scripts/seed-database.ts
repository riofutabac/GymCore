import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

async function seedDatabase() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🌱 Iniciando seed de la base de datos...');
    
    // Limpiar datos existentes
    await prisma.accessLog.deleteMany();
    await prisma.saleItem.deleteMany();
    await prisma.sale.deleteMany();
    await prisma.product.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.membership.deleteMany();
    await prisma.user.deleteMany();
    await prisma.gym.deleteMany();
    
    console.log('🗑️ Datos existentes eliminados');
    
    // Crear gimnasio de prueba
    const gym = await prisma.gym.create({
      data: {
        name: 'GymCore Demo',
        address: 'Calle Principal 123, Ciudad',
        phone: '+1 234 567 8900',
        email: 'info@gymcore.demo',
        description: 'Gimnasio de demostración para GymCore',
        joinCode: 'GYM123',
        owner: {
          create: {
            email: 'owner@gym.com',
            password: await bcrypt.hash('password123', 10),
            name: 'Propietario Gym',
            role: 'SYS_ADMIN',
          }
        }
      }
    });
    
    console.log('🏢 Gimnasio creado:', gym.name);
    
    // Crear usuarios de prueba
    const manager = await prisma.user.create({
      data: {
        email: 'admin@gym.com',
        password: await bcrypt.hash('password123', 10),
        name: 'Manager Demo',
        role: 'MANAGER',
        staffOfGymId: gym.id,
      }
    });
    
    const reception = await prisma.user.create({
      data: {
        email: 'reception@gym.com',
        password: await bcrypt.hash('password123', 10),
        name: 'Recepcionista Demo',
        role: 'RECEPTION',
        staffOfGymId: gym.id,
      }
    });
    
    const client = await prisma.user.create({
      data: {
        email: 'client@gym.com',
        password: await bcrypt.hash('password123', 10),
        name: 'Cliente Demo',
        role: 'CLIENT',
        memberOfGymId: gym.id,
      }
    });
    
    console.log('👥 Usuarios creados');
    
    // Crear membresía para el cliente
    const membership = await prisma.membership.create({
      data: {
        userId: client.id,
        type: 'MONTHLY',
        status: 'ACTIVE',
        startDate: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        monthlyPrice: 50.00,
        totalPaid: 50.00,
        autoRenewal: true,
      }
    });
    
    // Crear pago para la membresía
    await prisma.payment.create({
      data: {
        amount: 50.00,
        method: 'CARD',
        status: 'COMPLETED',
        description: 'Pago mensual de membresía',
        membershipId: membership.id,
      }
    });
    
    console.log('💳 Membresía y pago creados');
    
    // Crear productos de prueba
    const products = [
      {
        name: 'Proteína Whey',
        description: 'Proteína en polvo sabor chocolate',
        price: 45.99,
        cost: 30.00,
        stock: 25,
        minStock: 5,
        category: 'Suplementos',
        sku: 'PROT001',
        gymId: gym.id,
      },
      {
        name: 'Botella de Agua',
        description: 'Botella deportiva 750ml',
        price: 12.99,
        cost: 8.00,
        stock: 50,
        minStock: 10,
        category: 'Accesorios',
        sku: 'BOT001',
        gymId: gym.id,
      },
      {
        name: 'Toalla Deportiva',
        description: 'Toalla de microfibra',
        price: 18.99,
        cost: 12.00,
        stock: 30,
        minStock: 5,
        category: 'Accesorios',
        sku: 'TOW001',
        gymId: gym.id,
      },
      {
        name: 'Creatina',
        description: 'Creatina monohidrato 300g',
        price: 29.99,
        cost: 20.00,
        stock: 15,
        minStock: 3,
        category: 'Suplementos',
        sku: 'CREA001',
        gymId: gym.id,
      },
    ];
    
    for (const productData of products) {
      await prisma.product.create({ data: productData });
    }
    
    console.log('📦 Productos creados');
    
    // Crear venta de prueba
    const sale = await prisma.sale.create({
      data: {
        total: 58.98,
        subtotal: 58.98,
        tax: 0,
        discount: 0,
        notes: 'Venta de prueba',
        sellerId: reception.id,
        gymId: gym.id,
      }
    });
    
    // Crear items de venta
    const product1 = await prisma.product.findFirst({ where: { sku: 'PROT001' } });
    const product2 = await prisma.product.findFirst({ where: { sku: 'BOT001' } });
    
    if (product1 && product2) {
      await prisma.saleItem.createMany({
        data: [
          {
            saleId: sale.id,
            productId: product1.id,
            quantity: 1,
            unitPrice: 45.99,
            total: 45.99,
          },
          {
            saleId: sale.id,
            productId: product2.id,
            quantity: 1,
            unitPrice: 12.99,
            total: 12.99,
          }
        ]
      });
      
      // Actualizar stock
      await prisma.product.update({
        where: { id: product1.id },
        data: { stock: { decrement: 1 } }
      });
      
      await prisma.product.update({
        where: { id: product2.id },
        data: { stock: { decrement: 1 } }
      });
    }
    
    console.log('🛒 Venta de prueba creada');
    
    // Crear logs de acceso
    await prisma.accessLog.createMany({
      data: [
        {
          type: 'QR_CODE',
          status: 'GRANTED',
          method: 'QR_SCAN',
          userId: client.id,
          gymId: gym.id,
        },
        {
          type: 'MANUAL',
          status: 'GRANTED',
          method: 'MANUAL_ENTRY',
          userId: client.id,
          gymId: gym.id,
        }
      ]
    });
    
    console.log('📋 Logs de acceso creados');
    
    console.log('\n✅ Seed completado exitosamente!');
    console.log('\n👤 Usuarios de prueba:');
    console.log('📧 Propietario: owner@gym.com / password123');
    console.log('📧 Manager: admin@gym.com / password123');
    console.log('📧 Recepción: reception@gym.com / password123');
    console.log('📧 Cliente: client@gym.com / password123');
    console.log('\n🏢 Código de gimnasio: GYM123');
    
  } catch (error) {
    console.error('❌ Error en seed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedDatabase();