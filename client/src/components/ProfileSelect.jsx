import { useState } from "react";

import useDropdown from "../lib/useDropdown.js";
import useStore from "../store/index.js";

const DEFAULT_TIMEZONE = "Asia/Kolkata";

function ProfileSelect({
  mode = "multi",
  value,
  onChange,
  placeholder = "Select profiles...",
  defaultTimezone = DEFAULT_TIMEZONE,
  searchPlaceholder = "Search profiles...",
}) {
  const profiles = useStore((state) => state.profiles);
  const addProfile = useStore((state) => state.addProfile);

  const { open, setOpen, containerRef } = useDropdown();

  const [search, setSearch] = useState("");
  const [newName, setNewName] = useState("");
  const [addError, setAddError] = useState("");
  const [adding, setAdding] = useState(false);

  const selectedIds =
    mode === "multi" ? value || [] : value ? [value] : [];

  const togglePanel = () => {
    if (open) {
      setOpen(false);
      return;
    }

    setSearch("");
    setNewName("");
    setAddError("");
    setOpen(true);
  };

  const query = search.trim().toLowerCase();

  const visibleProfiles = query
    ? profiles.filter((profile) =>
        profile.name.toLowerCase().includes(query),
      )
    : profiles;

  const selectedNames = profiles
    .filter((profile) => selectedIds.includes(profile._id))
    .map((profile) => profile.name);

  const triggerLabel =
    selectedNames.length > 0
      ? selectedNames.join(", ")
      : placeholder;

  const handleSelect = (profileId) => {
    if (mode === "single") {
      onChange(profileId);
      setOpen(false);
      return;
    }

    const exists = selectedIds.includes(profileId);

    onChange(
      exists
        ? selectedIds.filter((id) => id !== profileId)
        : [...selectedIds, profileId],
    );
  };

  const handleAdd = async () => {
    const name = newName.trim();

    setAddError("");

    if (!name) {
      setAddError("Profile name is required.");
      return;
    }

    setAdding(true);

    try {
      // Inherited from the surrounding form rather than asked for again; the
      // profile's timezone stays editable through the header selector.
      const profile = await addProfile({
        name,
        timezone: defaultTimezone,
      });

      // Selecting the profile you just created is almost always what you
      // wanted, so skip the extra click.
      if (mode === "single") {
        onChange(profile._id);
        setOpen(false);
      } else {
        onChange([...selectedIds, profile._id]);
      }

      setNewName("");
      setSearch("");
    } catch (error) {
      setAddError(error.message);
    } finally {
      setAdding(false);
    }
  };

  const handleAddKeyDown = (event) => {
    if (event.key === "Enter") {
      // The control is often rendered inside a form; Enter must add a
      // profile, not submit the event being created.
      event.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className="dropdown" ref={containerRef}>
      <button
        type="button"
        className="dropdown-trigger"
        onClick={togglePanel}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span
          className={
            selectedNames.length > 0 ? "" : "dropdown-placeholder"
          }
        >
          {triggerLabel}
        </span>
      </button>

      {open && (
        <div className="dropdown-panel">
          <div className="dropdown-search">
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={searchPlaceholder}
              aria-label={searchPlaceholder}
            />
          </div>

          <div className="dropdown-options" role="listbox">
            {visibleProfiles.length === 0 ? (
              <div className="dropdown-empty">
                {profiles.length === 0
                  ? "No profiles yet."
                  : "No matches."}
              </div>
            ) : (
              visibleProfiles.map((profile) => {
                const selected = selectedIds.includes(profile._id);

                return (
                  <button
                    type="button"
                    key={profile._id}
                    role="option"
                    aria-selected={selected}
                    className={`dropdown-option ${
                      selected ? "selected" : ""
                    }`}
                    onClick={() => handleSelect(profile._id)}
                  >
                    <span className="dropdown-check">
                      {selected ? "✓" : ""}
                    </span>

                    <span className="dropdown-name">
                      {profile.name}
                    </span>

                    <span className="dropdown-meta">
                      {profile.timezone}
                    </span>
                  </button>
                );
              })
            )}
          </div>

          <div className="dropdown-add">
            <input
              type="text"
              value={newName}
              onChange={(event) => setNewName(event.target.value)}
              onKeyDown={handleAddKeyDown}
              placeholder="New profile name"
              aria-label="New profile name"
            />

            <button
              type="button"
              className="primary-button"
              onClick={handleAdd}
              disabled={adding}
            >
              {adding ? "..." : "Add"}
            </button>
          </div>

          {addError && (
            <div className="dropdown-error">{addError}</div>
          )}
        </div>
      )}
    </div>
  );
}

export default ProfileSelect;
