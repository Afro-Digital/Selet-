import { describe, it, expect } from 'vitest';
import {
  isEthiopianLeapYear,
  isGregorianLeapYear,
  getDaysInEthiopianMonth,
  gregorianToEthiopian,
  ethiopianToGregorian,
  formatEthiopianDate,
  parseEthiopianDate,
  toGeezNumeral,
  ETHIOPIAN_MONTHS,
} from './ethiopian-calendar';

describe('Ethiopian Calendar & Internationalization Suite', () => {
  describe('Ethiopian Months Definition', () => {
    it('provides exactly 13 Ethiopian months with English and Amharic names', () => {
      expect(ETHIOPIAN_MONTHS.length).toBe(13);
      expect(ETHIOPIAN_MONTHS[0]?.nameEn).toBe('Meskerem');
      expect(ETHIOPIAN_MONTHS[0]?.nameAm).toBe('መስከረም');
      expect(ETHIOPIAN_MONTHS[12]?.nameEn).toBe('Pagume');
      expect(ETHIOPIAN_MONTHS[12]?.nameAm).toBe('ጳጉሜ');
    });
  });

  describe('Leap Year Calculations', () => {
    it('accurately identifies Ethiopian leap years (year % 4 === 3)', () => {
      // Known Ethiopian leap years
      expect(isEthiopianLeapYear(2003)).toBe(true);
      expect(isEthiopianLeapYear(2007)).toBe(true);
      expect(isEthiopianLeapYear(2011)).toBe(true);
      expect(isEthiopianLeapYear(2015)).toBe(true);
      expect(isEthiopianLeapYear(2019)).toBe(true);

      // Known Ethiopian common years
      expect(isEthiopianLeapYear(2014)).toBe(false);
      expect(isEthiopianLeapYear(2016)).toBe(false);
      expect(isEthiopianLeapYear(2017)).toBe(false);
      expect(isEthiopianLeapYear(2018)).toBe(false);
    });

    it('determines Gregorian leap years', () => {
      expect(isGregorianLeapYear(2020)).toBe(true);
      expect(isGregorianLeapYear(2024)).toBe(true);
      expect(isGregorianLeapYear(2026)).toBe(false);
      expect(isGregorianLeapYear(1900)).toBe(false);
      expect(isGregorianLeapYear(2000)).toBe(true);
    });
  });

  describe('Month Lengths & 13th Month (Pagumē)', () => {
    it('standard Ethiopian months 1 to 12 always have exactly 30 days', () => {
      for (let m = 1; m <= 12; m++) {
        expect(getDaysInEthiopianMonth(2016, m)).toBe(30);
        expect(getDaysInEthiopianMonth(2015, m)).toBe(30);
      }
    });

    it('month 13 (Pagumē) has 5 days in a common year, and 6 days in a leap year', () => {
      // 2016 EC is common year -> Pagume has 5 days
      expect(getDaysInEthiopianMonth(2016, 13)).toBe(5);

      // 2015 EC is leap year -> Pagume has 6 days
      expect(getDaysInEthiopianMonth(2015, 13)).toBe(6);
      expect(getDaysInEthiopianMonth(2019, 13)).toBe(6);
    });

    it('throws error for invalid month numbers', () => {
      expect(() => getDaysInEthiopianMonth(2016, 0)).toThrow();
      expect(() => getDaysInEthiopianMonth(2016, 14)).toThrow();
    });
  });

  describe('Known Anchor Dates & Enkutatash (Ethiopian New Year)', () => {
    it('converts September 11, 2024 to Meskerem 1, 2017 EC', () => {
      const eth = gregorianToEthiopian(new Date('2024-09-11T12:00:00Z'));
      expect(eth).toEqual({ year: 2017, month: 1, day: 1 });
    });

    it('converts September 12, 2023 (after 6-day leap Pagume) to Meskerem 1, 2016 EC', () => {
      const eth = gregorianToEthiopian(new Date('2023-09-12T12:00:00Z'));
      expect(eth).toEqual({ year: 2016, month: 1, day: 1 });
    });

    it('converts September 11, 2023 to Pagumē 6, 2015 EC (6th day of leap year Pagume)', () => {
      const eth = gregorianToEthiopian(new Date('2023-09-11T12:00:00Z'));
      expect(eth).toEqual({ year: 2015, month: 13, day: 6 });
    });

    it('converts Pagumē 6, 2015 EC back to September 11, 2023 GC', () => {
      const greg = ethiopianToGregorian(2015, 13, 6);
      expect(greg.getUTCFullYear()).toBe(2023);
      expect(greg.getUTCMonth() + 1).toBe(9);
      expect(greg.getUTCDate()).toBe(11);
    });

    it('converts January 1, 2026 to Tahsas 23, 2018 EC', () => {
      const eth = gregorianToEthiopian(new Date('2026-01-01T00:00:00Z'));
      expect(eth).toEqual({ year: 2018, month: 4, day: 23 });
    });
  });

  describe('Exhaustive Round-Trip Conversion Tests', () => {
    it('achieves 100% round-trip fidelity between Gregorian and Ethiopian for 110 consecutive years (1950-2060)', () => {
      for (let y = 1950; y <= 2060; y++) {
        for (let m = 1; m <= 12; m++) {
          const maxDays = [
            0,
            31,
            isGregorianLeapYear(y) ? 29 : 28,
            31,
            30,
            31,
            30,
            31,
            31,
            30,
            31,
            30,
            31,
          ][m]!;
          // Sample 1st, 15th, and last day of each month
          const testDays = [1, 15, maxDays];
          for (const d of testDays) {
            const eth = gregorianToEthiopian({ year: y, month: m, day: d });
            const greg = ethiopianToGregorian(eth.year, eth.month, eth.day);
            expect(greg.getUTCFullYear()).toBe(y);
            expect(greg.getUTCMonth() + 1).toBe(m);
            expect(greg.getUTCDate()).toBe(d);
          }
        }
      }
    });

    it('achieves 100% round-trip fidelity for all days of the 13th month (Pagume 1 to 5/6) across leap cycles', () => {
      for (let ey = 2000; ey <= 2030; ey++) {
        const isLeap = isEthiopianLeapYear(ey);
        const maxPagume = isLeap ? 6 : 5;
        for (let day = 1; day <= maxPagume; day++) {
          const greg = ethiopianToGregorian(ey, 13, day);
          const revEth = gregorianToEthiopian(greg);
          expect(revEth).toEqual({ year: ey, month: 13, day });
        }
      }
    });
  });

  describe('Ethiopian Date Formatting', () => {
    const testDate = new Date(Date.UTC(2024, 8, 11)); // Meskerem 1, 2017 EC

    it('formats in long Amharic (default)', () => {
      const formatted = formatEthiopianDate(testDate, { locale: 'am', format: 'long' });
      expect(formatted).toBe('መስከረም 1 ቀን 2017 ዓ.ም.');
    });

    it('formats in long English', () => {
      const formatted = formatEthiopianDate(testDate, { locale: 'en', format: 'long' });
      expect(formatted).toBe('Meskerem 1, 2017 E.C.');
    });

    it('formats in numeric', () => {
      const formatted = formatEthiopianDate(testDate, { format: 'numeric', includeEra: false });
      expect(formatted).toBe('01/01/2017');
    });

    it('formats in short Amharic', () => {
      const formatted = formatEthiopianDate(testDate, { locale: 'am', format: 'short' });
      expect(formatted).toBe('መስከረም 1/2017');
    });
  });

  describe('Ge\'ez Numerals Conversion', () => {
    it('converts single digits to Ge\'ez', () => {
      expect(toGeezNumeral(1)).toBe('፩');
      expect(toGeezNumeral(5)).toBe('፭');
      expect(toGeezNumeral(9)).toBe('፱');
    });

    it('converts tens to Ge\'ez', () => {
      expect(toGeezNumeral(10)).toBe('፲');
      expect(toGeezNumeral(15)).toBe('፲፭');
      expect(toGeezNumeral(20)).toBe('፳');
      expect(toGeezNumeral(42)).toBe('፵፪');
      expect(toGeezNumeral(75)).toBe('፸፭');
    });

    it('converts hundreds and Ethiopian calendar years', () => {
      expect(toGeezNumeral(100)).toBe('፻');
      expect(toGeezNumeral(2018)).toBe('፳፻፲፰');
    });
  });

  describe('Date Parsing', () => {
    it('parses ISO date strings into Ethiopian date', () => {
      expect(parseEthiopianDate('2017-01-01')).toEqual({ year: 2017, month: 1, day: 1 });
    });

    it('parses DD/MM/YYYY strings into Ethiopian date', () => {
      expect(parseEthiopianDate('15/02/2018')).toEqual({ year: 2018, month: 2, day: 15 });
    });

    it('parses localized Amharic month strings', () => {
      expect(parseEthiopianDate('መስከረም 1, 2017')).toEqual({ year: 2017, month: 1, day: 1 });
    });
  });
});
