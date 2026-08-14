import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";

dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * Interprets a wall-clock date/time in the supplied timezone
 * and returns the corresponding UTC Date.
 */
const toUtc = (date, timezoneName) => {
  return dayjs.tz(date, timezoneName).toDate();
};

/**
 * Converts an existing instant into the supplied timezone
 * for display or wall-clock extraction.
 */
const fromUtc = (date, timezoneName) => {
  return dayjs(date).tz(timezoneName);
};

export { toUtc, fromUtc };