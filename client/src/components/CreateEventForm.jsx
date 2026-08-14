import { useState } from "react";

import { TIMEZONES } from "../../helper/timezones.js";
import useStore from "../store/index.js";

const initialForm = {
  profiles: [],
  timezone: "Asia/Kolkata",
  startDate: "",
  startTime: "",
  endDate: "",
  endTime: "",
};

function CreateEventForm() {
  const profiles = useStore((state) => state.profiles);
  const addEvent = useStore((state) => state.addEvent);
  const fetchEvents = useStore((state) => state.fetchEvents);
  const currentProfileId = useStore(
    (state) => state.currentProfileId,
  );
  const eventsLoading = useStore(
    (state) => state.eventsLoading,
  );

  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const toggleProfile = (profileId) => {
    setForm((current) => {
      const selected = current.profiles.includes(profileId);

      return {
        ...current,
        profiles: selected
          ? current.profiles.filter((id) => id !== profileId)
          : [...current.profiles, profileId],
      };
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (form.profiles.length === 0) {
      setError("Select at least one profile.");
      return;
    }

    if (
      !form.startDate ||
      !form.startTime ||
      !form.endDate ||
      !form.endTime
    ) {
      setError("Start and end date/time are required.");
      return;
    }

    try {
      await addEvent({
        profiles: form.profiles,
        timezone: form.timezone,
        start: `${form.startDate}T${form.startTime}`,
        end: `${form.endDate}T${form.endTime}`,
      });

      setForm((current) => ({
        ...initialForm,
        timezone: current.timezone,
      }));

      await fetchEvents(currentProfileId);
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  return (
    <section className="panel">
      <div className="section-heading">
        <div>
          <span className="section-kicker">NEW</span>
          <h2>Create Event</h2>
        </div>
      </div>

      <form className="event-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Profiles</label>

          <div className="profile-list">
            {profiles.map((profile) => {
              const checked = form.profiles.includes(
                profile._id,
              );

              return (
                <label
                  key={profile._id}
                  className={`profile-option ${
                    checked ? "selected" : ""
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() =>
                      toggleProfile(profile._id)
                    }
                  />

                  <span>
                    <strong>{profile.name}</strong>
                    <small>{profile.timezone}</small>
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="event-timezone">
            Event timezone
          </label>

          <select
            id="event-timezone"
            name="timezone"
            value={form.timezone}
            onChange={handleChange}
          >
            {TIMEZONES.map((timezone) => (
              <option
                key={timezone.value}
                value={timezone.value}
              >
                {timezone.label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="start-date">Start date</label>

            <input
              id="start-date"
              type="date"
              name="startDate"
              value={form.startDate}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="start-time">Start time</label>

            <input
              id="start-time"
              type="time"
              name="startTime"
              value={form.startTime}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="end-date">End date</label>

            <input
              id="end-date"
              type="date"
              name="endDate"
              value={form.endDate}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="end-time">End time</label>

            <input
              id="end-time"
              type="time"
              name="endTime"
              value={form.endTime}
              onChange={handleChange}
            />
          </div>
        </div>

        {error && <div className="form-error">{error}</div>}

        <button
          type="submit"
          className="primary-button"
          disabled={eventsLoading}
        >
          {eventsLoading ? "Creating..." : "Create Event"}
        </button>
      </form>
    </section>
  );
}

export default CreateEventForm;