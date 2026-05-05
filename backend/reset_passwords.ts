import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const hashedPassword = await bcrypt.hash('password123', 12);
  
  await prisma.user.updateMany({
    where: { role: { in: ['SUPER_ADMIN', 'STORE_ADMIN'] } },
    data: { password_hash: hashedPassword }
  });
  
  console.log('Passwords for SUPER_ADMIN and STORE_ADMIN have been reset to "password123"');
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
