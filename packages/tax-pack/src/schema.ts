import { z } from 'zod';

export const TaxRuleTypeSchema = z.enum([
  'VAT',
  'WITHHOLDING',
  'CORPORATE_TAX',
  'EMPLOYER_PENSION',
  'EMPLOYEE_PENSION',
  'PAYE',
  'SEVERANCE',
  'DIGITAL_SERVICES_TAX',
  'CUSTOM',
]);

export type TaxRuleType = z.infer<typeof TaxRuleTypeSchema>;

export const TaxAppliesToSchema = z.enum([
  'QUOTE', // Applied directly on client quote (e.g. VAT)
  'PAYROLL', // Added to or deducted from staff compensation (e.g. Pension, PAYE)
  'PROFIT', // Estimated on taxable gross profit (e.g. Corporate Tax)
  'CASH_FLOW', // Cash flow deduction (e.g. Withholding Tax)
]);

export type TaxAppliesTo = z.infer<typeof TaxAppliesToSchema>;

export const PensionBaseSchema = z.enum([
  'BASIC_SALARY',
  'GROSS_SALARY',
  'SERVICE_PRICE',
  'GROSS_PROFIT',
]);

export type PensionBase = z.infer<typeof PensionBaseSchema>;

export const TaxBracketSchema = z.object({
  minMinor: z.number().int().nonnegative(), // inclusive lower bound in minor units
  maxMinor: z.number().int().positive().nullable(), // inclusive upper bound (null for open-ended top tier)
  rate: z.number().min(0).max(1), // tax rate decimal (e.g. 0.15 for 15%)
  deductionMinor: z.number().int().nonnegative().default(0), // cumulative deduction constant for formula
});

export type TaxBracket = z.infer<typeof TaxBracketSchema>;

export const TaxThresholdsSchema = z.object({
  registrationThresholdMinor: z.number().int().positive().optional(), // e.g. 2,000,000 ETB = 200,000,000 santim
  exemptThresholdMinor: z.number().int().positive().optional(),
  servicesThresholdMinor: z.number().int().positive().optional(), // e.g. 10,000 ETB
});

export type TaxThresholds = z.infer<typeof TaxThresholdsSchema>;

// Strict date regex YYYY-MM-DD
const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export const TaxRuleSchema = z
  .object({
    id: z.string().min(1, 'Rule ID is required'),
    name: z.string().min(1, 'Rule name is required'),
    type: TaxRuleTypeSchema,
    appliesTo: TaxAppliesToSchema,
    // Either a flat rate or progressive brackets must be supplied
    rate: z.number().min(0).max(1).optional(),
    brackets: z.array(TaxBracketSchema).optional(),
    thresholds: TaxThresholdsSchema.optional(),
    base: PensionBaseSchema.optional(),
    ceilingMinor: z.number().int().positive().optional(),
    // Required non-empty source reference and verification date
    sourceUrl: z.string().min(1, 'Source URL or reference citation is strictly required'),
    verifiedAt: z
      .string()
      .regex(ISO_DATE_REGEX, 'verifiedAt must be an ISO date in YYYY-MM-DD format'),
    needsVerification: z.boolean().default(false),
    notes: z.string().optional(),
    enabledByDefault: z.boolean().default(true),
  })
  .refine((rule) => rule.rate !== undefined || (rule.brackets && rule.brackets.length > 0), {
    message: 'Tax rule must specify either a flat rate or progressive brackets',
    path: ['rate'],
  });

export type TaxRule = z.infer<typeof TaxRuleSchema>;

export const TaxPackSchema = z.object({
  version: z.string().min(1, 'Version is required'),
  country: z.string().length(2, 'Country code must be ISO 3166-1 alpha-2 (e.g. ET)'),
  currency: z.string().length(3, 'Currency code must be ISO 4217 (e.g. ETB)'),
  effectiveFrom: z
    .string()
    .regex(ISO_DATE_REGEX, 'effectiveFrom must be an ISO date in YYYY-MM-DD format'),
  title: z.string().optional(),
  description: z.string().optional(),
  rules: z.array(TaxRuleSchema).min(1, 'Tax pack must contain at least one tax rule'),
});

export type TaxPack = z.infer<typeof TaxPackSchema>;
