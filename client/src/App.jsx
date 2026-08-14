import { useEffect, useState } from "react";

import CreateEventForm from "./components/CreateEventForm.jsx";
import EditEventModal from "./components/EditEventModal.jsx";
import EventCard from "./components/EventCard.jsx";
import EventLogsModal from "./components/EventLogsModal.jsx";
import ProfileSelect from "./components/ProfileSelect.jsx";
import Select from "./components/Select.jsx";

import { TIMEZONES } from "../helper/timezones.js";
import useStore from "./store";
import { getBrowserTimezone } from "./store/viewerStore.js";

const VIEWER_TIMEZONE_OPTIONS = TIMEZONES.map((timezone) => ({
  value: timezone.value,
  label: `View in ${timezone.label}`,
}));


function App() {
  const events = useStore((state) => state.events);

  const currentProfileId = useStore(
    (state) => state.currentProfileId,
  );

  const viewerTimezone = useStore(
    (state) => state.viewerTimezone,
  );

  const fetchProfiles = useStore(
    (state) => state.fetchProfiles,
  );

  const fetchEvents = useStore(
    (state) => state.fetchEvents,
  );

  const setCurrentProfileId = useStore(
    (state) => state.setCurrentProfileId,
  );

  const setViewerTimezone = useStore(
    (state) => state.setViewerTimezone,
  );

  const updateProfile = useStore(
    (state) => state.updateProfile,
  );

  const fetchEventLogs = useStore(
    (state) => state.fetchEventLogs,
  );

  const clearEventLogs = useStore(
    (state) => state.clearEventLogs,
  );

  // The select binds to the raw choice so it can sit empty, while everything
  // that formats a time needs a real zone.
  const displayTimezone = viewerTimezone || getBrowserTimezone();

  const [editingEvent, setEditingEvent] =
    useState(null);

  const [logsEvent, setLogsEvent] =
    useState(null);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  useEffect(() => {
    fetchEvents(currentProfileId);
  }, [currentProfileId, fetchEvents]);

  const handleViewerTimezoneChange = async (timezone) => {
    setViewerTimezone(timezone);

    if (currentProfileId) {
      try {
        await updateProfile(currentProfileId, {
          timezone,
        });
      } catch {
        // Store already records the error.
      }
    }
  };

  const handleLogs = async (event) => {
    clearEventLogs();

    try {
      await fetchEventLogs(event._id);
      setLogsEvent(event);
    } catch {
      setLogsEvent(event);
    }
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <span className="section-kicker">
            EVENT MANAGEMENT
          </span>

          <h1>Events</h1>
        </div>

        <div className="header-actions">
          <ProfileSelect
            mode="single"
            value={currentProfileId}
            onChange={setCurrentProfileId}
            placeholder="Select profile"
            searchPlaceholder="Search current profile..."
            defaultTimezone={displayTimezone}
          />

          <Select
            value={viewerTimezone}
            onChange={handleViewerTimezoneChange}
            options={VIEWER_TIMEZONE_OPTIONS}
            placeholder="Select timezone"
            ariaLabel="View events in timezone"
          />

        </div>
      </header>

      <main className="app-content">
        <section className="panel">
          <div className="section-heading">
            <div>
              <span className="section-kicker">
                SCHEDULE
              </span>

              <h2>Events</h2>
            </div>
          </div>

          {events.length === 0 ? (
            <div className="empty-state">
              <strong>No events found</strong>
              <span>
                Create an event from the panel.
              </span>
            </div>
          ) : (
            <div className="event-list">
              {events.map((event) => (
                <EventCard
                  key={event._id}
                  event={event}
                  viewerTimezone={displayTimezone}
                  onEdit={setEditingEvent}
                  onLogs={handleLogs}
                />
              ))}
            </div>
          )}
        </section>

        <CreateEventForm />
      </main>

      {editingEvent && (
        <EditEventModal
          key={editingEvent._id}
          event={editingEvent}
          onClose={() => setEditingEvent(null)}
        />
      )}

      {logsEvent && (
        <EventLogsModal
          viewerTimezone={displayTimezone}
          onClose={() => setLogsEvent(null)}
        />
      )}
    </div>
  );
}

export default App;