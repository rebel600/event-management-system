import { useEffect, useRef } from "react";

import useDropdown from "../lib/useDropdown.js";

const pad = (number) => String(number).padStart(2, "0");

const HOURS = Array.from({ length: 24 }, (_, index) => pad(index));
const MINUTES = Array.from({ length: 60 }, (_, index) => pad(index));

// Hour and minute columns rather than a fixed list of slots, so any time an
// existing event already holds can be represented and re-picked.
function TimePicker({ value, onChange, placeholder = "--:--", ariaLabel }) {
  const { open, setOpen, containerRef } = useDropdown();

  const hourRef = useRef(null);
  const minuteRef = useRef(null);

  const [hour = "", minute = ""] = value ? value.split(":") : [];

  // Bring the current values into view; with 60 minutes the selected one is
  // usually well below the fold.
  useEffect(() => {
    if (!open) {
      return;
    }

    for (const ref of [hourRef, minuteRef]) {
      ref.current
        ?.querySelector(".timepicker-item.selected")
        ?.scrollIntoView({ block: "center" });
    }
  }, [open]);

  const commit = (nextHour, nextMinute) => {
    onChange(`${nextHour}:${nextMinute}`);
  };

  return (
    <div className="dropdown timepicker" ref={containerRef}>
      <button
        type="button"
        className="dropdown-trigger"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={ariaLabel}
      >
        <span className={value ? "" : "dropdown-placeholder"}>
          {value || placeholder}
        </span>
      </button>

      {open && (
        <div className="dropdown-panel timepicker-panel" role="dialog">
          <div className="timepicker-columns">
            <div className="timepicker-column" ref={hourRef}>
              <span className="timepicker-label">Hour</span>

              <div className="timepicker-scroll">
                {HOURS.map((item) => (
                  <button
                    type="button"
                    key={item}
                    className={`timepicker-item ${
                      item === hour ? "selected" : ""
                    }`}
                    onClick={() => commit(item, minute || "00")}
                    aria-pressed={item === hour}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="timepicker-column" ref={minuteRef}>
              <span className="timepicker-label">Minute</span>

              <div className="timepicker-scroll">
                {MINUTES.map((item) => (
                  <button
                    type="button"
                    key={item}
                    className={`timepicker-item ${
                      item === minute ? "selected" : ""
                    }`}
                    onClick={() => commit(hour || "00", item)}
                    aria-pressed={item === minute}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="timepicker-foot">
            <button
              type="button"
              className="datepicker-link"
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
            >
              Clear
            </button>

            <button
              type="button"
              className="datepicker-link"
              onClick={() => setOpen(false)}
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default TimePicker;
