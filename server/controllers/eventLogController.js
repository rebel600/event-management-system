import EventLog from "../models/EventLog.js";

// Get event update logs
const getEventLogs = async (req, res) => {
  const { id } = req.params;

  const logs = await EventLog.find({
    eventId: id,
  }).sort({ changedAt: -1 });

  res.json(logs);
};

export { getEventLogs };