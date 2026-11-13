import { Person, Role, RateCard } from '../types';

export const INITIAL_ROLES: Role[] = [
  {
    id: 'role-1',
    name: 'Lead Architect / Backend Lead',
    description: 'System design, database architecture, distributed systems',
    defaultHourlyCostMinor: '55000',
    currency: 'ETB',
  },
  {
    id: 'role-2',
    name: 'Senior Frontend Engineer',
    description: 'React, Next.js, TypeScript, responsive UX',
    defaultHourlyCostMinor: '45000',
    currency: 'ETB',
  },
  {
    id: 'role-3',
    name: 'Mobile Engineer (Flutter)',
    description: 'Cross-platform iOS/Android development',
    defaultHourlyCostMinor: '40000',
    currency: 'ETB',
  },
  {
    id: 'role-4',
    name: 'UI/UX & Product Designer',
    description: 'User journeys, Figma design systems, usability testing',
    defaultHourlyCostMinor: '35000',
    currency: 'ETB',
  },
  {
    id: 'role-5',
    name: 'QA & Test Automation Specialist',
    description: 'E2E testing, API testing, automated regression',
    defaultHourlyCostMinor: '30000',
    currency: 'ETB',
  },
];

export const INITIAL_PEOPLE: Person[] = [
  {
    id: 'person-1',
    name: 'Dagmawi Tesfaye',
    email: 'dagmawi@afrodigital.dev',
    roleId: 'role-1',
    role: { id: 'role-1', name: 'Lead Architect / Backend Lead' },
    payType: 'MONTHLY_SALARY',
    currency: 'ETB',
    basicSalaryMinor: '6000000', // 60,000 ETB
    allowancesMinor: '800000', // 8,000 ETB
    benefitsMinor: '250000', // 2,500 ETB
    directHourlyRateMinor: '0',
    paidHoursPerMonth: 160,
    utilizationRate: 0.75, // 120 productive hours
    isEthiopianNational: true,
    pensionRate: 0.11, // 11% POESSA = 6,600 ETB
    pensionBase: 'BASIC',
    isActive: true,
    computedHourlyCost: {
      hourlyCostMinor: '64250', // (60,000 + 8,000 + 2,500 + 6,600) / 120 = 77,100 / 120 = 642.50 ETB = 64,250 santim
      totalMonthlyCostMinor: '7710000',
      monthlyEmployerPensionMinor: '660000',
      productiveHoursPerMonth: 120,
      currency: 'ETB',
    },
  },
  {
    id: 'person-2',
    name: 'Bethlehem Haile',
    email: 'bethlehem@afrodigital.dev',
    roleId: 'role-2',
    role: { id: 'role-2', name: 'Senior Frontend Engineer' },
    payType: 'MONTHLY_SALARY',
    currency: 'ETB',
    basicSalaryMinor: '4500000', // 45,000 ETB
    allowancesMinor: '500000', // 5,000 ETB
    benefitsMinor: '150000', // 1,500 ETB
    directHourlyRateMinor: '0',
    paidHoursPerMonth: 160,
    utilizationRate: 0.7, // 112 productive hours
    isEthiopianNational: true,
    pensionRate: 0.11, // 11% of 45,000 = 4,950 ETB
    pensionBase: 'BASIC',
    isActive: true,
    computedHourlyCost: {
      hourlyCostMinor: '50402', // 56,450 / 112 = 504.0178 ETB = 50,402 santim
      totalMonthlyCostMinor: '5645000',
      monthlyEmployerPensionMinor: '495000',
      productiveHoursPerMonth: 112,
      currency: 'ETB',
    },
  },
  {
    id: 'person-3',
    name: 'Yonas Berhanu',
    email: 'yonas@afrodigital.dev',
    roleId: 'role-3',
    role: { id: 'role-3', name: 'Mobile Engineer (Flutter)' },
    payType: 'MONTHLY_SALARY',
    currency: 'ETB',
    basicSalaryMinor: '3800000', // 38,000 ETB
    allowancesMinor: '400000', // 4,000 ETB
    benefitsMinor: '100000', // 1,000 ETB
    directHourlyRateMinor: '0',
    paidHoursPerMonth: 160,
    utilizationRate: 0.75, // 120 productive hours
    isEthiopianNational: true,
    pensionRate: 0.11, // 11% of 38,000 = 4,180 ETB
    pensionBase: 'BASIC',
    isActive: true,
    computedHourlyCost: {
      hourlyCostMinor: '39317', // 47,180 / 120 = 393.166 ETB = 39,317 santim
      totalMonthlyCostMinor: '4718000',
      monthlyEmployerPensionMinor: '418000',
      productiveHoursPerMonth: 120,
      currency: 'ETB',
    },
  },
  {
    id: 'person-4',
    name: 'Selamawit Girma',
    email: 'selam@afrodigital.dev',
    roleId: 'role-4',
    role: { id: 'role-4', name: 'UI/UX & Product Designer' },
    payType: 'MONTHLY_SALARY',
    currency: 'ETB',
    basicSalaryMinor: '3200000', // 32,000 ETB
    allowancesMinor: '300000', // 3,000 ETB
    benefitsMinor: '80000', // 800 ETB
    directHourlyRateMinor: '0',
    paidHoursPerMonth: 160,
    utilizationRate: 0.65, // 104 productive hours
    isEthiopianNational: true,
    pensionRate: 0.11, // 3,520 ETB
    pensionBase: 'BASIC',
    isActive: true,
    computedHourlyCost: {
      hourlyCostMinor: '37808', // 39,320 / 104 = 378.076 ETB = 37,808 santim
      totalMonthlyCostMinor: '3932000',
      monthlyEmployerPensionMinor: '352000',
      productiveHoursPerMonth: 104,
      currency: 'ETB',
    },
  },
  {
    id: 'person-5',
    name: 'Michael Chen (Contractor)',
    email: 'mchen@advisory.io',
    roleId: 'role-1',
    role: { id: 'role-1', name: 'Lead Architect / Backend Lead' },
    payType: 'CONTRACTOR',
    currency: 'ETB',
    basicSalaryMinor: '0',
    allowancesMinor: '0',
    benefitsMinor: '0',
    directHourlyRateMinor: '85000', // 850 ETB direct hourly cost
    paidHoursPerMonth: 80,
    utilizationRate: 1.0,
    isEthiopianNational: false, // Foreign contractor, 0% pension
    pensionRate: 0.0,
    pensionBase: 'BASIC',
    isActive: true,
    computedHourlyCost: {
      hourlyCostMinor: '85000',
      totalMonthlyCostMinor: '6800000',
      monthlyEmployerPensionMinor: '0',
      productiveHoursPerMonth: 80,
      currency: 'ETB',
    },
  },
];

