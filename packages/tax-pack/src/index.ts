import { z } from 'zod';

export const TAX_PACK_VERSION = '0.1.0';

export const TaxRuleSchema = z.object({
  id: z.string(),
  name: z.string(),
  rate: z.number().min(0).max(1),
  effectiveFrom: z.string(),
  source: z.string().url().optional(),
  verifiedAt: z.string().optional(),
  needsVerification: z.boolean().default(false),
});

export type TaxRule = z.infer<typeof TaxRuleSchema>;

export const TaxPackSchema = z.object({
  version: z.string(),
  country: z.literal('ET'),
  effectiveFrom: z.string(),
  rules: z.array(TaxRuleSchema),
});

export type TaxPack = z.infer<typeof TaxPackSchema>;
