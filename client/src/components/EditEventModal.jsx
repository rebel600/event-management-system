import { useState } from "react";

import DatePicker from "./DatePicker.jsx";
import Modal from "./Modal.jsx";
import ProfileSelect from "./ProfileSelect.jsx";
import Select from "./Select.jsx";
import TimePicker from "./TimePicker.jsx";
import { formatWallClock } from "../../helper/time.js";
import { TIMEZONES } from "../../helper/timezones.js";
import useStore from "../store/index.js";

const TIMEZONE_OPTIONS = TIMEZONES.map((timezone) => ({
  value: timezone.value,
  label: timezone.label,
}));

function EditEventModal({ event, onClose }) {
  const updateEvent = useStore((state) => state.updateEvent);
  const fetchEvents = useStore((state) => state.fetchEvents);
  const currentProfileId = useStore(
    (state) => state.currentProfileId,
  );

  const start = formatWallClock(
    event.startUtc,
    event.timezone,
  );

  const end = formatWallClock(
    event.endUtc,
    event.timezone,
  );

  const [form, setForm] = useState({
    profiles: (event.profiles || []).map(
      (profile) => profile._id,
    ),
    timezone: event.timezone,
    startDate: start.date,
    startTime: start.time,
    endDate: end.date,
    endTime: end.time,
  });

  const [error, setError] = useState("");

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

  const handleSubmit = async (submitEvent) => {
  submitEvent.preventDefault();

  try {
    await updateEvent(event._id, {
      profiles: form.profiles,
      timezone: form.timezone,
      start: `${form.startDate}T${form.startTime}`,
      end: `${form.endDate}T${form.endTime}`,
    });

    await fetchEvents(currentProfileId);
    onClose();
  } catch (requestError) {
    setError(requestError.message);
  }
};

  return (
    <Modal title="Edit Event" onClose={onClose}>
      <form className="modal-form" onSubmit={handleSubmit}>
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
          <label>Timezone</label>

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

            {/* No past-date floor here: an existing event may legitimately
                sit in the past and still need editing. */}
            <DatePicker
              value={form.startDate}
              onChange={(date) => setField("startDate", date)}
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
              min={form.startDate || undefined}
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

        <div className="modal-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="primary-button"
          >
            Save Changes
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default EditEventModal;