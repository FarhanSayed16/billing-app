import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const store = await prisma.store.findFirst();
  if (!store) {
    console.log('No store found');
    return;
  }
  
  await prisma.user.updateMany({
    where: { role: 'EMPLOYEE', store_id: null },
    data: { store_id: store.id }
  });
  
  console.log(`Assigned all unassigned employees to store: ${store.name}`);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