export const INITIAL_RATE_CARDS: RateCard[] = [
  {
    id: 'rc-1',
    name: 'Standard Agency Rate Card 2026 (Domestic)',
    currency: 'ETB',
    effectiveFrom: '2026-01-01',
    isDefault: true,
    items: [
      { id: 'item-1', roleId: 'role-1', hourlyRateMinor: '120000', currency: 'ETB' }, // 1,200 ETB/hr
      { id: 'item-2', roleId: 'role-2', hourlyRateMinor: '95000', currency: 'ETB' }, // 950 ETB/hr
      { id: 'item-3', roleId: 'role-3', hourlyRateMinor: '85000', currency: 'ETB' }, // 850 ETB/hr
      { id: 'item-4', roleId: 'role-4', hourlyRateMinor: '75000', currency: 'ETB' }, // 750 ETB/hr
      { id: 'item-5', roleId: 'role-5', hourlyRateMinor: '60000', currency: 'ETB' }, // 600 ETB/hr
    ],
  },
  {
    id: 'rc-2',
    name: 'Enterprise / Fast-Track Rate Card',
    currency: 'ETB',
    effectiveFrom: '2026-02-01',
    isDefault: false,
    items: [
      { id: 'item-6', roleId: 'role-1', hourlyRateMinor: '160000', currency: 'ETB' },
      { id: 'item-7', roleId: 'role-2', hourlyRateMinor: '130000', currency: 'ETB' },
      { id: 'item-8', roleId: 'role-3', hourlyRateMinor: '115000', currency: 'ETB' },
      { id: 'item-9', roleId: 'role-4', hourlyRateMinor: '100000', currency: 'ETB' },
      { id: 'item-10', roleId: 'role-5', hourlyRateMinor: '80000', currency: 'ETB' },
    ],
  },
];
