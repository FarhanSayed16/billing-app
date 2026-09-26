/**
 * DANGEROUS: prints employee names/phones for a store.
 * Requires CONFIRM_DANGEROUS=YES
 */
import { PrismaClient } from '@prisma/client';

if (process.env.CONFIRM_DANGEROUS !== 'YES') {
  console.error('Refusing to run. Set CONFIRM_DANGEROUS=YES to acknowledge risk.');
  process.exit(1);
}

const prisma = new PrismaClient();

async function main() {
  const mumbaiStore = await prisma.store.findFirst({ where: { name: 'Mumbai Flagship' } });
  if (!mumbaiStore) {
    console.log('Store not found');
    return;
  }

  const employees = await prisma.user.findMany({
    where: { store_id: mumbaiStore.id, role: 'EMPLOYEE' },
    select: { name: true, phone: true, id: true },
  });

  console.log('--- Mumbai Store Employees (no secrets printed) ---');
  employees.forEach((e) => {
    console.log(`Name: ${e.name} | Phone: ${e.phone} | id: ${e.id}`);
  });
}

main().finally(() => prisma.$disconnect());
