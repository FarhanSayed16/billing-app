import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // Create default Brand
  const brand = await prisma.brand.create({
    data: {
      name: 'BillPush Demo Brand',
      logo_url: 'https://example.com/logo.png',
      primary_color: '#000000',
    },
  });

  // Create Super Admin user
  const hashedPassword = await bcrypt.hash('superadmin123', 12);
  
  await prisma.user.create({
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

  console.log('Seed completed: BillPush demo brand and super admin created.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
