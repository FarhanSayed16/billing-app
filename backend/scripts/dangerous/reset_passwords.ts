/**
 * DANGEROUS: bulk password reset for admins.
 * Requires CONFIRM_DANGEROUS=YES
 */
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config();

if (process.env.CONFIRM_DANGEROUS !== 'YES') {
  console.error('Refusing to run. Set CONFIRM_DANGEROUS=YES to acknowledge risk.');
  process.exit(1);
}

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const password = process.env.RESET_PASSWORD || 'ChangeMe123!';
  const hash = await bcrypt.hash(password, 12);

  const result = await prisma.user.updateMany({
    where: { role: { in: ['SUPER_ADMIN', 'STORE_ADMIN'] } },
    data: { password_hash: hash },
  });

  console.log(`Updated ${result.count} admin password hashes. Password value not logged.`);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
