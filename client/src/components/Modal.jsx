import { getEventLogs } from "../lib/api.js";

const createLogSlice = (set) => ({
  eventLogs: [],
  logsLoading: false,
  logsError: null,

  fetchEventLogs: async (eventId) => {
    set({
      logsLoading: true,
      logsError: null,
    });

    try {
      const eventLogs = await getEventLogs(eventId);

      set({
        eventLogs,
        logsLoading: false,
      });

      return eventLogs;
    } catch (error) {
      set({
        logsLoading: false,
        logsError: error.message,
      });

      throw error;
    }
  },

  clearEventLogs: () => {
    set({
      eventLogs: [],
      logsError: null,
    });
  },
});

export default createLogSlice;