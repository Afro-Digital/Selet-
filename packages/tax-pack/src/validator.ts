import { ZodError } from 'zod';
import { TaxPack, TaxPackSchema, TaxRule } from './schema';

export interface ValidationSuccess {
  success: true;
  data: TaxPack;
}

export interface ValidationFailure {
  success: false;
  errors: string[];
}

export type ValidationResult = ValidationSuccess | ValidationFailure;

/**
 * Validates a tax pack object against the Zod schema and business consistency rules.
 */
export function validateTaxPack(input: unknown): ValidationResult {
  try {
    const parsed = TaxPackSchema.parse(input);

    // Business consistency checks:
    const consistencyErrors: string[] = [];

    // 1. Rule IDs must be unique
    const idSet = new Set<string>();
    for (const rule of parsed.rules) {
      if (idSet.has(rule.id)) {
        consistencyErrors.push(`Duplicate tax rule ID detected: '${rule.id}'`);
      }
      idSet.add(rule.id);

      // 2. Validate progressive tax brackets if defined
      if (rule.brackets && rule.brackets.length > 0) {
        validateBrackets(rule, consistencyErrors);
      }
    }

    if (consistencyErrors.length > 0) {
      return { success: false, errors: consistencyErrors };
    }

    return { success: true, data: parsed };
  } catch (err) {
    if (err instanceof ZodError) {
      const errorMessages = err.errors.map((e) => {
        const path = e.path.join('.');
        return path ? `${path}: ${e.message}` : e.message;
      });
      return { success: false, errors: errorMessages };
    }
    return {
      success: false,
      errors: [err instanceof Error ? err.message : String(err)],
    };
  }
}

/**
 * Validates bracket continuity and ascending bounds.
 */
function validateBrackets(rule: TaxRule, errors: string[]): void {
  const brackets = rule.brackets!;
  for (let i = 0; i < brackets.length; i++) {
    const current = brackets[i]!;

    if (current.maxMinor !== null && current.minMinor >= current.maxMinor) {
      errors.push(
        `Rule '${rule.id}' bracket #${i + 1}: minMinor (${current.minMinor}) must be strictly less than maxMinor (${current.maxMinor})`,
      );
    }

    // Continuity with previous bracket
    if (i > 0) {
      const previous = brackets[i - 1]!;
      if (previous.maxMinor === null) {
        errors.push(
          `Rule '${rule.id}' bracket #${i}: bracket has null (open-ended) maxMinor, no subsequent brackets allowed`,
        );
      } else if (
        current.minMinor !== previous.maxMinor + 1 &&
        current.minMinor !== previous.maxMinor
      ) {
        errors.push(
          `Rule '${rule.id}' gap or overlap between bracket #${i} (max ${previous.maxMinor}) and bracket #${i + 1} (min ${current.minMinor})`,
        );
      }
    }
  }
}

/**
 * Loads and asserts that a tax pack is valid. Throws if invalid.
 */
export function loadTaxPack(input: unknown): TaxPack {
  const result = validateTaxPack(input);
  if (!result.success) {
    throw new Error(`Tax pack validation failed:\n- ${result.errors.join('\n- ')}`);
  }
  return result.data;
}
