'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  gregorianToEthiopian,
  ethiopianToGregorian,
  formatEthiopianDate,
  isEthiopianLeapYear,
  getDaysInEthiopianMonth,
  toGeezNumeral,
  ETHIOPIAN_MONTHS,
} from '@selet/shared';
import { Calendar as CalendarIcon, ArrowLeftRight, Sparkles } from 'lucide-react';

export interface EthiopianDatePickerProps {
  value?: string; // ISO date string (e.g. "2025-10-15T00:00:00.000Z" or "2025-10-15")
  onChange: (isoDateString: string) => void;
  locale?: 'en' | 'am';
  defaultCalendar?: 'ETHIOPIAN' | 'GREGORIAN';
  label?: string;
  showGeez?: boolean;
}

export function EthiopianDatePicker({
  value,
  onChange,
  locale = 'en',
  defaultCalendar = 'ETHIOPIAN',
  label,
  showGeez = true,
}: EthiopianDatePickerProps) {
  const [calendarMode, setCalendarMode] = useState<'ETHIOPIAN' | 'GREGORIAN'>(defaultCalendar);

  // Derive initial Gregorian date safely
  const currentDate = useMemo(() => {
    if (!value) return new Date();
    const parsed = new Date(value);
    return isNaN(parsed.getTime()) ? new Date() : parsed;
  }, [value]);

  // Derived Ethiopian date
  const ethDate = useMemo(() => {
    return gregorianToEthiopian(currentDate);
  }, [currentDate]);

  const [ethYear, setEthYear] = useState<number>(ethDate.year);
  const [ethMonth, setEthMonth] = useState<number>(ethDate.month);
  const [ethDay, setEthDay] = useState<number>(ethDate.day);

  // Keep internal states in sync with external value
  useEffect(() => {
    setEthYear(ethDate.year);
    setEthMonth(ethDate.month);
    setEthDay(ethDate.day);
  }, [ethDate]);

  const isLeap = useMemo(() => isEthiopianLeapYear(ethYear), [ethYear]);
  const maxDaysInMonth = useMemo(
    () => getDaysInEthiopianMonth(ethYear, ethMonth),
    [ethYear, ethMonth],
  );

  // Ensure day doesn't exceed month limit (especially for Pagumē 5 or 6)
  useEffect(() => {
    if (ethDay > maxDaysInMonth) {
      setEthDay(maxDaysInMonth);
      const newGreg = ethiopianToGregorian(ethYear, ethMonth, maxDaysInMonth);
      onChange(newGreg.toISOString());
    }
  }, [ethDay, maxDaysInMonth, ethYear, ethMonth, onChange]);

  const handleEthChange = (newYear: number, newMonth: number, newDay: number) => {
    const validMaxDay = getDaysInEthiopianMonth(newYear, newMonth);
    const clampedDay = Math.min(newDay, validMaxDay);
    setEthYear(newYear);
    setEthMonth(newMonth);
    setEthDay(clampedDay);

    const greg = ethiopianToGregorian(newYear, newMonth, clampedDay);
    onChange(greg.toISOString());
  };

  const handleGregorianInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (!val) return;
    const greg = new Date(val);
    if (!isNaN(greg.getTime())) {
      onChange(greg.toISOString());
    }
  };

  // Formatted representations
  const formattedEthString = formatEthiopianDate(currentDate, { locale });
  const formattedGregString = currentDate.toLocaleDateString(locale === 'am' ? 'am-ET' : 'en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const geezRepresentation = useMemo(() => {
    try {
      return `${toGeezNumeral(ethDay)} / ${toGeezNumeral(ethMonth)} / ${toGeezNumeral(ethYear)}`;
    } catch {
      return '';
    }
  }, [ethDay, ethMonth, ethYear]);

  // Year options around current Ethiopian year
  const yearOptions = useMemo(() => {
    const options: number[] = [];
    const base = ethYear || 2017;
    for (let y = base - 6; y <= base + 10; y++) {
      options.push(y);
    }
    return options;
  }, [ethYear]);

  const yyyyMmDd = currentDate.toISOString().split('T')[0];

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3">
      {/* Header with Mode Switcher */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
          <CalendarIcon className="w-4 h-4 text-emerald-600" />
          <span>{label || (locale === 'am' ? 'የቀን ምርጫ' : 'Date Selection')}</span>
        </label>

        <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200 text-xs">
          <button
            type="button"
            onClick={() => setCalendarMode('ETHIOPIAN')}
            className={`px-2 py-0.5 font-semibold rounded-md transition-all ${
              calendarMode === 'ETHIOPIAN'
                ? 'bg-white text-emerald-700 shadow-2xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            ዓ.ም. (E.C.)
          </button>
          <button
            type="button"
            onClick={() => setCalendarMode('GREGORIAN')}
            className={`px-2 py-0.5 font-semibold rounded-md transition-all ${
              calendarMode === 'GREGORIAN'
                ? 'bg-white text-emerald-700 shadow-2xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            እ.ኤ.አ (G.C.)
          </button>
        </div>
      </div>

      {/* Input Controls */}
      {calendarMode === 'ETHIOPIAN' ? (
        <div className="space-y-2">
          <div className="grid grid-cols-12 gap-2">
            {/* Day Selector */}
            <div className="col-span-3">
              <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">
                {locale === 'am' ? 'ቀን' : 'Day'}
              </label>
              <select
                value={ethDay}
                onChange={(e) => handleEthChange(ethYear, ethMonth, Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                {Array.from({ length: maxDaysInMonth }, (_, i) => i + 1).map((d) => (
                  <option key={d} value={d}>
                    {d} {showGeez ? `(${toGeezNumeral(d)})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Month Selector */}
            <div className="col-span-5">
              <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">
                {locale === 'am' ? 'ወር' : 'Month'}
              </label>
              <select
                value={ethMonth}
                onChange={(e) => handleEthChange(ethYear, Number(e.target.value), ethDay)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                {ETHIOPIAN_MONTHS.map((m) => (
                  <option key={m.number} value={m.number}>
                    {m.number}. {locale === 'am' ? m.nameAm : m.nameEn} {m.number === 13 ? '(ጳጉሜ)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Year Selector */}
            <div className="col-span-4">
              <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">
                {locale === 'am' ? 'ዓመት' : 'Year'}
              </label>
              <select
                value={ethYear}
                onChange={(e) => handleEthChange(Number(e.target.value), ethMonth, ethDay)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                {yearOptions.map((y) => (
                  <option key={y} value={y}>
                    {y} ዓ.ም.
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 13th Month / Leap Year Alert Notice */}
          {ethMonth === 13 && (
            <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>
                {isLeap
                  ? (locale === 'am'
                      ? `የዘመነ ዮሐንስ መዝጊያ: ${ethYear} ዓ.ም. ተረፈ ዘመን (Leap Year) ስለሆነ ጳጉሜ 6 ቀናት አሏት!`
                      : `Ethiopian Leap Year (${ethYear} E.C.): Month 13 (Pagumē) has 6 days!`)
                  : (locale === 'am'
                      ? `መደበኛ ዓመት: ${ethYear} ዓ.ም. ጳጉሜ 5 ቀናት አሏት።`
                      : `Standard Ethiopian Year: Month 13 (Pagumē) has 5 days.`)}
              </span>
            </div>
          )}
        </div>
      ) : (
        <div>
          <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">
            {locale === 'am' ? 'ጎርጎሪዮሳዊ ቀን' : 'Gregorian Date'}
          </label>
          <input
            type="date"
            value={yyyyMmDd}
            onChange={handleGregorianInputChange}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
      )}

      {/* Live Dual Calendar Conversion Summary */}
      <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-2">
        <div className="flex items-center gap-1.5">
          <ArrowLeftRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-medium text-slate-900">{formattedEthString}</span>
          <span className="text-slate-400">•</span>
          <span className="text-slate-500">{formattedGregString} G.C.</span>
        </div>

        {showGeez && geezRepresentation && (
          <div className="text-[11px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            ግዕዝ: {geezRepresentation}
          </div>
        )}
      </div>
    </div>
  );
}
