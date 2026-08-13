import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";

dayjs.extend(utc);
dayjs.extend(timezone);

const toUtc = (date, timezoneName) => {
  return dayjs.tz(date, timezoneName).toDate();
};

 const fromUtc = (date, timezoneName) => {
  return dayjs(date).tz(timezoneName);
};

export { toUtc, fromUtc };