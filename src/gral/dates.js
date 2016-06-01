import moment               from 'moment';

function getUtcFlag(fDate, fTime, fUtc) {
  return fUtc != null ? fUtc : !(fDate && fTime);
}

function startOfToday(fUtc) {
  const out = moment().startOf('day'); // local
  if (fUtc) {
    const mins = out.utcOffset();
    out.utc().add(mins, 'minutes');
  }
  return out;
}

function startOfDefaultDay(fUtc) {
  const fnMoment = fUtc ? moment.utc : moment;
  return fnMoment({ year: 2013, month: 3, date: 27 }); // ;)
}

function getTimeInSecs(mom) {
  if (!mom) return null;
  return mom.hours() * 3600 + mom.minutes() * 60 + mom.seconds();
}

// Date formatting
const dateFormat = () => moment.localeData().longDateFormat('L');
const timeFormat = fSeconds => `HH:mm${fSeconds ? ':ss' : ''}`;
function dateTimeFormat(fDate, fTime, fSeconds) {
  if (!fTime) return dateFormat();
  if (!fDate) return timeFormat(fSeconds);
  return `${dateFormat()} ${timeFormat(fSeconds)}`;
}

function dateTimeFormatNative(fDate, fTime) {
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

export {
  getUtcFlag,
  startOfToday,
  startOfDefaultDay,
  getTimeInSecs,
  dateFormat,
  timeFormat,
  dateTimeFormat, dateTimeFormatNative,
};
