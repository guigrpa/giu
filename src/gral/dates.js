import moment               from 'moment';

function startOfToday(fUtc) {
  const out = moment().startOf('day'); // local
  if (fUtc) {
    const mins = out.utcOffset();
    out.utc().add(mins, 'minutes');
  }
  return out;
}

function getTimeInSecs(mom) {
  if (!mom) return null;
  return mom.hours() * 3600 + mom.minutes() * 60 + mom.seconds();
}

export {
  startOfToday,
  getTimeInSecs,
};
