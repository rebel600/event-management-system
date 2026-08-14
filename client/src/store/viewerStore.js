import { TIMEZONES } from "../../helper/timezones.js";

// Intl often reports a legacy alias rather than the modern IANA name —
// Windows commonly returns Asia/Calcutta for Asia/Kolkata. The server
// validates timezone against a fixed enum, so an alias reaching it is
// rejected outright. Map the aliases for the zones we support.
const TIMEZONE_ALIASES = {
  "Asia/Calcutta": "Asia/Kolkata",
  "Asia/Dacca": "Asia/Dhaka",
  "US/Eastern": "America/New_York",
  "US/Pacific": "America/Los_Angeles",
  "America/Buenos_Aires": "America/Argentina/Buenos_Aires",
  "Europe/Belfast": "Europe/London",
  GB: "Europe/London",
  "GB-Eire": "Europe/London",
  "Etc/UTC": "UTC",
  "Etc/GMT": "UTC",
  GMT: "UTC",
  UCT: "UTC",
  Universal: "UTC",
  Zulu: "UTC",
};

const isSupported = (timezone) => {
  return TIMEZONES.some((entry) => entry.value === timezone);
};

// Always returns a zone the server will accept, falling back to UTC when the
// detected zone is not one we offer.
export const getBrowserTimezone = () => {
  const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const canonical = TIMEZONE_ALIASES[detected] || detected;

  return isSupported(canonical) ? canonical : "UTC";
};

const createViewerSlice = (set) => ({
  // Empty until the viewer picks one or a profile supplies it, so the header
  // reads "Select timezone" rather than presenting a guess as a choice.
  // Rendering falls back to the browser zone via getBrowserTimezone().
  viewerTimezone: "",

  setViewerTimezone: (timezone) => {
    set({
      viewerTimezone: timezone,
    });
  },
});

export default createViewerSlice;
