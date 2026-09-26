import { PrismaClient, Role, ApprovalStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting minimal seed process...');

  // 1. Create default Brand
  const brand = await prisma.brand.create({
    data: {
      name: 'BayGuyz',
      logo_url: 'https://example.com/logo.png',
      primary_color: '#4B1426',
    },
  });

  // 2. Create the single Store 'bayguyz'
  const store = await prisma.store.create({
    data: {
      brand_id: brand.id,
      name: 'bayguyz',
      address: 'Main Street',
      city: 'City',
      state: 'State',
      phone: '9000000000',
      is_active: true,
    },
  });

  // 3. Create Super Admin user
  const hashedPassword = await bcrypt.hash('Alkaifizhar@1995', 12);
  await prisma.user.create({
    data: {
      brand_id: brand.id,
      store_id: store.id,
      email: 'bayguyzadmin@gmail.com',
      password_hash: hashedPassword,
      name: 'Bayguyz Admin',
      phone: '9999999999',
      role: Role.SUPER_ADMIN,
      approval_status: ApprovalStatus.APPROVED,
    },
  });

  // 4. Create Store Manager
  const managerPassword = await bcrypt.hash('manager123', 12);
  await prisma.user.create({
    data: {
      brand_id: brand.id,
      store_id: store.id,
      email: 'manager@bayguyz.com',
      password_hash: managerPassword,
      name: 'Bayguyz Manager',
      phone: '8888888888',
      role: Role.STORE_ADMIN,
      approval_status: ApprovalStatus.APPROVED,
    },
  });

  console.log('Minimal seed completed successfully. All other dummy data excluded.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
