export interface EthiopianDate {
  year: number;
  month: number;
  day: number;
}

export interface EthiopianMonthInfo {
  number: number;
  nameEn: string;
  nameAm: string;
}

export const ETHIOPIAN_MONTHS: EthiopianMonthInfo[] = [
  { number: 1, nameEn: 'Meskerem', nameAm: 'መስከረም' },
  { number: 2, nameEn: 'Tikimt', nameAm: 'ጥቅምት' },
  { number: 3, nameEn: 'Hidar', nameAm: 'ኅዳር' },
  { number: 4, nameEn: 'Tahsas', nameAm: 'ታኅሣሥ' },
  { number: 5, nameEn: 'Tir', nameAm: 'ጥር' },
  { number: 6, nameEn: 'Yekatit', nameAm: 'የካቲት' },
  { number: 7, nameEn: 'Megabit', nameAm: 'መጋቢት' },
  { number: 8, nameEn: 'Miazia', nameAm: 'ሚያዝያ' },
  { number: 9, nameEn: 'Ginbot', nameAm: 'ግንቦት' },
  { number: 10, nameEn: 'Sene', nameAm: 'ሰኔ' },
  { number: 11, nameEn: 'Hamle', nameAm: 'ሐምሌ' },
  { number: 12, nameEn: 'Nehase', nameAm: 'ነሐሴ' },
  { number: 13, nameEn: 'Pagume', nameAm: 'ጳጉሜ' },
];

export const ETHIOPIAN_DAYS: { nameEn: string; nameAm: string; shortAm: string }[] = [
  { nameEn: 'Sunday', nameAm: 'እሑድ', shortAm: 'እሑ' },
  { nameEn: 'Monday', nameAm: 'ሰኞ', shortAm: 'ሰኞ' },
  { nameEn: 'Tuesday', nameAm: 'ማክሰኞ', shortAm: 'ማክ' },
  { nameEn: 'Wednesday', nameAm: 'ረቡዕ', shortAm: 'ረቡ' },
  { nameEn: 'Thursday', nameAm: 'ሐሙስ', shortAm: 'ሐሙ' },
  { nameEn: 'Friday', nameAm: 'ዓርብ', shortAm: 'ዓር' },
  { nameEn: 'Saturday', nameAm: 'ቅዳሜ', shortAm: 'ቅዳ' },
];

/**
 * Checks whether an Ethiopian calendar year is a leap year.
 * In the Ethiopian calendar, a leap year occurs every 4 years when (year % 4 === 3).
 * In a leap year, month 13 (Pagume) has 6 days instead of 5 days.
 */
export function isEthiopianLeapYear(year: number): boolean {
  return year % 4 === 3;
}

/**
 * Checks whether a Gregorian calendar year is a leap year.
 */
export function isGregorianLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/**
 * Returns the number of days in an Ethiopian month.
 * Months 1-12 always have 30 days.
 * Month 13 (Pagume) has 5 days in a common year, or 6 days in a leap year.
 */
export function getDaysInEthiopianMonth(year: number, month: number): number {
  if (month < 1 || month > 13) {
    throw new Error(`Invalid Ethiopian month: ${month}. Must be between 1 and 13.`);
  }
  if (month === 13) {
    return isEthiopianLeapYear(year) ? 6 : 5;
  }
  return 30;
}

// JDN of the day preceding Meskerem 1, 1 EC (August 28, 8 CE Julian)
const ETHIOPIAN_EPOCH = 1724220;

/**
 * Converts a Gregorian date (year, month, day) to Julian Day Number (JDN).
 */
export function gregorianToJdn(year: number, month: number, day: number): number {
  const s = Math.floor(year / 100);
  const b = 2 - s + Math.floor(s / 4);
  let y = year;
  let m = month;
  if (m <= 2) {
    y -= 1;
    m += 12;
  }
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + b - 1524;
}

/**
 * Converts a Julian Day Number (JDN) to Gregorian (year, month, day).
 */
