import { useMemo } from 'react';
import DateObject from 'react-date-object';
import persian from 'react-date-object/calendars/persian';
import persian_en from 'react-date-object/locales/persian_en';
import persian_fa from 'react-date-object/locales/persian_fa';

export function convertIsoStrToJalaali(inputIso: string): string {
  const date = new DateObject({
    date: new Date(inputIso),
    calendar: persian,
    locale: persian_en,
    format: 'YYYY/MM/DD',
  });

  return date.format();
}

export function useGetPersianDate(date?: Date | string) {
  return useMemo(() => {
    if (!date) return '';
    const d = new DateObject({
      date: date instanceof Date ? date : new Date(date),
      format: 'dddd DD MMMM  YYYY',
      calendar: persian,
      locale: persian_fa,
    });
    return d.format();
  }, [date]);
}
