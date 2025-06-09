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
    
    // Crear más clientes para tener datos de prueba
    const clients = [];
    for (let i = 1; i <= 5; i++) {
      const newClient = await prisma.user.create({
        data: {
          email: `cliente${i}@gym.com`,
          password: await bcrypt.hash('password123', 10),
          name: `Cliente ${i}`,
          role: 'CLIENT',
          memberOfGymId: gym.id,
        }
      });
      clients.push(newClient);
    }
    
    console.log('👥 Usuarios creados');
    
    // Crear membresías para todos los clientes
    const allClients = [client, ...clients];
    for (const clientUser of allClients) {
      const membership = await prisma.membership.create({
        data: {
          userId: clientUser.id,
          type: 'MONTHLY',
          status: Math.random() > 0.3 ? 'ACTIVE' : 'EXPIRED', // 70% activos
          startDate: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000), // Últimos 90 días
          expiresAt: new Date(Date.now() + (Math.random() > 0.3 ? 30 : -10) * 24 * 60 * 60 * 1000), // Algunos expirados
          monthlyPrice: Math.random() > 0.5 ? 50.00 : 75.00, // Precios variados
          totalPaid: Math.random() * 300 + 50,
          autoRenewal: Math.random() > 0.5,
        }
      });
      
      // Crear algunos pagos para cada membresía
      const paymentsCount = Math.floor(Math.random() * 3) + 1;
      for (let j = 0; j < paymentsCount; j++) {
        await prisma.payment.create({
          data: {
            amount: membership.monthlyPrice,
            method: ['CASH', 'CARD', 'TRANSFER'][Math.floor(Math.random() * 3)] as any,
            status: 'COMPLETED',
            description: `Pago de membresía ${j + 1}`,
            membershipId: membership.id,
          }
        });
      }
    }
    
    console.log('💳 Membresías y pagos creados');
    
    // Crear productos de prueba con más variedad
    const productCategories = [
      { category: 'Suplementos', products: [
        { name: 'Proteína Whey Chocolate', price: 45.99, cost: 30.00, stock: 25 },
        { name: 'Proteína Whey Vainilla', price: 45.99, cost: 30.00, stock: 20 },
        { name: 'Creatina Monohidrato', price: 29.99, cost: 20.00, stock: 15 },
        { name: 'BCAA Aminoácidos', price: 35.99, cost: 24.00, stock: 18 },
        { name: 'Pre-Entreno', price: 39.99, cost: 26.00, stock: 12 }
      ]},
      { category: 'Accesorios', products: [
        { name: 'Botella de Agua 750ml', price: 12.99, cost: 8.00, stock: 50 },
        { name: 'Toalla Deportiva', price: 18.99, cost: 12.00, stock: 30 },
        { name: 'Guantes de Entrenamiento', price: 24.99, cost: 16.00, stock: 22 },
        { name: 'Correa de Levantamiento', price: 34.99, cost: 22.00, stock: 15 }
      ]},
      { category: 'Ropa', products: [
        { name: 'Camiseta GymCore', price: 19.99, cost: 12.00, stock: 35 },
        { name: 'Shorts Deportivos', price: 24.99, cost: 16.00, stock: 28 },
        { name: 'Sudadera con Capucha', price: 39.99, cost: 25.00, stock: 20 }
      ]}
    ];
    
    let productCounter = 1;
    for (const categoryData of productCategories) {
      for (const productData of categoryData.products) {
        await prisma.product.create({
          data: {
            ...productData,
            category: categoryData.category,
            sku: `PROD${productCounter.toString().padStart(3, '0')}`,
            minStock: 5,
            gymId: gym.id,
          }
        });
        productCounter++;
      }
    }
    
    console.log('📦 Productos creados');
    
    // Crear ventas de prueba
    const products = await prisma.product.findMany();
    for (let i = 0; i < 10; i++) {
      const randomProducts = products.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 3) + 1);
      const subtotal = randomProducts.reduce((sum, p) => sum + p.price, 0);
      const tax = subtotal * 0.19;
      const total = subtotal + tax;
      
      const sale = await prisma.sale.create({
        data: {
          total,
          subtotal,
          tax,
          discount: 0,
          notes: `Venta de prueba ${i + 1}`,
          sellerId: Math.random() > 0.5 ? reception.id : manager.id,
          gymId: gym.id,
        }
      });
      
      // Crear items de venta
      for (const product of randomProducts) {
        const quantity = Math.floor(Math.random() * 3) + 1;
        await prisma.saleItem.create({
          data: {
            saleId: sale.id,
            productId: product.id,
            quantity,
            unitPrice: product.price,
            total: product.price * quantity,
          }
        });
        
        // Actualizar stock
        await prisma.product.update({
          where: { id: product.id },
          data: { stock: { decrement: quantity } }
        });
      }
    }
    
    console.log('🛒 Ventas de prueba creadas');
    
    // Crear logs de acceso
    for (const clientUser of allClients) {
      const accessCount = Math.floor(Math.random() * 10) + 1;
      for (let j = 0; j < accessCount; j++) {
        await prisma.accessLog.create({
          data: {
            type: Math.random() > 0.8 ? 'MANUAL' : 'QR_CODE',
            status: Math.random() > 0.05 ? 'GRANTED' : 'DENIED', // 95% exitosos
            method: Math.random() > 0.8 ? 'MANUAL_ENTRY' : 'QR_SCAN',
            userId: clientUser.id,
            gymId: gym.id,
          }
        });
      }
    }
    
    console.log('📋 Logs de acceso creados');
    
    console.log('\n✅ Seed completado exitosamente!');
    console.log('\n👤 Usuarios de prueba:');
    console.log('📧 Propietario: owner@gym.com / password123');
    console.log('📧 Manager: admin@gym.com / password123');
    console.log('📧 Recepción: reception@gym.com / password123');
    console.log('📧 Cliente: client@gym.com / password123');
    console.log('📧 Clientes adicionales: cliente1@gym.com a cliente5@gym.com / password123');
    console.log('\n🏢 Código de gimnasio: GYM123');
    console.log(`\n📊 Datos creados:`);
    console.log(`- ${allClients.length} socios con membresías`);
    console.log(`- ${products.length} productos en inventario`);
    console.log(`- 10 ventas de ejemplo`);
    console.log(`- Múltiples logs de acceso`);
    
  } catch (error) {
    console.error('❌ Error en seed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedDatabase();