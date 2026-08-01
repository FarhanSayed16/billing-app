import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed process...');

  // 1. Create default Brand
  const brand = await prisma.brand.create({
    data: {
      name: 'BillPush Demo Brand',
      logo_url: 'https://example.com/logo.png',
      primary_color: '#6366F1',
    },
  });

  // 2. Create Super Admin user
  const hashedPassword = await bcrypt.hash('superadmin123', 12);
  const superAdmin = await prisma.user.create({
    data: {
      brand_id: brand.id,
      email: 'admin@billpush.com',
      password_hash: hashedPassword,
      name: 'Super Admin',
      phone: '9999999999',
      role: 'SUPER_ADMIN',
      approval_status: 'APPROVED',
    },
  });

  // 3. Create a Demo Store
  const store = await prisma.store.create({
    data: {
      brand_id: brand.id,
      name: 'Mumbai Flagship Store',
      address: '123 Marine Drive',
      city: 'Mumbai',
      state: 'Maharashtra',
      phone: '9876543210',
      is_active: true,
    },
  });

  // 4. Create some Products
  const productsData = [
    { name: 'Wireless Headphones', base_price: 2499.0, tax_rate: 18.0, category: 'Electronics' },
    { name: 'Premium Coffee Beans 500g', base_price: 1200.0, tax_rate: 5.0, category: 'Groceries' },
    { name: 'USB-C Cable 2m', base_price: 349.0, tax_rate: 18.0, category: 'Electronics' },
    { name: 'Organic Honey', base_price: 450.0, tax_rate: 5.0, category: 'Groceries' },
  ];

  const products = await Promise.all(
    productsData.map(p =>
      prisma.product.create({
        data: {
          brand_id: brand.id,
          ...p,
        },
      })
    )
  );

  // 5. Add Inventory to the Store
  await Promise.all(
    products.map(product =>
      prisma.storeInventory.create({
        data: {
          store_id: store.id,
          product_id: product.id,
          quantity: Math.floor(Math.random() * 100) + 10,
        },
      })
    )
  );

  // 6. Create a Pending Employee (for Approvals tab)
  await prisma.user.create({
    data: {
      brand_id: brand.id,
      store_id: store.id,
      name: 'Rahul Sharma',
      phone: '9876543211',
      pin: await bcrypt.hash('1234', 12),
      role: 'EMPLOYEE',
      approval_status: 'PENDING',
    },
  });

  console.log('Seed completed: Demo brand, store, products, and pending employees created.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
