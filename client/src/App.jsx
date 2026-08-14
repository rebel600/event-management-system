import { useEffect, useState } from "react";

import AddProfileModal from "./components/AddProfileModal.jsx";
import CreateEventForm from "./components/CreateEventForm.jsx";
import EditEventModal from "./components/EditEventModal.jsx";
import EventCard from "./components/EventCard.jsx";
import EventLogsModal from "./components/EventLogsModal.jsx";

import { TIMEZONES } from "../helper/timezones.js";
import useStore from "./store";


function App() {
  const profiles = useStore((state) => state.profiles);
  const events = useStore((state) => state.events);

  const currentProfileId = useStore(
    (state) => state.currentProfileId,
  );

  const viewerTimezone = useStore(
    (state) => state.viewerTimezone,
  );

  const profilesLoading = useStore(
    (state) => state.profilesLoading,
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

  const [showProfileModal, setShowProfileModal] =
    useState(false);

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

  const handleProfileChange = (event) => {
    setCurrentProfileId(event.target.value);
  };

  const handleViewerTimezoneChange = async (
    event,
  ) => {
    const timezone = event.target.value;

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
          <select
            value={currentProfileId || ""}
            onChange={handleProfileChange}
            disabled={profilesLoading}
          >
            <option value="" disabled>
              Select profile
            </option>

            {profiles.map((profile) => (
              <option
                key={profile._id}
                value={profile._id}
              >
                {profile.name}
              </option>
            ))}
          </select>

          <select
            value={viewerTimezone}
            onChange={handleViewerTimezoneChange}
          >
            {TIMEZONES.map((timezone) => (
              <option
                key={timezone.value}
                value={timezone.value}
              >
                View in {timezone.label}
              </option>
            ))}
          </select>

          <button
            type="button"
            className="primary-button"
            onClick={() => setShowProfileModal(true)}
          >
            + Add Profile
          </button>
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
                  viewerTimezone={viewerTimezone}
                  onEdit={setEditingEvent}
                  onLogs={handleLogs}
                />
              ))}
            </div>
          )}
        </section>

        <CreateEventForm />
      </main>

      {showProfileModal && (
        <AddProfileModal
          onClose={() => setShowProfileModal(false)}
        />
      )}

      {editingEvent && (
        <EditEventModal
          event={editingEvent}
          onClose={() => setEditingEvent(null)}
        />
      )}

      {logsEvent && (
        <EventLogsModal
          viewerTimezone={viewerTimezone}
          onClose={() => setLogsEvent(null)}
        />
      )}
    </div>
  );
}

export default App;