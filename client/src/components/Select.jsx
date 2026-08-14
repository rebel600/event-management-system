import { useId, useState } from "react";

import useDropdown from "../lib/useDropdown.js";

// A single-select control drawn with our own markup instead of a native
// <select>, whose popup the browser styles itself and which therefore could
// not be made to match the profile dropdown. Keyboard behaviour mirrors the
// native control it replaces: type-agnostic arrow navigation, Home/End,
// Enter/Space to commit, Escape to dismiss.
function Select({
  value,
  onChange,
  options,
  placeholder = "Select...",
  ariaLabel,
}) {
  const { open, setOpen, containerRef } = useDropdown();
  const [activeIndex, setActiveIndex] = useState(-1);
  const listId = useId();

  const selected = options.find((option) => option.value === value);

  const openPanel = () => {
    setActiveIndex(
      options.findIndex((option) => option.value === value),
    );
    setOpen(true);
  };

  const commit = (option) => {
    onChange(option.value);
    setOpen(false);
  };

  const handleKeyDown = (event) => {
    if (!open) {
      if (["Enter", " ", "ArrowDown", "ArrowUp"].includes(event.key)) {
        event.preventDefault();
        openPanel();
      }

      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((current) =>
        Math.min(current + 1, options.length - 1),
      );
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((current) => Math.max(current - 1, 0));
    } else if (event.key === "Home") {
      event.preventDefault();
      setActiveIndex(0);
    } else if (event.key === "End") {
      event.preventDefault();
      setActiveIndex(options.length - 1);
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();

      if (activeIndex >= 0 && options[activeIndex]) {
        commit(options[activeIndex]);
      }
    }
  };

  return (
    <div className="dropdown" ref={containerRef}>
      <button
        type="button"
        className="dropdown-trigger"
        onClick={() => (open ? setOpen(false) : openPanel())}
        onKeyDown={handleKeyDown}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={ariaLabel}
        aria-controls={open ? listId : undefined}
        aria-activedescendant={
          open && activeIndex >= 0
            ? `${listId}-${activeIndex}`
            : undefined
        }
      >
        <span className={selected ? "" : "dropdown-placeholder"}>
          {selected ? selected.label : placeholder}
        </span>
      </button>

      {open && (
        <div className="dropdown-panel">
          <div className="dropdown-options" role="listbox" id={listId}>
            {options.map((option, index) => {
              const isSelected = option.value === value;

              return (
                <button
                  type="button"
                  key={option.value}
                  id={`${listId}-${index}`}
                  role="option"
                  aria-selected={isSelected}
                  className={`dropdown-option ${
                    isSelected ? "selected" : ""
                  } ${index === activeIndex ? "active" : ""}`}
                  onClick={() => commit(option)}
                  onMouseEnter={() => setActiveIndex(index)}
                >
                  <span className="dropdown-check">
                    {isSelected ? "✓" : ""}
                  </span>

                  <span className="dropdown-name">{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default Select;
