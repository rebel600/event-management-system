import { useEffect, useState } from "react";

import Modal from "./Modal.jsx";
import { formatWallClock } from "../../helper/time.js";
import { TIMEZONES } from "../../helper/timezones.js";
import useStore from "../store/index.js";

function EditEventModal({ event, onClose }) {
  const updateEvent = useStore((state) => state.updateEvent);
  const fetchEvents = useStore((state) => state.fetchEvents);
  const currentProfileId = useStore(
    (state) => state.currentProfileId,
  );
  const profiles = useStore((state) => state.profiles);

  const start = formatWallClock(
    event.startUtc,
    event.timezone,
  );

  const end = formatWallClock(
    event.endUtc,
    event.timezone,
  );

  const [form, setForm] = useState({
    profiles: event.profiles.map((profile) => profile._id),
    timezone: event.timezone,
    startDate: start.date,
    startTime: start.time,
    endDate: end.date,
    endTime: end.time,
  });

  const [error, setError] = useState("");

  useEffect(() => {
    const currentStart = formatWallClock(
      event.startUtc,
      event.timezone,
    );

    const currentEnd = formatWallClock(
      event.endUtc,
      event.timezone,
    );

    setForm({
      profiles: event.profiles.map(
        (profile) => profile._id,
      ),
      timezone: event.timezone,
      startDate: currentStart.date,
      startTime: currentStart.time,
      endDate: currentEnd.date,
      endTime: currentEnd.time,
    });
  }, [event]);

  const toggleProfile = (profileId) => {
    setForm((current) => {
      const exists = current.profiles.includes(profileId);

      return {
        ...current,
        profiles: exists
          ? current.profiles.filter((id) => id !== profileId)
          : [...current.profiles, profileId],
      };
    });
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
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

          <div className="profile-list">
            {profiles.map((profile) => (
              <label
                key={profile._id}
                className={`profile-option ${
                  form.profiles.includes(profile._id)
                    ? "selected"
                    : ""
                }`}
              >
                <input
                  type="checkbox"
                  checked={form.profiles.includes(
                    profile._id,
                  )}
                  onChange={() =>
                    toggleProfile(profile._id)
                  }
                />

                <span>{profile.name}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label>Timezone</label>

          <select
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
            <label>Start date</label>

            <input
              type="date"
              name="startDate"
              value={form.startDate}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Start time</label>

            <input
              type="time"
              name="startTime"
              value={form.startTime}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>End date</label>

            <input
              type="date"
              name="endDate"
              value={form.endDate}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>End time</label>

            <input
              type="time"
              name="endTime"
              value={form.endTime}
              onChange={handleChange}
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