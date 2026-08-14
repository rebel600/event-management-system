import { useState } from "react";
import dayjs from "dayjs";

import useDropdown from "../lib/useDropdown.js";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const WIRE_FORMAT = "YYYY-MM-DD";

const parse = (value) => {
  if (!value) {
    return null;
  }

  const parsed = dayjs(value, WIRE_FORMAT);

  return parsed.isValid() ? parsed : null;
};

// A calendar drawn with our own markup. The native input's popup is chrome the
// page cannot style, and it also let a disabled-looking day be picked; here a
// day before `min` is genuinely unclickable.
function DatePicker({
  value,
  onChange,
  min,
  placeholder = "Pick a date",
  ariaLabel,
}) {
  const { open, setOpen, containerRef } = useDropdown();

  const selected = parse(value);
  const minDate = parse(min);

  const [viewMonth, setViewMonth] = useState(
    () => (selected || dayjs()).startOf("month"),
  );
  const [activeDate, setActiveDate] = useState(
    () => selected || dayjs().startOf("day"),
  );

  const isDisabled = (day) => {
    return Boolean(minDate) && day.isBefore(minDate, "day");
  };

  const openPanel = () => {
    const anchor = selected || dayjs().startOf("day");

    setViewMonth(anchor.startOf("month"));
    setActiveDate(anchor);
    setOpen(true);
  };

  const commit = (day) => {
    if (isDisabled(day)) {
      return;
    }

    onChange(day.format(WIRE_FORMAT));
    setOpen(false);
  };

  const moveTo = (day) => {
    setActiveDate(day);
    setViewMonth(day.startOf("month"));
  };

  const handleKeyDown = (event) => {
    if (!open) {
      if (["Enter", " ", "ArrowDown", "ArrowUp"].includes(event.key)) {
        event.preventDefault();
        openPanel();
      }

      return;
    }

    const moves = {
      ArrowLeft: () => activeDate.subtract(1, "day"),
      ArrowRight: () => activeDate.add(1, "day"),
      ArrowUp: () => activeDate.subtract(1, "week"),
      ArrowDown: () => activeDate.add(1, "week"),
      PageUp: () => activeDate.subtract(1, "month"),
      PageDown: () => activeDate.add(1, "month"),
      Home: () => activeDate.startOf("month"),
      End: () => activeDate.endOf("month"),
    };

    if (moves[event.key]) {
      event.preventDefault();
      moveTo(moves[event.key]());
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      commit(activeDate);
    }
  };

  // Six rows always, so the panel does not change height between months.
  const gridStart = viewMonth.startOf("week");
  const days = Array.from({ length: 42 }, (_, index) =>
    gridStart.add(index, "day"),
  );

  const today = dayjs().startOf("day");

  return (
    <div className="dropdown datepicker" ref={containerRef}>
      <button
        type="button"
        className="dropdown-trigger datepicker-trigger"
        onClick={() => (open ? setOpen(false) : openPanel())}
        onKeyDown={handleKeyDown}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={ariaLabel}
      >
        <span className={selected ? "" : "dropdown-placeholder"}>
          {selected ? selected.format("DD MMM YYYY") : placeholder}
        </span>
      </button>

      {open && (
        <div className="dropdown-panel datepicker-panel" role="dialog">
          <div className="datepicker-head">
            <button
              type="button"
              className="datepicker-nav"
              onClick={() => setViewMonth(viewMonth.subtract(1, "month"))}
              aria-label="Previous month"
            >
              ‹
            </button>

            <strong>{viewMonth.format("MMMM YYYY")}</strong>

            <button
              type="button"
              className="datepicker-nav"
              onClick={() => setViewMonth(viewMonth.add(1, "month"))}
              aria-label="Next month"
            >
              ›
            </button>
          </div>

          <div className="datepicker-weekdays">
            {WEEKDAYS.map((weekday) => (
              <span key={weekday}>{weekday}</span>
            ))}
          </div>

          <div className="datepicker-grid">
            {days.map((day) => {
              const disabled = isDisabled(day);
              const outside = !day.isSame(viewMonth, "month");

              const classes = [
                "datepicker-day",
                outside ? "outside" : "",
                day.isSame(selected, "day") ? "selected" : "",
                day.isSame(activeDate, "day") ? "active" : "",
                day.isSame(today, "day") ? "today" : "",
              ]
                .filter(Boolean)
                .join(" ");

              return (
                <button
                  type="button"
                  key={day.format(WIRE_FORMAT)}
                  className={classes}
                  onClick={() => commit(day)}
                  onMouseEnter={() => !disabled && setActiveDate(day)}
                  disabled={disabled}
                  aria-label={day.format("D MMMM YYYY")}
                  aria-current={day.isSame(today, "day") ? "date" : undefined}
                >
                  {day.date()}
                </button>
              );
            })}
          </div>

          <div className="datepicker-foot">
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
              onClick={() => commit(today)}
              disabled={isDisabled(today)}
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DatePicker;
