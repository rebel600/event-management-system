import { useState } from "react";
import dayjs from "dayjs";

import DatePicker from "./DatePicker.jsx";
import ProfileSelect from "./ProfileSelect.jsx";
import Select from "./Select.jsx";
import TimePicker from "./TimePicker.jsx";
import { TIMEZONES } from "../../helper/timezones.js";
import useStore from "../store/index.js";

// Read per render, not once at module load, so a tab left open overnight does
// not keep yesterday's date as the floor.
const today = () => dayjs().format("YYYY-MM-DD");

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

  const setField = (name, value) => {
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

    if (form.startDate < today()) {
      setError("An event cannot start in the past.");
      return;
    }

    // Compared as wall-clock strings in one timezone, so a plain string
    // compare is safe here. The server re-checks on the converted instants.
    if (
      `${form.endDate}T${form.endTime}` <
      `${form.startDate}T${form.startTime}`
    ) {
      setError("The end must be after the start.");
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
            <label>Start date</label>

            {/* New events cannot start in the past. */}
            <DatePicker
              value={form.startDate}
              onChange={(date) => setField("startDate", date)}
              min={today()}
              ariaLabel="Start date"
            />
          </div>

          <div className="form-group">
            <label>Start time</label>

            <TimePicker
              value={form.startTime}
              onChange={(time) => setField("startTime", time)}
              ariaLabel="Start time"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>End date</label>

            <DatePicker
              value={form.endDate}
              onChange={(date) => setField("endDate", date)}
              min={form.startDate || today()}
              ariaLabel="End date"
            />
          </div>

          <div className="form-group">
            <label>End time</label>

            <TimePicker
              value={form.endTime}
              onChange={(time) => setField("endTime", time)}
              ariaLabel="End time"
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