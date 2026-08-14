import { useState } from "react";

import Modal from "./Modal.jsx";
import { TIMEZONES } from "../../helper/timezones.js";
import useStore from "../store/index.js";

function AddProfileModal({ onClose }) {
  const addProfile = useStore((state) => state.addProfile);
  const profilesError = useStore((state) => state.profilesError);
  const profilesLoading = useStore(
    (state) => state.profilesLoading,
  );

  const [name, setName] = useState("");
  const [timezone, setTimezone] = useState("Asia/Kolkata");
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Profile name is required.");
      return;
    }

    try {
      await addProfile({
        name: name.trim(),
        timezone,
      });

      onClose();
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  return (
    <Modal title="Create Profile" onClose={onClose}>
      <form className="modal-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="profile-name">Name</label>

          <input
            id="profile-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Enter profile name"
          />
        </div>

        <div className="form-group">
          <label htmlFor="profile-timezone">Timezone</label>

          <select
            id="profile-timezone"
            value={timezone}
            onChange={(event) => setTimezone(event.target.value)}
          >
            {TIMEZONES.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        {(error || profilesError) && (
          <div className="form-error">
            {error || profilesError}
          </div>
        )}

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
            disabled={profilesLoading}
          >
            {profilesLoading ? "Creating..." : "Create Profile"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default AddProfileModal;