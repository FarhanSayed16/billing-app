/**
 * DANGEROUS: resets all employee PINs.
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
  const pin = process.env.RESET_PIN || '1234';
  const hash = await bcrypt.hash(pin, 12);

  await prisma.user.updateMany({
    where: { role: 'EMPLOYEE' },
    data: { pin: hash },
  });

  console.log(`Employee PINs have been bcrypt-hashed to the chosen value (default 1234).`);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
