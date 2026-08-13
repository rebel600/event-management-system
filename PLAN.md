# Event Management System — Build & Deployment Plan

Target: 10–12 hours. Stack is fixed by the assignment: React, Express, MongoDB,
an external state library (Zustand), and a date library (dayjs). CSS is vanilla —
no Tailwind, no component library.

Current state: `client/` and `server/` exist but are empty. Everything below is TODO.

---

## 0. The rule that governs the whole project

**Store every timestamp as UTC. Keep the event's IANA timezone as a separate
string field. Convert only when rendering.**

Two helpers carry the entire assignment. Write them first, test them by hand,
and never format a date anywhere else:

```js
toUtc(localString, tz)   // "2025-10-15T09:00" + "Asia/Kolkata" -> Date (UTC)
formatInTz(date, tz)     // Date + "America/New_York"           -> "Oct 15, 2025 at 11:30 PM"
```

Validate `end >= start` on the **converted instants**, never on the wall-clock
strings. Comparing strings is what breaks across DST, and it is the first thing
an interviewer will probe.

---

## 1. Scaffold — 1h

- [ ] `client/` — `npm create vite@latest . -- --template react`
- [ ] `client/` — `npm i zustand dayjs`
- [ ] `server/` — `npm init -y`, `npm i express mongoose cors dotenv`, `npm i -D nodemon`
- [ ] MongoDB Atlas: free M0 cluster, DB user, network access `0.0.0.0/0`
- [ ] `server/.env` with `MONGODB_URI`, `PORT=5000`, `CLIENT_ORIGIN`
- [ ] `server/index.js` — express, `cors({ origin: CLIENT_ORIGIN })`, `express.json()`, mongoose connect
- [ ] Add `.gitignore` for `node_modules`, `.env`, `dist`
- [ ] `git init`, first commit

---

## 2. Backend — 2h

### Models (`server/models/`)

```
Profile   { name (String, required, unique), timezone (String, default "UTC") }        + timestamps
Event     { profiles: [ObjectId -> Profile], timezone (String),
            startUtc (Date), endUtc (Date) }                                           + timestamps
EventLog  { eventId (ObjectId), changes: [{ field, from, to }], changedAt (Date) }
```

`EventLog` stores structured before/after values, not a prebuilt sentence — so
"previous vs. updated" renders correctly and date values re-convert when the
viewer switches timezone.

### Routes (`server/routes/`)

- [ ] `GET    /api/profiles`
- [ ] `POST   /api/profiles`          `{ name, timezone? }`
- [ ] `PATCH  /api/profiles/:id`      `{ timezone }`
- [ ] `GET    /api/events?profileId=` populated with profiles
- [ ] `POST   /api/events`            `{ profiles[], timezone, start, end }`
- [ ] `PATCH  /api/events/:id`        diff old vs new, write an `EventLog`
- [ ] `GET    /api/events/:id/logs`

### Wire format

The client sends **wall-clock strings + IANA timezone**, never a pre-converted
instant:

```json
{ "profiles": ["..."], "timezone": "Asia/Kolkata",
  "start": "2025-10-15T09:00", "end": "2025-10-17T09:00" }
```

The server is the only place that calls `toUtc`. One conversion site means no
double-shift bugs.

### Validation (plain `if` checks in the route, no Zod)

- [ ] `profiles` non-empty
- [ ] `timezone` is one of the allowed list
- [ ] `start` and `end` parse
- [ ] `endUtc >= startUtc`

---

## 3. Frontend foundation — 1h

- [ ] `src/lib/api.js` — thin `fetch` wrapper around `VITE_API_URL`
- [ ] `src/lib/time.js` — `toUtc`, `formatInTz`, and the `TIMEZONES` array
- [ ] `src/store.js` — Zustand: `profiles`, `events`, `currentProfileId`,
      `viewerTimezone`, plus the actions that call the API

Hardcode 6–8 timezones. The full IANA list adds nothing and costs a searchable
dropdown:

```js
export const TIMEZONES = [
  { value: "Asia/Kolkata",       label: "India (IST)" },
  { value: "America/New_York",   label: "Eastern Time (ET)" },
  { value: "America/Los_Angeles",label: "Pacific Time (PT)" },
  { value: "Europe/London",      label: "London (GMT/BST)" },
  { value: "Europe/Berlin",      label: "Central Europe (CET)" },
  { value: "Asia/Tokyo",         label: "Japan (JST)" },
  { value: "Australia/Sydney",   label: "Sydney (AET)" },
  { value: "UTC",                label: "UTC" },
];
```

