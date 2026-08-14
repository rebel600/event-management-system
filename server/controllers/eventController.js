import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat.js";

import Event from "../models/Event.js";
import EventLog from "../models/EventLog.js";
import Profile from "../models/Profile.js";

import { fromUtc, toUtc } from "../utils/time.js";
import { ALLOWED_TIMEZONES } from "../utils/timezones.js";

dayjs.extend(customParseFormat);

const isValidTimezone = (timezone) => {
  return ALLOWED_TIMEZONES.includes(timezone);
};

const isValidDate = (date) => {
  if (typeof date !== "string") {
    return false;
  }

  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(date)) {
    return false;
  }

  return dayjs(date, "YYYY-MM-DDTHH:mm", true).isValid();
};

const normalizeProfileIds = (profiles = []) => {
  return profiles.map((profile) => profile.toString()).sort();
};

const hasDuplicateProfiles = (profiles) => {
  const normalizedProfiles = normalizeProfileIds(profiles);

  return new Set(normalizedProfiles).size !== normalizedProfiles.length;
};

const profilesChanged = (oldProfiles, newProfiles) => {
  return (
    JSON.stringify(normalizeProfileIds(oldProfiles)) !==
    JSON.stringify(normalizeProfileIds(newProfiles))
  );
};

const hasValidDateRange = (startUtc, endUtc) => {
  return (
    !Number.isNaN(startUtc.getTime()) &&
    !Number.isNaN(endUtc.getTime()) &&
    endUtc.getTime() >= startUtc.getTime()
  );
};

const formatWallClock = (date, timezone) => {
  return fromUtc(date, timezone).format("YYYY-MM-DDTHH:mm");
};

const validateProfiles = async (profiles) => {
  if (!Array.isArray(profiles) || profiles.length === 0) {
    return "At least one profile is required.";
  }

  if (hasDuplicateProfiles(profiles)) {
    return "Duplicate profiles are not allowed.";
  }

  const profileCount = await Profile.countDocuments({
    _id: { $in: profiles },
  });

  const uniqueProfileCount = normalizeProfileIds(profiles).length;

  if (profileCount !== uniqueProfileCount) {
    return "One or more profiles are invalid or do not exist.";
  }

  return null;
};

const convertEventTimes = (start, end, timezone) => {
  const startUtc = toUtc(start, timezone);
  const endUtc = toUtc(end, timezone);

  if (!hasValidDateRange(startUtc, endUtc)) {
    return null;
  }

  return {
    startUtc,
    endUtc,
  };
};

// GET /api/events
const getEvents = async (req, res) => {
  const { profileId } = req.query;

  const query = profileId ? { profiles: profileId } : {};

  const events = await Event.find(query)
    .populate("profiles")
    .sort({ startUtc: 1 });

  res.json(events);
};

// POST /api/events
const createEvent = async (req, res) => {
  const { profiles, timezone, start, end } = req.body;

  if (!isValidTimezone(timezone)) {
    return res.status(400).json({
      error: "Invalid timezone.",
    });
  }

  const profileError = await validateProfiles(profiles);

  if (profileError) {
    return res.status(400).json({
      error: profileError,
    });
  }

  if (!isValidDate(start) || !isValidDate(end)) {
    return res.status(400).json({
      error: "Start and end must use YYYY-MM-DDTHH:mm format.",
    });
  }

  const eventTimes = convertEventTimes(start, end, timezone);

  if (!eventTimes) {
    return res.status(400).json({
      error: "End date/time must be after or equal to start date/time.",
    });
  }

  const event = await Event.create({
    profiles,
    timezone,
    startUtc: eventTimes.startUtc,
    endUtc: eventTimes.endUtc,
  });

  const populatedEvent = await event.populate("profiles");

  res.status(201).json(populatedEvent);
};

// PATCH /api/events/:id
const updateEvent = async (req, res) => {
  const { id } = req.params;
  const { profiles, timezone, start, end } = req.body;

  const event = await Event.findById(id);

  if (!event) {
    return res.status(404).json({
      error: "Event not found.",
    });
  }

  const nextTimezone = timezone ?? event.timezone;
  const nextProfiles = profiles ?? event.profiles;

  if (!isValidTimezone(nextTimezone)) {
    return res.status(400).json({
      error: "Invalid timezone.",
    });
  }

  const profileError = await validateProfiles(nextProfiles);

  if (profileError) {
    return res.status(400).json({
      error: profileError,
    });
  }

  let nextStartUtc = event.startUtc;
  let nextEndUtc = event.endUtc;

  const hasStartUpdate = start !== undefined;
  const hasEndUpdate = end !== undefined;
  const hasTimezoneUpdate = timezone !== undefined;

  const hasDateOrTimezoneUpdate =
    hasStartUpdate || hasEndUpdate || hasTimezoneUpdate;

  if (hasDateOrTimezoneUpdate) {
    let nextStartWallClock;
    let nextEndWallClock;

    if (hasStartUpdate) {
      if (!isValidDate(start)) {
        return res.status(400).json({
          error: "Invalid start date.",
        });
      }

      nextStartWallClock = start;
    } else {
      nextStartWallClock = formatWallClock(event.startUtc, event.timezone);
    }

    if (hasEndUpdate) {
      if (!isValidDate(end)) {
        return res.status(400).json({
          error: "Invalid end date.",
        });
      }

      nextEndWallClock = end;
    } else {
      nextEndWallClock = formatWallClock(event.endUtc, event.timezone);
    }

    const eventTimes = convertEventTimes(
      nextStartWallClock,
      nextEndWallClock,
      nextTimezone,
    );

    if (!eventTimes) {
      return res.status(400).json({
        error: "End date/time must be after or equal to start date/time.",
      });
    }

    nextStartUtc = eventTimes.startUtc;
    nextEndUtc = eventTimes.endUtc;
  }

  const changes = [];

  if (profilesChanged(event.profiles, nextProfiles)) {
    changes.push({
      field: "profiles",
      from: [...event.profiles],
      to: [...nextProfiles],
    });
  }

  if (event.timezone !== nextTimezone) {
    changes.push({
      field: "timezone",
      from: event.timezone,
      to: nextTimezone,
    });
  }

  if (event.startUtc.getTime() !== nextStartUtc.getTime()) {
    changes.push({
      field: "startUtc",
      from: event.startUtc,
      to: nextStartUtc,
    });
  }

  if (event.endUtc.getTime() !== nextEndUtc.getTime()) {
    changes.push({
      field: "endUtc",
      from: event.endUtc,
      to: nextEndUtc,
    });
  }

  event.profiles = nextProfiles;
  event.timezone = nextTimezone;
  event.startUtc = nextStartUtc;
  event.endUtc = nextEndUtc;

  await event.save();

  if (changes.length > 0) {
    await EventLog.create({
      eventId: event._id,
      changes,
      changedAt: new Date(),
    });
  }

  const populatedEvent = await event.populate("profiles");

  res.json(populatedEvent);
};

// GET /api/events/:id/logs
const getEventLogs = async (req, res) => {
  const { id } = req.params;

  const logs = await EventLog.find({
    eventId: id,
  }).sort({ changedAt: -1 });

  res.json(logs);
};

export { getEvents, createEvent, updateEvent, getEventLogs };
