import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";

dayjs.extend(utc);
dayjs.extend(timezone);

export const toUtc = (date, timezoneName) => {
  return dayjs.tz(date, timezoneName).toDate();
};

export const fromUtc = (date, timezoneName) => {
  return dayjs(date).tz(timezoneName);
};

export const formatInTz = (date, timezoneName) => {
  return dayjs
    .utc(date)
    .tz(timezoneName)
    .format("MMM D, YYYY • h:mm A");
};

export const formatWallClock = (date, timezoneName) => {
  const localDate = dayjs.utc(date).tz(timezoneName);

  return {
    date: localDate.format("YYYY-MM-DD"),
    time: localDate.format("HH:mm"),
  };
};