export function jdnToGregorian(jdn: number): { year: number; month: number; day: number } {
  const j = jdn + 0.5;
  const z = Math.floor(j);
  const f = j - z;
  let a = z;
  if (z >= 2299161) {
    const alpha = Math.floor((z - 1867216.25) / 36524.25);
    a = z + 1 + alpha - Math.floor(alpha / 4);
  }
  const b = a + 1524;
  const c = Math.floor((b - 122.1) / 365.25);
  const d = Math.floor(365.25 * c);
  const e = Math.floor((b - d) / 30.6001);
  const day = b - d - Math.floor(30.6001 * e) + f;
  const month = e < 14 ? e - 1 : e - 13;
  const year = month > 2 ? c - 4716 : c - 4715;
  return { year, month, day: Math.floor(day) };
}

/**
 * Converts an Ethiopian date (year, month, day) to Julian Day Number (JDN).
 */
export function ethiopianToJdn(year: number, month: number, day: number): number {
  const priorYears = year - 1;
  const leapDays = Math.floor(year / 4);
  const daysBeforeMonth = (month - 1) * 30;
  return ETHIOPIAN_EPOCH + priorYears * 365 + leapDays + daysBeforeMonth + day;
}

/**
 * Converts a Julian Day Number (JDN) to an Ethiopian date (year, month, day).
 */
export function jdnToEthiopian(jdn: number): EthiopianDate {
  const d = jdn - ETHIOPIAN_EPOCH;
  let year = Math.floor((d - 1) / 365.25) + 1;
  while (ethiopianToJdn(year + 1, 1, 1) <= jdn) {
    year++;
  }
  while (ethiopianToJdn(year, 1, 1) > jdn) {
    year--;
  }
  const dayInYear = jdn - ethiopianToJdn(year, 1, 1) + 1;
  const month = Math.min(13, Math.floor((dayInYear - 1) / 30) + 1);
  const day = dayInYear - (month - 1) * 30;
  return { year, month, day };
}

/**
 * Converts any Gregorian Date representation into an Ethiopian calendar date.
 */
export function gregorianToEthiopian(
  date: Date | string | { year: number; month: number; day: number },
): EthiopianDate {
  let y: number;
  let m: number;
  let d: number;

  if (date instanceof Date) {
    y = date.getFullYear();
    m = date.getMonth() + 1;
    d = date.getDate();
  } else if (typeof date === 'string') {
    const parsed = new Date(date);
    if (!isNaN(parsed.getTime())) {
      y = parsed.getFullYear();
      m = parsed.getMonth() + 1;
      d = parsed.getDate();
    } else {
      const parts = date.split('-').map(Number);
      y = parts[0] ?? 2026;
      m = parts[1] ?? 1;
      d = parts[2] ?? 1;
    }
  } else {
    y = date.year;
    m = date.month;
    d = date.day;
  }

  const jdn = gregorianToJdn(y, m, d);
  return jdnToEthiopian(jdn);
}

/**
 * Converts an Ethiopian calendar date into a Gregorian Javascript Date (UTC midnight).
 */
export function ethiopianToGregorian(year: number, month: number, day: number): Date {
  const maxDay = getDaysInEthiopianMonth(year, month);
  if (day < 1 || day > maxDay) {
    throw new Error(
      `Invalid day ${day} for Ethiopian year ${year}, month ${month}. Max days allowed: ${maxDay}.`,
    );
  }

  const jdn = ethiopianToJdn(year, month, day);
  const greg = jdnToGregorian(jdn);
  // Create UTC date
  return new Date(Date.UTC(greg.year, greg.month - 1, greg.day));
}

export interface FormatEthiopianOptions {
  locale?: 'en' | 'am';
  format?: 'long' | 'medium' | 'short' | 'numeric';
  includeEra?: boolean;
}

/**
 * Formats an Ethiopian date into human-readable localized text.
 * e.g. "ጥቅምት 15 ቀን 2018 ዓ.ም." (Amharic) or "Tikimt 15, 2018 E.C." (English).
 */
