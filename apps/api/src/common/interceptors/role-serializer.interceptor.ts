import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { UserRole } from '@prisma/client';

// Fields hidden from DEVELOPER
const DEVELOPER_FORBIDDEN_FIELDS = new Set([
  'basicSalaryMinor',
  'allowancesMinor',
  'benefitsMinor',
  'directHourlyRateMinor',
  'hourlyCostMinor',
  'computedHourlyCost',
  'hourlyCost',
  'margin',
  'floorMargin',
  'targetMargin',
  'stretchMargin',
  'minimumFloorMargin',
  'blendedMargin',
  'profit',
  'profitMinor',
  'grossProfit',
  'netProfitEstimate',
  'corporateTaxEstimate',
  'laborCost',
  'toolsCost',
  'agencyInfrastructureCost',
  'thirdPartyCost',
  'riskCost',
  'overheadCost',
  'totalCost',
  'passwordHash',
]);

// Fields hidden from PM
const PM_FORBIDDEN_FIELDS = new Set([
  'basicSalaryMinor',
  'allowancesMinor',
  'benefitsMinor',
  'directHourlyRateMinor',
  'passwordHash',
]);

// Always stripped for all roles (including OWNER)
const UNIVERSAL_FORBIDDEN_FIELDS = new Set(['passwordHash']);

/**
 * Strips fields based on role recursively across objects and arrays.
 */
export function sanitizeDataForRole(data: any, role?: UserRole): any {
  if (data === null || data === undefined) {
    return data;
  }

  // Handle BigInt serialization to string or number
  if (typeof data === 'bigint') {
    return data.toString();
  }

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeDataForRole(item, role));
  }

  if (typeof data === 'object' && !(data instanceof Date)) {
    const sanitized: Record<string, any> = {};

    for (const [key, value] of Object.entries(data)) {
      // 1. Universal strip
      if (UNIVERSAL_FORBIDDEN_FIELDS.has(key)) {
        continue;
      }

      // 2. Role-based strip
      if (role === UserRole.DEVELOPER) {
        if (DEVELOPER_FORBIDDEN_FIELDS.has(key)) {
          continue;
        }
      } else if (role === UserRole.PM) {
        if (PM_FORBIDDEN_FIELDS.has(key)) {
          continue;
        }
      }

      sanitized[key] = sanitizeDataForRole(value, role);
    }

    return sanitized;
  }

  return data;
}

@Injectable()
export class RoleSerializerInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const userRole = request.user?.role as UserRole | undefined;

    return next.handle().pipe(map((data) => sanitizeDataForRole(data, userRole)));
  }
}
