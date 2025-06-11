import { PrismaClient, Membership, MembershipStatus, AccessType, AccessStatus, PaymentMethod, PaymentStatus } from '@prisma/client';


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
      
      // Eliminar todos los datos en orden
      await tx.gym.deleteMany();
      await tx.user.deleteMany();
      
      console.log('🗑️ Datos existentes eliminados');

      console.log('\n🚨 IMPORTANTE: Antes de ejecutar este script, crea los siguientes usuarios en Supabase Auth:');
      console.log('1. Admin - admin@gymcore.com / password123');
      console.log('2. Manager - manager@gym1.com / password123');
      console.log('3. Reception - reception@gym1.com / password123');
      console.log('4. Client - client@test.com / password123');
      
      console.log('\n⏳ Esperando 10 segundos para que crees los usuarios en Supabase...');
      await new Promise(resolve => setTimeout(resolve, 10000));

      // Verificar que exista el usuario admin
      const adminUser = await prisma.user.findUnique({
        where: { email: 'admin@gymcore.com' },
      });

      if (!adminUser) {
        throw new Error('Usuario admin no encontrado. Crea primero el usuario en Supabase Auth.');
      }

      // Actualizar el rol a OWNER
      await prisma.user.update({
        where: { id: adminUser.id },
        data: {
          role: 'OWNER',
          isActive: true,
        },
      });

      const owner = adminUser;

      console.log('👤 OWNER creado:', owner.name);

      // 4. Crear 3 gimnasios propiedad del OWNER
      const gyms = await Promise.all([
        tx.gym.create({
          data: {
            name: 'GymCore Central',
            address: 'Av. Principal 123',
            phone: '+1 234 567 8901',
            email: 'central@gymcore.demo',
            description: 'Sede Central GymCore',
            joinCode: 'GYM001',
            ownerId: owner.id,
          }
        }),
        tx.gym.create({
          data: {
            name: 'GymCore Norte',
            address: 'Calle Norte 456',
            phone: '+1 234 567 8902',
            email: 'norte@gymcore.demo',
            description: 'Sede Norte GymCore',
            joinCode: 'GYM002',
            ownerId: owner.id,
          }
        }),
        tx.gym.create({
          data: {
            name: 'GymCore Sur',
            address: 'Av. Sur 789',
            phone: '+1 234 567 8903',
            email: 'sur@gymcore.demo',
            description: 'Sede Sur GymCore',
            joinCode: 'GYM003',
            ownerId: owner.id,
          }
        })
      ]);

      console.log('🏢 Gimnasios creados:', gyms.map(g => g.name).join(', '));

      // 5. Verificar y actualizar MANAGERS (uno por gimnasio)
      const managers = await Promise.all(gyms.map(async (gym, i) => {
        const manager = await tx.user.findUnique({
          where: { email: `manager@gym${i+1}.com` }
        });

        if (!manager) {
          throw new Error(`Usuario manager@gym${i+1}.com no encontrado. Crea primero el usuario en Supabase Auth.`);
        }

        const updatedManager = await tx.user.update({
          where: { id: manager.id },
          data: {
            name: `Manager ${gym.name}`,
            role: 'MANAGER',
            isActive: true
          }
        });

        // Asignar manager al gimnasio
        await tx.gym.update({
          where: { id: gym.id },
          data: { managerId: updatedManager.id }
        });

        return updatedManager;
      }));

      console.log('👥 MANAGERS actualizados:', managers.map(m => m.name || m.email).join(', '));

      // 6. Verificar y actualizar RECEPTIONISTS
      const receptionEmails = [
        { email: 'reception@gym1.com', name: 'Recepcionista Central', gymIndex: 0 },
        { email: 'reception@gym2.com', name: 'Recepcionista Norte', gymIndex: 1 },
        { email: 'reception@gym3.com', name: 'Recepcionista Sur', gymIndex: 2 }
      ];

      const receptionists = await Promise.all(
        receptionEmails.map(async ({ email, name, gymIndex }) => {
          const reception = await tx.user.findUnique({
            where: { email }
          });

          if (!reception) {
            throw new Error(`Usuario ${email} no encontrado. Crea primero el usuario en Supabase Auth.`);
          }

          return await tx.user.update({
            where: { id: reception.id },
            data: {
              name,
              role: 'RECEPTION',
              isActive: true,
              workingAtGym: { connect: { id: gyms[gymIndex].id } },
            }
          });
        })
      );

      // Verificar y actualizar RECEPTION
      const reception = await tx.user.findUnique({
        where: { email: 'reception@gym1.com' }
      });

      if (!reception) {
        throw new Error('Usuario reception no encontrado. Crea primero el usuario en Supabase Auth.');
      }

      await tx.user.update({
        where: { id: reception.id },
        data: { role: 'RECEPTION', isActive: true }
      });

      console.log('👤 RECEPTION actualizado:', reception.name || reception.email);

      console.log('👥 RECEPTIONISTS creados:', receptionists.length);

      const staffUsers = [...managers, ...receptionists];

      // 7. Verificar y actualizar clientes de prueba
      const clientEmails = [
        { email: 'client@test.com', name: 'Cliente General' },
        ...Array.from({ length: 3 }).map((_, i) => ({
          email: `client${i + 1}@test.com`,
          name: `Cliente ${i + 1}`
        }))
      ];

      const clients = await Promise.all(
        clientEmails.map(async ({ email, name }) => {
          const client = await tx.user.findUnique({
            where: { email }
          });

          if (!client) {
            throw new Error(`Usuario ${email} no encontrado. Crea primero el usuario en Supabase Auth.`);
          }

          return await tx.user.update({
            where: { id: client.id },
            data: {
              name,
              role: 'CLIENT',
              isActive: true
            }
          });
        })
      );

      // Distribuir membresías entre gimnasios
      for (const client of clients) {
        // Cada cliente puede tener 1-3 membresías en diferentes gimnasios
        const numMemberships = Math.floor(Math.random() * 3) + 1;
        const randomGyms = gyms.sort(() => 0.5 - Math.random()).slice(0, numMemberships);
        
        await Promise.all(randomGyms.map(gym =>
          tx.membership.create({
            data: {
              userId: client.id,
              type: Math.random() > 0.5 ? 'MONTHLY' : 'ANNUAL',
              status: Math.random() > 0.3 ? 'ACTIVE' : 'EXPIRED',
              startDate: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
              expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
              monthlyPrice: Math.random() > 0.5 ? 50.00 : 75.00,
              totalPaid: Math.random() * 300 + 50,
              autoRenewal: Math.random() > 0.5,
            }
          })
        ));
      }

      console.log('👥 CLIENTS creados con membresías distribuidas:', clients.length);

      console.log('👥 ' + staffUsers.length + ' usuarios staff creados');

      // 7. Las membresías ya se creadas junto con los clientes
      console.log('💳 Membresías creadas con los clientes');

      // 8. Crear productos de prueba para cada gimnasio
      console.log('💰 Creando productos de prueba...');
      
      // Plantillas de productos por categoría
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
            { name: 'Proteína Whey 1kg', price: 35.99, cost: 20.50, stock: 50 },
            { name: 'Creatina 500g', price: 25.99, cost: 15.75, stock: 40 },
            { name: 'BCAA 200g', price: 19.99, cost: 10.25, stock: 30 },
            { name: 'Pre-workout 300g', price: 29.99, cost: 18.50, stock: 25 },
          ]
        },
        {
          category: 'Bebidas',
          products: [
            { name: 'Agua mineral 500ml', price: 1.50, cost: 0.75, stock: 100 },
            { name: 'Bebida isotónica', price: 2.50, cost: 1.25, stock: 80 },
            { name: 'Batido proteico', price: 3.99, cost: 2.00, stock: 60 },
          ]
        },
        {
          category: 'Accesorios',
          products: [
            { name: 'Guantes de entrenamiento', price: 15.99, cost: 8.00, stock: 40 },
            { name: 'Cinturón de levantamiento', price: 29.99, cost: 15.00, stock: 30 },
            { name: 'Toalla deportiva', price: 9.99, cost: 4.50, stock: 50 },
            { name: 'Botella deportiva', price: 12.99, cost: 6.00, stock: 45 },
          ]
        },
      ];
      
      // Crear productos para cada gimnasio
      let totalProducts = 0;
      let globalProductCounter = 0; // Move counter outside gym loop
      
      for (const currentGym of gyms) {
        const productsData: Array<{
          name: string;
          description: string;
          price: number;
          cost: number;
          stock: number;
          category: string;
          sku: string;
          barcode: string;
          minStock: number;
          gymId: string;
        }> = [];
        
        for (const categoryData of productCategories) {
          for (const product of categoryData.products) {
            globalProductCounter++;
            const gymPrefix = currentGym.name.substring(0, 3).toUpperCase().replace(/\s/g, '');
            productsData.push({
              name: product.name,
              description: `${product.name} - ${categoryData.category}`,
              price: product.price,
              cost: product.cost,
              stock: product.stock,
              category: categoryData.category,
              sku: `${gymPrefix}${String(globalProductCounter).padStart(4, '0')}`,
              barcode: `BAR${Math.floor(Math.random() * 10000000000)}`,
              minStock: 5,
              gymId: currentGym.id,
            });
          }
        }

        await tx.product.createMany({ data: productsData });
        totalProducts += productsData.length;
      }
      
      console.log('📦 ' + totalProducts + ' productos creados');

      // 9. Crear ventas de prueba para cada gimnasio
      console.log('🛒 Creando ventas de prueba...');
      const allStaff = [...staffUsers];
      
      for (const currentGym of gyms) {
        // Obtener productos de este gimnasio
        const gymProducts = await tx.product.findMany({
          where: { gymId: currentGym.id }
        });
        
        // Crear 3-5 ventas por gimnasio
        const salesCount = Math.floor(Math.random() * 3) + 3;
        
        for (let i = 0; i < salesCount; i++) {
          const randomProducts = gymProducts
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
              notes: `Venta de prueba ${currentGym.name} ${i + 1}`,
              sellerId: allStaff[Math.floor(Math.random() * allStaff.length)].id,
              gymId: currentGym.id,
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
      }

      console.log('🛒 Ventas de prueba creadas');

      // 10. Crear logs de acceso en lote
      console.log('📋 Creando logs de acceso...');
      const accessTypes: AccessType[] = ['MANUAL', 'QR_CODE'];
      const accessStatuses: AccessStatus[] = ['GRANTED', 'DENIED'];
      
      // Obtener todas las membresías para crear logs de acceso
      const allMemberships = await tx.membership.findMany({
        include: { user: true }
      });
      
      const accessLogsData: Array<{
        type: AccessType;
        status: AccessStatus;
        method: string;
        userId: string;
        gymId: string;
      }> = [];
      
      // Para cada gimnasio, crear logs de acceso para sus miembros
      for (const currentGym of gyms) {
        // Filtrar membresías para este gimnasio (simulado, ya que ahora un usuario puede tener múltiples membresías)
        const gymMemberships = allMemberships.filter((_, index) => index % gyms.length === gyms.indexOf(currentGym));
        
        for (const membership of gymMemberships) {
          const accessCount = Math.floor(Math.random() * 5) + 1;
          
          for (let i = 0; i < accessCount; i++) {
            accessLogsData.push({
              type: Math.random() > 0.8 ? accessTypes[0] : accessTypes[1],
              status: Math.random() > 0.05 ? accessStatuses[0] : accessStatuses[1],
              method: Math.random() > 0.8 ? 'MANUAL_ENTRY' : 'QR_SCAN',
              userId: membership.userId,
              gymId: currentGym.id,
            });
          }
        }
      }

      await tx.accessLog.createMany({ data: accessLogsData });
      console.log('📋 ' + accessLogsData.length + ' logs de acceso creados');

    }); // Fin de transacción

    console.log('\n✅ Seed completado exitosamente!');
    console.log('\n👤 Usuarios de prueba (todos con password123):');
    console.log('📧 OWNER: admin@gymcore.com');
    console.log('📧 MANAGERS: manager@gym1.com');
    console.log('📧 RECEPTION: reception@gym1.com');
    console.log('📧 CLIENTS: client@test.com');
    console.log('\n🏢 Códigos de gimnasio: GYM001, GYM002, GYM003');
    console.log('\n📊 ¡Todos los datos insertados correctamente con relaciones válidas!');
    console.log('\nℹ️ NOTA: Asegúrate de crear los usuarios en Supabase Auth primero.');
    
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