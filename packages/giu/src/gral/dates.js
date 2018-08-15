// @flow

import moment from '../vendor/moment';
import type { Moment } from './types';

function getUtcFlag(fDate: boolean, fTime: boolean, fUtc: ?boolean): boolean {
  return fUtc != null ? fUtc : !(fDate && fTime);
}

function startOfToday(fUtc: boolean): Moment {
  const out = moment().startOf('day'); // local
  if (fUtc) {
    const mins: number = (out.utcOffset(): any);
    out.utc().add(mins, 'minutes');
  }
  return out;
}

function startOfDefaultDay(fUtc: boolean): Moment {
  const fnMoment = fUtc ? moment.utc : moment;
  return fnMoment({ year: 2013, month: 3, date: 27 }); // ;)
}

function getTimeInSecs(mom: Moment): number {
  return mom.hours() * 3600 + mom.minutes() * 60 + mom.seconds();
}

// Date formatting
const dateFormat = (): string => moment.localeData().longDateFormat('L');
const timeFormat = (fSeconds: boolean): string =>
  `HH:mm${fSeconds ? ':ss' : ''}`;
function dateTimeFormat(
  fDate: boolean,
  fTime: boolean,
  fSeconds: boolean
): string {
  if (!fTime) return dateFormat();
  if (!fDate) return timeFormat(fSeconds);
  return `${dateFormat()} ${timeFormat(fSeconds)}`;
}

function dateTimeFormatNative(fDate: boolean, fTime: boolean): string {
  let out;
  if (fDate && fTime) {
    out = 'YYYY-MM-DDTHH:mm:ss';
  } else if (fDate) {
    out = 'YYYY-MM-DD';
  } else {
    out = 'HH:mm';
  }
  return out;
}

// ==========================================
// Public
// ==========================================
export {
  getUtcFlag,
  startOfToday,
  startOfDefaultDay,
  getTimeInSecs,
  dateFormat,
  timeFormat,
  dateTimeFormat,
  dateTimeFormatNative,
};