---

## 4. Profiles — 1h

- [ ] Header: `<select>` of profiles + a text input and "Add" button to create one
- [ ] Selecting a profile sets `currentProfileId` and seeds `viewerTimezone`
      from that profile's stored timezone

---

## 5. Create Event — 1h

- [ ] Profiles: a plain checkbox list (not a searchable combobox)
- [ ] Timezone: native `<select>` from `TIMEZONES`
- [ ] Start / End: native `<input type="date">` + `<input type="time">`
- [ ] Client-side `end >= start` check, inline error message
- [ ] Submit, then refresh the event list

Native date and time inputs are the single biggest time saver here — they are
keyboard- and screen-reader-correct for free.

---

## 6. Events list — 2h

- [ ] "View in Timezone" `<select>`; changing it PATCHes the current profile so
      the choice persists
- [ ] Filter events by `currentProfileId`; show all when no profile is selected
- [ ] Event card: assigned profile names, Start, End, `Created …`, `Updated …`
- [ ] Every timestamp goes through `formatInTz(date, viewerTimezone)` — no exceptions
- [ ] `Edit` and `View Logs` buttons

---

## 7. Edit modal + update logs — 1.5h

- [ ] One `Modal` component: fixed backdrop, centered panel, `Escape` to close,
      `document.body` overflow hidden while open. Reuse it for both modals.
- [ ] Edit modal — same fields as create, prefilled, PATCHes the event
- [ ] History modal — `GET /logs`, render each entry as
      `field: from → to` with `formatInTz(changedAt, viewerTimezone)`
- [ ] Verify the bonus: switch viewer timezone, confirm every log timestamp moves

---

## 8. CSS pass — 1.5h

One `App.css`, roughly 250 lines. Tokens at the top so no color is written twice:

```css
:root {
  --accent: #6d4aff;  --accent-hover: #5b38f0;
  --bg: #f5f5f7;      --surface: #fff;      --input-bg: #f4f4f6;
  --border: #e6e6ec;  --text: #14141a;      --text-muted: #85858f;
  --radius: 10px;     --shadow-card: 0 1px 2px rgb(20 20 26 / 6%);
}
```

- [ ] Two-column grid, collapsing to one at `max-width: 860px`
- [ ] Card, input, button, checkbox-row, modal styles
- [ ] `:focus-visible` ring on every interactive element

---

## 9. Deployment — 1h

### Database
- [ ] Atlas cluster already live from step 1; confirm network access allows the
      server's egress

### Server → Render
- [ ] Push to GitHub first — Render deploys from a repo
- [ ] New Web Service, root directory `server`
- [ ] Build `npm install`, start `node index.js`
- [ ] Env vars: `MONGODB_URI`, `CLIENT_ORIGIN` (fill after the client is live)
- [ ] Confirm the health route responds

### Client → Vercel
- [ ] New Project, root directory `client`, framework preset Vite
- [ ] Env var `VITE_API_URL` = the Render URL
- [ ] Deploy, copy the URL

### Close the loop
- [ ] Set `CLIENT_ORIGIN` on Render to the Vercel URL, redeploy
- [ ] Test create → edit → view logs against production
- [ ] Switch timezone in production and confirm timestamps convert

**Order matters:** server first (the client needs its URL at build time), then
client, then back to the server to fix CORS.

---

## 10. Submission — 1h

- [ ] README: setup steps, env vars, and a short section on the UTC-storage
      decision and why `end >= start` is checked on instants
- [ ] Video walkthrough — demo two profiles in different timezones viewing the
      same event, then edit it and show the log converting
- [ ] Submit repo link, live link, and video to the Google Form

---

## Test cases worth running before you submit

1. Create an event in IST, view it as a profile in ET — the wall-clock time shifts, the instant does not.
2. Set start and end to the same day, end one hour earlier — rejected on both client and server.
3. Edit an event, then switch viewer timezone — the log timestamps move with it.
4. Assign one event to two profiles, view from each — both see it.
5. Create an event spanning a DST boundary and confirm the duration is right.
