import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const mumbaiStore = await prisma.store.findFirst({ where: { name: 'Mumbai Flagship' } });
  if (!mumbaiStore) return;
  
  const employees = await prisma.user.findMany({
    where: { store_id: mumbaiStore.id, role: 'EMPLOYEE' }
  });
  
  console.log('--- Mumbai Store Employees ---');
  employees.forEach(e => {
    console.log(`Name: ${e.name} | Phone: ${e.phone} | PIN: 1234`);
  });
}

main().finally(() => prisma.$disconnect());
