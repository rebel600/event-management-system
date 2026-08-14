import { useState } from "react";

import ProfileSelect from "./ProfileSelect.jsx";
import Select from "./Select.jsx";
import { TIMEZONES } from "../../helper/timezones.js";
import useStore from "../store/index.js";

const TIMEZONE_OPTIONS = TIMEZONES.map((timezone) => ({
  value: timezone.value,
  label: timezone.label,
}));

const initialForm = {
  profiles: [],
  timezone: "Asia/Kolkata",
  startDate: "",
  startTime: "",
  endDate: "",
  endTime: "",
};

function CreateEventForm() {
  const addEvent = useStore((state) => state.addEvent);
  const fetchEvents = useStore((state) => state.fetchEvents);
  const currentProfileId = useStore(
    (state) => state.currentProfileId,
  );

  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");

  // Local to this form. The store's eventsLoading is also raised by fetching
  // the events list, which would make picking a profile read as "Creating...".
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => {
      const next = { ...current, [name]: value };

      // Moving the start past the end would leave a stale invalid range that
      // the end picker's min cannot express, so carry the end along with it.
      if (
        name === "startDate" &&
        next.endDate &&
        next.endDate < next.startDate
      ) {
        next.endDate = next.startDate;
      }

      return next;
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

    setSubmitting(true);

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
    } finally {
      setSubmitting(false);
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

          <ProfileSelect
            value={form.profiles}
            onChange={(profileIds) =>
              setForm((current) => ({
                ...current,
                profiles: profileIds,
              }))
            }
            defaultTimezone={form.timezone}
          />
        </div>

        <div className="form-group">
          <label htmlFor="event-timezone">
            Event timezone
          </label>

          <Select
            value={form.timezone}
            onChange={(timezone) =>
              setForm((current) => ({ ...current, timezone }))
            }
            options={TIMEZONE_OPTIONS}
            placeholder="Select timezone"
            ariaLabel="Event timezone"
          />
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
              min={form.startDate || undefined}
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
          disabled={submitting}
        >
          {submitting ? "Creating..." : "Create Event"}
        </button>
      </form>
    </section>
  );
}

export default CreateEventForm;