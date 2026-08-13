import dayjs from "dayjs";

import Event from "../models/Event.js";
import EventLog from "../models/EventLog.js";
import Profile from "../models/Profile.js";

import { fromUtc, toUtc } from "../utils/time.js";
import { ALLOWED_TIMEZONES } from "../utils/timezones.js";

const isValidTimezone = (timezone) => {
  return ALLOWED_TIMEZONES.includes(timezone);
};

const isValidDate = (date) => {
  return date !== undefined && date !== null && dayjs(date).isValid();
};

const normalizeProfileIds = (profiles = []) => {
  return profiles.map((profile) => profile.toString()).sort();
};

const profilesChanged = (oldProfiles, newProfiles) => {
  const oldIds = normalizeProfileIds(oldProfiles);
  const newIds = normalizeProfileIds(newProfiles);

  return JSON.stringify(oldIds) !== JSON.stringify(newIds);
};

const formatWallClock = (date, timezone) => {
  return fromUtc(date, timezone).format("YYYY-MM-DDTHH:mm");
};

// Get all events, optionally filtered by profileId
const getEvents = async (req, res) => {
  const { profileId } = req.query;

  const query = {};

  if (profileId) {
    query.profiles = profileId;
  }

  const events = await Event.find(query)
    .populate("profiles")
    .sort({ startUtc: 1 });

  res.json(events);
};

// Create a new event
const createEvent = async (req, res) => {
  const { profiles, timezone, start, end } = req.body;

  if (!Array.isArray(profiles) || profiles.length === 0) {
    return res.status(400).json({
      error: "At least one profile is required.",
    });
  }

  if (!timezone || !isValidTimezone(timezone)) {
    return res.status(400).json({
      error: "Invalid timezone.",
    });
  }

  if (!isValidDate(start) || !isValidDate(end)) {
    return res.status(400).json({
      error: "Invalid start or end date.",
    });
  }

  const startUtc = toUtc(start, timezone);
  const endUtc = toUtc(end, timezone);

  if (Number.isNaN(startUtc.getTime()) || Number.isNaN(endUtc.getTime())) {
    return res.status(400).json({
      error: "Invalid start or end date.",
    });
  }

  if (endUtc.getTime() < startUtc.getTime()) {
    return res.status(400).json({
      error: "End date/time must be after or equal to start date/time.",
    });
  }

  const nextProfiles = profiles ?? event.profiles;
  const normalizedProfiles = normalizeProfileIds(nextProfiles);

  if (new Set(normalizedProfiles).size !== normalizedProfiles.length) {
    return res.status(400).json({
      error: "Duplicate profiles are not allowed.",
    });
  }

  const event = await Event.create({
    profiles,
    timezone,
    startUtc,
    endUtc,
  });

  const populatedEvent = await event.populate("profiles");

  res.status(201).json(populatedEvent);
};

// Update an event
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

  if (!Array.isArray(nextProfiles) || nextProfiles.length === 0) {
    return res.status(400).json({
      error: "At least one profile is required.",
    });
  }

  const normalizedProfiles = normalizeProfileIds(nextProfiles);

  if (new Set(normalizedProfiles).size !== normalizedProfiles.length) {
    return res.status(400).json({
      error: "Duplicate profiles are not allowed.",
    });
  }

  let nextStartUtc = event.startUtc;
  let nextEndUtc = event.endUtc;

  const hasStartUpdate = start !== undefined;
  const hasEndUpdate = end !== undefined;
  const timezoneChanged = timezone !== undefined;

  const hasDateOrTimezoneUpdate =
    hasStartUpdate || hasEndUpdate || timezoneChanged;

  if (hasDateOrTimezoneUpdate) {
    let startWallClock;
    let endWallClock;

    if (hasStartUpdate) {
      if (!isValidDate(start)) {
        return res.status(400).json({
          error: "Invalid start date.",
        });
      }

      startWallClock = start;
    } else {
      startWallClock = formatWallClock(event.startUtc, event.timezone);
    }

    if (hasEndUpdate) {
      if (!isValidDate(end)) {
        return res.status(400).json({
          error: "Invalid end date.",
        });
      }

      endWallClock = end;
    } else {
      endWallClock = formatWallClock(event.endUtc, event.timezone);
    }

    nextStartUtc = toUtc(startWallClock, nextTimezone);
    nextEndUtc = toUtc(endWallClock, nextTimezone);

    if (
      Number.isNaN(nextStartUtc.getTime()) ||
      Number.isNaN(nextEndUtc.getTime())
    ) {
      return res.status(400).json({
        error: "Invalid start or end date.",
      });
    }

    if (nextEndUtc.getTime() < nextStartUtc.getTime()) {
      return res.status(400).json({
        error: "End date/time must be after or equal to start date/time.",
      });
    }
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

export { getEvents, createEvent, updateEvent };
