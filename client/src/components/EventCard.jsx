import { formatInTz } from "../../helper/time.js";

function EventCard({
  event,
  viewerTimezone,
  onEdit,
  onLogs,
}) {
  return (
    <article className="event-card">
      <div className="event-card-top">
        <span className="event-label">EVENT</span>

        <span className="event-timezone">
          {event.timezone}
        </span>
      </div>

      <h3>
        {event.profiles
          ?.map((profile) => profile.name)
          .join(", ") || "Unnamed event"}
      </h3>

      <div className="event-time">
        {formatInTz(
          event.startUtc,
          viewerTimezone,
        )}
      </div>

      <div className="event-end">
        Ends{" "}
        {formatInTz(
          event.endUtc,
          viewerTimezone,
        )}
      </div>

      <div className="event-actions">
        <button
          type="button"
          className="secondary-button"
          onClick={() => onEdit(event)}
        >
          Edit
        </button>

        <button
          type="button"
          className="secondary-button"
          onClick={() => onLogs(event)}
        >
          Logs
        </button>
      </div>
    </article>
  );
}

export default EventCard;