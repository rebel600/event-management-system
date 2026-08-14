# Event Management System

Create events, assign them to people, and read the times back in whatever
timezone you pick.

An admin makes profiles. Each profile has a name and a timezone. An event is
created in one timezone and can be shared with several profiles. When you change
the "View in" timezone at the top, every date on the page re-renders in that
zone. Editing an event keeps a history of what changed.

Live: _add your Railway URL here_

## How the time part works

This is the only tricky bit, so it is worth stating plainly.

Every timestamp is stored in the database as UTC. The timezone the event was
created in is kept next to it as a separate text field, like `Asia/Kolkata`.
Nothing is stored as local time.

The browser sends the time as you typed it, plus the timezone name:

```json
{ "timezone": "Asia/Kolkata", "start": "2026-03-01T09:00", "end": "2026-03-01T17:00" }
```

The server does the conversion to UTC. It is the only place that converts, so
there is no chance of shifting a time twice.

The check that the end is not before the start runs on the converted UTC
values, not on the text. Comparing the text breaks around daylight saving.

## Tech

React, Zustand, and dayjs on the front end. Express and Mongoose on the back
end. MongoDB Atlas for the database. Plain CSS, no UI library.

## Running it locally

You need Node 20 or newer and a MongoDB connection string.

Copy the example env files and fill them in:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

In `server/.env` set `MONGODB_URI` to your MongoDB connection string. Leave
`VITE_API_URL` in `client/.env` empty for local work, since Vite forwards `/api`
to the server for you.

Then start both halves in two terminals:

```bash
cd server && npm install && npm run dev     # http://localhost:3000
cd client && npm install && npm run dev     # http://localhost:5173
```

Open the client URL.

## API

| Method | Path                     | What it does                          |
| ------ | ------------------------ | ------------------------------------- |
| GET    | `/api/profiles`          | List profiles                         |
| POST   | `/api/profiles`          | Create a profile                      |
| PATCH  | `/api/profiles/:id`      | Update a profile's timezone           |
| GET    | `/api/events`            | List events, optional `?profileId=`   |
| POST   | `/api/events`            | Create an event                       |
| PATCH  | `/api/events/:id`        | Update an event and record the change |
| GET    | `/api/events/:id/logs`   | History for one event                 |
| GET    | `/health`                | Returns `{ "status": "ok" }`          |

Nine timezones are allowed. The list is in `server/utils/timezones.js` and
`client/helper/timezones.js`, and the two must stay in step.

## Deploying

The whole app runs as one service. The server serves the built React app, so
there is one URL and no CORS to set up.

From the repo root:

```bash
npm run build    # builds the client, installs server deps
npm start        # serves the API and the app
```

On Railway, point the service at the repo root, set `MONGODB_URI`, and generate
a domain. Leave `PORT` alone, the platform sets it.

## Layout

```
client/     React app
  helper/   date and timezone helpers
  src/      components, Zustand store, API wrapper
server/     Express API
  models/   Profile, Event, EventLog
  controllers/, routes/, utils/
```
