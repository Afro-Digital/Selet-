export const APP_NAME = 'Selet';

export type UserRole = 'OWNER' | 'PM' | 'DEVELOPER';

export interface CurrencyAmount {
  amount: number; // integer minor units (e.g. santim / cents)
  currency: 'ETB' | 'USD' | 'EUR';
}

export * from './calendar/ethiopian-calendar';

