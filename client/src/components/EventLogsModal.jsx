import Modal from "./Modal.jsx";
import { formatInTz } from "../../helper/time.js";
import useStore from "../store";

function formatLogValue(field, value, profiles, viewerTimezone) {
  if (value === null || value === undefined) {
    return "—";
  }

  if (field === "startUtc" || field === "endUtc") {
    return formatInTz(value, viewerTimezone);
  }

  if (field === "timezone") {
    return String(value);
  }

  if (field === "profiles") {
    if (!Array.isArray(value)) {
      return String(value);
    }

    return value
      .map((id) => {
        const idString = id?.toString();

        const profile = profiles.find(
          (item) => item._id === idString,
        );

        return profile?.name || idString;
      })
      .join(", ");
  }

  return String(value);
}

function EventLogsModal({
  event,
  viewerTimezone,
  onClose,
}) {
  const logs = useStore((state) => state.eventLogs);
  const logsLoading = useStore(
    (state) => state.logsLoading,
  );
  const logsError = useStore(
    (state) => state.logsError,
  );
  const profiles = useStore((state) => state.profiles);

  return (
    <Modal
      title="Event History"
      onClose={onClose}
      wide
    >
      {logsLoading ? (
        <div className="empty-state">
          Loading history...
        </div>
      ) : logsError ? (
        <div className="form-error">{logsError}</div>
      ) : logs.length === 0 ? (
        <div className="empty-state">
          <strong>No changes recorded</strong>
          <span>
            This event has no update history yet.
          </span>
        </div>
      ) : (
        <div className="logs-list">
          {logs.map((log) => (
            <div className="log-item" key={log._id}>
              <div className="log-header">
                <strong>{log.changedAt
                  ? formatInTz(
                      log.changedAt,
                      viewerTimezone,
                    )
                  : "Unknown time"}</strong>
              </div>

              <div className="log-changes">
                {log.changes.map((change, index) => (
                  <div
                    className="log-change"
                    key={`${log._id}-${change.field}-${index}`}
                  >
                    <span className="log-field">
                      {change.field}
                    </span>

                    <div className="log-values">
                      <span>
                        {formatLogValue(
                          change.field,
                          change.from,
                          profiles,
                          viewerTimezone,
                        )}
                      </span>

                      <span className="log-arrow">
                        →
                      </span>

                      <span>
                        {formatLogValue(
                          change.field,
                          change.to,
                          profiles,
                          viewerTimezone,
                        )}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}

export default EventLogsModal;