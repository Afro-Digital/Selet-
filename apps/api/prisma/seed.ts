import { PrismaClient, UserRole, PayType, PensionBase, CatalogCategory, PriceRecurrence } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Selet (ስሌት) enterprise database seed...');

  // 1. Create or Update Default Organization
  const org = await prisma.organization.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {
      name: 'Afro Digital Software Solutions',
      defaultCurrency: 'ETB',
      minimumFloorMargin: 0.15, // 15% floor
      targetMargin: 0.30, // 30% target
      stretchMargin: 0.40, // 40% stretch
      defaultOverheadRate: 0.10, // 10% overhead
      defaultContingencyRate: 0.10, // 10% contingency
    },
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Afro Digital Software Solutions',
      defaultCurrency: 'ETB',
      minimumFloorMargin: 0.15,
      targetMargin: 0.30,
      stretchMargin: 0.40,
      defaultOverheadRate: 0.10,
      defaultContingencyRate: 0.10,
    },
  });

  console.log(`✅ Organization: ${org.name} (${org.id})`);

  // 2. Create Users for all 3 simulated roles
  const ownerPassword = await bcrypt.hash('SeletOwner2026!', 10);
  const pmPassword = await bcrypt.hash('SeletPm2026!', 10);
  const devPassword = await bcrypt.hash('SeletDev2026!', 10);

  const owner = await prisma.user.upsert({
    where: { email: 'owner@afrodigital.dev' },
    update: { role: UserRole.OWNER, passwordHash: ownerPassword },
    create: {
      organizationId: org.id,
      name: 'Afro Digital Owner',
      email: 'owner@afrodigital.dev',
      passwordHash: ownerPassword,
      role: UserRole.OWNER,
      isActive: true,
    },
  });

  const pm = await prisma.user.upsert({
    where: { email: 'pm@afrodigital.dev' },
    update: { role: UserRole.PM, passwordHash: pmPassword },
    create: {
      organizationId: org.id,
      name: 'Yordanos Girma (PM)',
      email: 'pm@afrodigital.dev',
      passwordHash: pmPassword,
      role: UserRole.PM,
      isActive: true,
    },
  });

  const dev = await prisma.user.upsert({
    where: { email: 'dev@afrodigital.dev' },
    update: { role: UserRole.DEVELOPER, passwordHash: devPassword },
    create: {
      organizationId: org.id,
      name: 'Kidus Yohannes (Dev)',
      email: 'dev@afrodigital.dev',
      passwordHash: devPassword,
      role: UserRole.DEVELOPER,
      isActive: true,
    },
  });

  console.log(`✅ Users: Owner (${owner.email}), PM (${pm.email}), Developer (${dev.email})`);

  // 3. Create Standard Ethiopian Software Job Roles
  const rolesData = [
    { name: 'Lead Architect', desc: 'System Architecture & Tech Leadership', hourlyMinor: 65000n },
    { name: 'Senior Backend Developer', desc: 'Node.js, NestJS, Go & PostgreSQL', hourlyMinor: 45000n },
    { name: 'Senior Frontend Developer', desc: 'React, Next.js, Tailwind CSS & TypeScript', hourlyMinor: 40000n },
    { name: 'QA & Automation Engineer', desc: 'E2E Testing, Playwright & Load Testing', hourlyMinor: 30000n },
    { name: 'UI/UX Product Designer', desc: 'Figma, Design Systems & User Research', hourlyMinor: 35000n },
  ];

  const rolesMap = new Map<string, string>();
  for (const r of rolesData) {
    const roleRecord = await prisma.role.upsert({
      where: { organizationId_name: { organizationId: org.id, name: r.name } },
      update: { defaultHourlyCostMinor: r.hourlyMinor, description: r.desc },
      create: {
        organizationId: org.id,
        name: r.name,
        description: r.desc,
        defaultHourlyCostMinor: r.hourlyMinor,
        currency: 'ETB',
      },
    });
    rolesMap.set(r.name, roleRecord.id);
  }
  console.log(`✅ Roles: Created ${rolesData.length} engineering & design roles.`);

  // 4. Create Team Members with Ethiopian POESSA Pension (11%)
  const peopleData = [
    {
      name: 'Dagmawi Tesfaye (Alex)',
      email: 'alex@afrodigital.dev',
      role: 'Lead Architect',
      basicSalaryMinor: 8000000n, // 80,000 ETB
      allowancesMinor: 1000000n, // 10,000 ETB
      benefitsMinor: 500000n, // 5,000 ETB
      utilization: 0.75,
    },
    {
      name: 'Bethlehem Tadesse (Betty)',
      email: 'betty@afrodigital.dev',
      role: 'Senior Frontend Developer',
      basicSalaryMinor: 6500000n, // 65,000 ETB
      allowancesMinor: 800000n,
      benefitsMinor: 400000n,
      utilization: 0.80,
    },
    {
      name: 'Dawit Mekonnen',
      email: 'dawit@afrodigital.dev',
      role: 'Senior Backend Developer',
      basicSalaryMinor: 5500000n, // 55,000 ETB
      allowancesMinor: 600000n,
      benefitsMinor: 300000n,
      utilization: 0.80,
    },
    {
      name: 'Helen Gebre',
      email: 'helen@afrodigital.dev',
      role: 'QA & Automation Engineer',
      basicSalaryMinor: 4800000n, // 48,000 ETB
      allowancesMinor: 500000n,
      benefitsMinor: 200000n,
      utilization: 0.85,
    },
  ];

  for (const p of peopleData) {
    const roleId = rolesMap.get(p.role);
    if (!roleId) continue;

    const existingPerson = await prisma.person.findFirst({
      where: { organizationId: org.id, name: p.name },
    });

    if (existingPerson) {
      await prisma.person.update({
        where: { id: existingPerson.id },
        data: {
          basicSalaryMinor: p.basicSalaryMinor,
          allowancesMinor: p.allowancesMinor,
          benefitsMinor: p.benefitsMinor,
          utilizationRate: p.utilization,
          pensionRate: 0.11, // 11% POESSA
        },
      });
    } else {
      await prisma.person.create({
        data: {
          organizationId: org.id,
          roleId,
          name: p.name,
          email: p.email,
          payType: PayType.MONTHLY_SALARY,
          currency: 'ETB',
          basicSalaryMinor: p.basicSalaryMinor,
          allowancesMinor: p.allowancesMinor,
          benefitsMinor: p.benefitsMinor,
          paidHoursPerMonth: 160,
          utilizationRate: p.utilization,
          isEthiopianNational: true,
          pensionRate: 0.11, // 11% POESSA
          pensionBase: PensionBase.BASIC,
          isActive: true,
        },
      });
    }
  }
  console.log(`✅ People: Added ${peopleData.length} team members with 11% POESSA pensions.`);

  // 5. Create Default Commercial Rate Card
  const standardRateCard = await prisma.rateCard.upsert({
    where: { id: '00000000-0000-0000-0000-000000000002' },
    update: { isDefault: true },
    create: {
      id: '00000000-0000-0000-0000-000000000002',
      organizationId: org.id,
      name: 'Standard Commercial Local (ETB)',
      currency: 'ETB',
      effectiveFrom: new Date('2026-01-01'),
      isDefault: true,
    },
  });

  const rateCardRates = [
    { roleName: 'Lead Architect', billingRateMinor: 110000n }, // 1,100 ETB/hr client billing
    { roleName: 'Senior Backend Developer', billingRateMinor: 85000n }, // 850 ETB/hr
    { roleName: 'Senior Frontend Developer', billingRateMinor: 75000n }, // 750 ETB/hr
    { roleName: 'QA & Automation Engineer', billingRateMinor: 55000n }, // 550 ETB/hr
    { roleName: 'UI/UX Product Designer', billingRateMinor: 65000n }, // 650 ETB/hr
  ];

  for (const r of rateCardRates) {
    const roleId = rolesMap.get(r.roleName);
    if (!roleId) continue;

    await prisma.rateCardItem.upsert({
      where: {
        rateCardId_roleId: {
          rateCardId: standardRateCard.id,
          roleId,
        },
      },
      update: { hourlyRateMinor: r.billingRateMinor },
      create: {
        rateCardId: standardRateCard.id,
        roleId,
        hourlyRateMinor: r.billingRateMinor,
        currency: 'ETB',
      },
    });
  }
  console.log(`✅ Rate Card: Configured '${standardRateCard.name}' with role items.`);

  // 6. Clients
  const clientsData = [
    { name: 'Ethio Telecom', tin: '0001234567', contact: 'Ermias Teshome', email: 'ermias@ethiotelecom.et' },
    { name: 'Commercial Bank of Ethiopia', tin: '0007654321', contact: 'Solomon Bekele', email: 'solomon@cbe.com.et' },
    { name: 'Ethiopian Airlines Enterprise', tin: '0009876543', contact: 'Tigist Assefa', email: 'tigist@ethiopianairlines.com' },
  ];

  for (const c of clientsData) {
    const existingClient = await prisma.client.findFirst({
      where: { organizationId: org.id, name: c.name },
    });
    if (!existingClient) {
      await prisma.client.create({
        data: {
          organizationId: org.id,
          name: c.name,
          tin: c.tin,
          contactName: c.contact,
          contactEmail: c.email,
        },
      });
    }
  }
  console.log(`✅ Clients: Seeded ${clientsData.length} enterprise Ethiopian clients.`);

  // 7. Live NBE Exchange Rates
  const exchangeRates = [
    { from: 'USD', to: 'ETB', rate: 128.50, source: 'National Bank of Ethiopia (NBE)' },
    { from: 'EUR', to: 'ETB', rate: 138.20, source: 'National Bank of Ethiopia (NBE)' },
    { from: 'GBP', to: 'ETB', rate: 162.80, source: 'National Bank of Ethiopia (NBE)' },
  ];

  for (const ex of exchangeRates) {
    await prisma.exchangeRate.upsert({
      where: {
        organizationId_fromCurrency_toCurrency: {
          organizationId: org.id,
          fromCurrency: ex.from,
          toCurrency: ex.to,
        },
      },
      update: {
        rate: ex.rate,
        source: ex.source,
        capturedAt: new Date(),
      },
      create: {
        organizationId: org.id,
        fromCurrency: ex.from,
        toCurrency: ex.to,
        rate: ex.rate,
        source: ex.source,
        capturedAt: new Date(),
      },
    });
  }
  console.log(`✅ Exchange Rates: Configured official NBE foreign currency exchange benchmarks.`);

  // 8. Cost Catalog
  const catalogData = [
    {
      name: 'DigitalOcean Basic Droplet (2GB, 1 vCPU)',
      category: CatalogCategory.HOSTING,
      costMinor: 1200n, // $12.00
      currency: 'USD',
      recurrence: PriceRecurrence.MONTHLY,
      vendor: 'DigitalOcean LLC',
    },
    {
      name: 'AWS EC2 t4g.medium (4GB, 2 vCPU Graviton)',
      category: CatalogCategory.HOSTING,
      costMinor: 2450n, // $24.50
      currency: 'USD',
      recurrence: PriceRecurrence.MONTHLY,
      vendor: 'Amazon Web Services',
    },
    {
      name: 'Ethio Telecom Enterprise Bulk SMS Gateway',
      category: CatalogCategory.THIRD_PARTY_SERVICE,
      costMinor: 35n, // 0.35 ETB / SMS
      currency: 'ETB',
      recurrence: PriceRecurrence.USAGE_BASED,
      vendor: 'Ethio Telecom',
    },
    {
      name: 'Telebirr Payment Gateway Core API License',
      category: CatalogCategory.THIRD_PARTY_SERVICE,
      costMinor: 2500000n, // 25,000 ETB / year
      currency: 'ETB',
      recurrence: PriceRecurrence.ANNUAL,
      vendor: 'Ethio Telecom',
    },
  ];

  for (const item of catalogData) {
    const existing = await prisma.catalogItem.findFirst({
      where: { organizationId: org.id, name: item.name },
    });
    if (!existing) {
      await prisma.catalogItem.create({
        data: {
          organizationId: org.id,
          name: item.name,
          category: item.category,
          unitCostMinor: item.costMinor,
          currency: item.currency,
          recurrence: item.recurrence,
          vendor: item.vendor,
          lastVerifiedAt: new Date(),
        },
      });
    }
  }
  console.log(`✅ Cost Catalog: Added ${catalogData.length} infrastructure & gateway services.`);

  console.log('🎉 Selet enterprise database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