export function formatEthiopianDate(
  input: Date | string | EthiopianDate,
  options: FormatEthiopianOptions = {},
): string {
  const locale = options.locale ?? 'am';
  const format = options.format ?? 'long';
  const includeEra = options.includeEra ?? true;

  const eth: EthiopianDate =
    typeof input === 'object' && input !== null && !(input instanceof Date) && 'year' in input
      ? (input as EthiopianDate)
      : gregorianToEthiopian(input as Date | string);

  const monthInfo = ETHIOPIAN_MONTHS[eth.month - 1] || {
    nameEn: `Month ${eth.month}`,
    nameAm: `ወር ${eth.month}`,
  };

  const monthName = locale === 'am' ? monthInfo.nameAm : monthInfo.nameEn;
  const eraSuffix = includeEra ? (locale === 'am' ? ' ዓ.ም.' : ' E.C.') : '';

  switch (format) {
    case 'numeric':
      return `${String(eth.day).padStart(2, '0')}/${String(eth.month).padStart(2, '0')}/${eth.year}${eraSuffix}`;
    case 'short':
      return locale === 'am'
        ? `${monthName} ${eth.day}/${eth.year}`
        : `${monthName} ${eth.day}, ${eth.year}`;
    case 'medium':
      return locale === 'am'
        ? `${monthName} ${eth.day}፣ ${eth.year}${eraSuffix}`
        : `${monthName} ${eth.day}, ${eth.year}${eraSuffix}`;
    case 'long':
    default:
      return locale === 'am'
        ? `${monthName} ${eth.day} ቀን ${eth.year}${eraSuffix}`
        : `${monthName} ${eth.day}, ${eth.year}${eraSuffix}`;
  }
}

/**
 * Converts an integer into its traditional Ge'ez numeral representation.
 * Supports integers from 1 up to 100,000.
 * Examples: 1 -> ፩, 15 -> ፲፭, 75 -> ፸፭, 2018 -> ፳፻፲፰.
 */
export function toGeezNumeral(num: number): string {
  if (num <= 0 || !Number.isInteger(num)) return String(num);

  const ones = ['', '፩', '፪', '፫', '፬', '፭', '፮', '፯', '፰', '፱'];
  const tens = ['', '፲', '፳', '፴', '፵', '፶', '፷', '፸', '፹', '፺'];

  function convertTwoDigits(n: number): string {
    const t = Math.floor(n / 10);
    const o = n % 10;
    return tens[t]! + ones[o]!;
  }

  if (num < 100) {
    return convertTwoDigits(num);
  }

  let result = '';
  const hundreds = Math.floor(num / 100);
  const remainder = num % 100;

  if (hundreds > 0) {
    if (hundreds === 1) {
      result += '፻';
    } else {
      result += convertTwoDigits(hundreds) + '፻';
    }
  }

  if (remainder > 0) {
    result += convertTwoDigits(remainder);
  }

  return result;
}

/**
 * Parses an Ethiopian date string in either "YYYY-MM-DD", "DD/MM/YYYY", or localized format.
 */
export function parseEthiopianDate(str: string): EthiopianDate {
  const trimmed = str.trim();

  // 1. Try ISO-like YYYY-MM-DD
  const isoMatch = trimmed.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
  if (isoMatch) {
    const year = parseInt(isoMatch[1]!, 10);
    const month = parseInt(isoMatch[2]!, 10);
    const day = parseInt(isoMatch[3]!, 10);
    return { year, month, day };
  }

  // 2. Try DD/MM/YYYY
  const slashMatch = trimmed.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})/);
  if (slashMatch) {
    const day = parseInt(slashMatch[1]!, 10);
    const month = parseInt(slashMatch[2]!, 10);
    const year = parseInt(slashMatch[3]!, 10);
    return { year, month, day };
  }

  // 3. Try localized month name (e.g. "መስከረም 1, 2017" or "Meskerem 1 2017")
  for (const m of ETHIOPIAN_MONTHS) {
    if (trimmed.includes(m.nameAm) || trimmed.toLowerCase().includes(m.nameEn.toLowerCase())) {
      const nums = trimmed.match(/\d+/g);
      if (nums && nums.length >= 2) {
        const day = parseInt(nums[0]!, 10);
        const year = parseInt(nums[1]!, 10);
        return { year, month: m.number, day };
      }
    }
  }

  throw new Error(`Unable to parse Ethiopian date: "${str}"`);
}
