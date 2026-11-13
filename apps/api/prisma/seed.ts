import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Selet database seed...');

  // 1. Create default Organization
  const org = await prisma.organization.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Afro Digital Software Solutions',
      defaultCurrency: 'ETB',
      minimumFloorMargin: 0.15, // 15% floor
      targetMargin: 0.3, // 30% target
      stretchMargin: 0.4, // 40% stretch
      defaultOverheadRate: 0.1,
      defaultContingencyRate: 0.1,
    },
  });

  console.log(`Created Organization: ${org.name} (${org.id})`);

  // 2. Create Owner User
  const ownerPasswordHash = await bcrypt.hash('SeletOwner2026!', 10);
  const owner = await prisma.user.upsert({
    where: { email: 'owner@afrodigital.dev' },
    update: {},
    create: {
      organizationId: org.id,
      name: 'Afro Digital Owner',
      email: 'owner@afrodigital.dev',
      passwordHash: ownerPasswordHash,
      role: UserRole.OWNER,
      isActive: true,
    },
  });

  console.log(`Created Owner Account: ${owner.email} (${owner.role})`);

  // 3. Create standard job roles
  const backendRole = await prisma.role.upsert({
    where: {
      organizationId_name: {
        organizationId: org.id,
        name: 'Senior Backend Developer',
      },
    },
    update: {},
    create: {
      organizationId: org.id,
      name: 'Senior Backend Developer',
      description: 'Node.js, NestJS, PostgreSQL & Architecture',
      defaultHourlyCostMinor: 35000n, // 350.00 ETB
      currency: 'ETB',
    },
  });

  const frontendRole = await prisma.role.upsert({
    where: {
      organizationId_name: {
        organizationId: org.id,
        name: 'Senior Frontend Developer',
      },
    },
    update: {},
    create: {
      organizationId: org.id,
      name: 'Senior Frontend Developer',
      description: 'React, Next.js, Tailwind CSS & shadcn/ui',
      defaultHourlyCostMinor: 35000n,
      currency: 'ETB',
    },
  });

  console.log(`Created standard roles: ${backendRole.name}, ${frontendRole.name}`);
  console.log('✅ Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
