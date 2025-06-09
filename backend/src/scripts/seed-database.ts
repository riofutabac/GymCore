import { PrismaClient, Membership, MembershipStatus, AccessType, AccessStatus, PaymentMethod, PaymentStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function seedDatabase() {
  console.log('🌱 Iniciando seed de la base de datos...');
  
  try {
    await prisma.$transaction(async (tx) => {
      // 1. Limpiar datos existentes en orden correcto
      console.log('🗑️ Eliminando datos existentes...');
      await tx.accessLog.deleteMany();
      await tx.saleItem.deleteMany();
      await tx.sale.deleteMany();
      await tx.product.deleteMany();
      await tx.payment.deleteMany();
      await tx.membership.deleteMany();
      
      // Primero eliminar usuarios que no son propietarios
      await tx.user.deleteMany({
        where: {
          role: { not: 'SYS_ADMIN' }
        }
      });
      
      // Luego eliminar gimnasios y sus propietarios
      await tx.gym.deleteMany();
      await tx.user.deleteMany();
      
      console.log('🗑️ Datos existentes eliminados');

      // 2. Pre-hashear contraseña una vez
      const hashedPassword = await bcrypt.hash('password123', 10);

      // 3. Crear propietario primero
      const owner = await tx.user.create({
        data: {
          email: 'owner@gym.com',
          password: hashedPassword,
          name: 'Propietario Gym',
          role: 'SYS_ADMIN',
        }
      });

      // 4. Crear gimnasio con propietario existente
      const gym = await tx.gym.create({
        data: {
          name: 'GymCore Demo',
          address: 'Calle Principal 123, Ciudad',
          phone: '+1 234 567 8900',
          email: 'info@gymcore.demo',
          description: 'Gimnasio de demostración para GymCore',
          joinCode: 'GYM123',
          ownerId: owner.id,
        }
      });

      console.log('🏢 Gimnasio creado:', gym.name);

      // 5. Crear usuarios staff
      await tx.user.createMany({
        data: [
          {
            email: 'admin@gym.com',
            password: hashedPassword,
            name: 'Manager Demo',
            role: 'MANAGER',
            staffOfGymId: gym.id,
          },
          {
            email: 'reception@gym.com',
            password: hashedPassword,
            name: 'Recepcionista Demo',
            role: 'RECEPTION',
            staffOfGymId: gym.id,
          }
        ]
      });

      // Obtener usuarios staff creados
      const staffUsers = await tx.user.findMany({
        where: { staffOfGymId: gym.id }
      });

      // 6. Crear clientes en lote
      const clientsData = Array.from({ length: 5 }, (_, i) => ({
        email: `cliente${i + 1}@gym.com`,
        password: hashedPassword,
        name: `Cliente ${i + 1}`,
        role: 'CLIENT' as const,
        memberOfGymId: gym.id,
      }));

      // Agregar cliente principal
      clientsData.unshift({
        email: 'client@gym.com',
        password: hashedPassword,
        name: 'Cliente Demo',
        role: 'CLIENT',
        memberOfGymId: gym.id,
      });

      await tx.user.createMany({ data: clientsData });

      // Obtener clientes creados
      const clientUsers = await tx.user.findMany({
        where: { memberOfGymId: gym.id }
      });

      console.log('👥 ' + (staffUsers.length + clientUsers.length) + ' usuarios creados');

      // 7. Crear membresías y pagos de forma optimizada
      console.log('💳 Creando membresías y pagos...');
      
      const membershipsData = clientUsers.map(client => {
        const isActive = Math.random() > 0.3;
        const monthlyPrice = Math.random() > 0.5 ? 50.00 : 75.00;
        return {
          userId: client.id,
          type: 'MONTHLY',
          status: (isActive ? 'ACTIVE' : 'EXPIRED') as MembershipStatus,
          startDate: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
          expiresAt: new Date(Date.now() + (isActive ? 30 : -10) * 24 * 60 * 60 * 1000),
          monthlyPrice,
          totalPaid: Math.random() * 300 + 50,
          autoRenewal: Math.random() > 0.5,
        };
      });

      // Crear membresías individuales para obtener IDs (con tipado correcto)
      const memberships: Membership[] = [];
      for (const membershipData of membershipsData) {
        const membership = await tx.membership.create({ data: membershipData });
        memberships.push(membership);
      }

      // Crear pagos en lote
      const paymentsData = memberships.flatMap(membership => {
        const paymentsCount = Math.floor(Math.random() * 3) + 1;
        const methods: PaymentMethod[] = ['CASH', 'CARD', 'TRANSFER'];
        return Array.from({ length: paymentsCount }, (_, j) => ({
          amount: membership.monthlyPrice || 50.00,
          method: methods[Math.floor(Math.random() * methods.length)],
          status: 'COMPLETED' as PaymentStatus,
          description: 'Pago de membresia ' + (j + 1),
          membershipId: membership.id,
        }));
      });

      await tx.payment.createMany({ data: paymentsData });
      console.log('💳 ' + memberships.length + ' membresías y ' + paymentsData.length + ' pagos creados');

      // 8. Crear productos en lote
      console.log('📦 Creando productos...');
      
      interface ProductTemplate {
        name: string;
        price: number;
        cost: number;
        stock: number;
      }
      
      interface CategoryData {
        category: string;
        products: ProductTemplate[];
      }
      
      const productCategories: CategoryData[] = [
        { 
          category: 'Suplementos', 
          products: [
            { name: 'Proteína Whey Chocolate', price: 45.99, cost: 30.00, stock: 25 },
            { name: 'Proteína Whey Vainilla', price: 45.99, cost: 30.00, stock: 20 },
            { name: 'Creatina Monohidrato', price: 29.99, cost: 20.00, stock: 15 },
            { name: 'BCAA Aminoácidos', price: 35.99, cost: 24.00, stock: 18 },
            { name: 'Pre-Entreno', price: 39.99, cost: 26.00, stock: 12 }
          ]
        },
        { 
          category: 'Accesorios', 
          products: [
            { name: 'Botella de Agua 750ml', price: 12.99, cost: 8.00, stock: 50 },
            { name: 'Toalla Deportiva', price: 18.99, cost: 12.00, stock: 30 },
            { name: 'Guantes de Entrenamiento', price: 24.99, cost: 16.00, stock: 22 },
            { name: 'Correa de Levantamiento', price: 34.99, cost: 22.00, stock: 15 }
          ]
        },
        { 
          category: 'Ropa', 
          products: [
            { name: 'Camiseta GymCore', price: 19.99, cost: 12.00, stock: 35 },
            { name: 'Shorts Deportivos', price: 24.99, cost: 16.00, stock: 28 },
            { name: 'Sudadera con Capucha', price: 39.99, cost: 25.00, stock: 20 }
          ]
        }
      ];

      let productCounter = 1;
      const productsData: Array<{
        name: string;
        price: number;
        cost: number;
        stock: number;
        category: string;
        sku: string;
        minStock: number;
        gymId: string;
      }> = [];
      
      for (const categoryData of productCategories) {
        for (const product of categoryData.products) {
          productsData.push({
            ...product,
            category: categoryData.category,
            sku: 'PROD' + productCounter.toString().padStart(3, '0'),
            minStock: 5,
            gymId: gym.id,
          });
          productCounter++;
        }
      }

      await tx.product.createMany({ data: productsData });
      
      // Obtener productos creados
      const products = await tx.product.findMany({
        where: { gymId: gym.id }
      });
      
      console.log('📦 ' + products.length + ' productos creados');

      // 9. Crear ventas de prueba
      console.log('🛒 Creando ventas de prueba...');
      const allStaff = [...staffUsers];
      
      for (let i = 0; i < 10; i++) {
        const randomProducts = products
          .sort(() => 0.5 - Math.random())
          .slice(0, Math.floor(Math.random() * 3) + 1);
        
        const subtotal = randomProducts.reduce((sum, p) => sum + p.price, 0);
        const tax = subtotal * 0.19;
        const total = subtotal + tax;
        
        const sale = await tx.sale.create({
          data: {
            total,
            subtotal,
            tax,
            discount: 0,
            notes: 'Venta de prueba ' + (i + 1),
            sellerId: allStaff[Math.floor(Math.random() * allStaff.length)].id,
            gymId: gym.id,
          }
        });

        // Crear items de venta y actualizar stock
        const saleItemsData = randomProducts.map(product => {
          const quantity = Math.floor(Math.random() * 3) + 1;
          return {
            saleId: sale.id,
            productId: product.id,
            quantity,
            unitPrice: product.price,
            total: product.price * quantity,
          };
        });

        await tx.saleItem.createMany({ data: saleItemsData });

        // Actualizar stock de productos
        for (const item of saleItemsData) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } }
          });
        }
      }

      console.log('🛒 10 ventas de prueba creadas');

      // 10. Crear logs de acceso en lote
      console.log('📋 Creando logs de acceso...');
      const accessTypes: AccessType[] = ['MANUAL', 'QR_CODE'];
      const accessStatuses: AccessStatus[] = ['GRANTED', 'DENIED'];
      
      const accessLogsData = clientUsers.flatMap(client => {
        const accessCount = Math.floor(Math.random() * 10) + 1;
        return Array.from({ length: accessCount }, () => ({
          type: Math.random() > 0.8 ? accessTypes[0] : accessTypes[1],
          status: Math.random() > 0.05 ? accessStatuses[0] : accessStatuses[1],
          method: Math.random() > 0.8 ? 'MANUAL_ENTRY' : 'QR_SCAN',
          userId: client.id,
          gymId: gym.id,
        }));
      });

      await tx.accessLog.createMany({ data: accessLogsData });
      console.log('📋 ' + accessLogsData.length + ' logs de acceso creados');

    }); // Fin de transacción

    console.log('\n✅ Seed completado exitosamente!');
    console.log('\n👤 Usuarios de prueba:');
    console.log('📧 Propietario: owner@gym.com / password123');
    console.log('📧 Manager: admin@gym.com / password123');
    console.log('📧 Recepción: reception@gym.com / password123');
    console.log('📧 Cliente: client@gym.com / password123');
    console.log('📧 Clientes adicionales: cliente1@gym.com a cliente5@gym.com / password123');
    console.log('\n🏢 Código de gimnasio: GYM123');
    console.log('\n📊 ¡Todos los datos insertados correctamente con relaciones válidas!');
    
  } catch (error) {
    console.error('❌ Error durante el seed:', error);
    console.error('La transacción ha sido revertida. La base de datos permanece limpia.');
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Verificar conexión antes de ejecutar
async function main() {
  try {
    await prisma.$connect();
    console.log('✅ Conexión a la base de datos establecida');
    await seedDatabase();
  } catch (error) {
    console.error('❌ Error de conexión:', error);
    process.exit(1);
  }
}

main();