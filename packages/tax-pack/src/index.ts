import rawEthiopia2026 from './packs/ethiopia-2026.json';
import { TaxPack } from './schema';
import { loadTaxPack } from './validator';

export * from './schema';
export * from './validator';
export * from './stale';
export * from './paye';
export * from './pricing-adapter';

export const TAX_PACK_VERSION = '2026.1';

/**
 * Standard, bundled Ethiopian 2026 Tax Pack, pre-validated at module load time.
 */
export const ethiopia2026TaxPack: TaxPack = loadTaxPack(rawEthiopia2026);
