import { getEventLogs } from "../lib/api.js";

const createLogSlice = (set, get) => ({
  eventLogs: [],
  loading: false,
  error: null,
  fetchEventLogs: async (eventId) => {
    set({
      loading: true,
      error: null,
    });

    try {
      const eventLogs = await getEventLogs(eventId);

      set({
        eventLogs,
        loading: false,
      });

      return eventLogs;
    } catch (error) {
      set({
        loading: false,
        error: error.message,
      });

      throw error;
    }
  },

  clearEventLogs: () => {
    set({
      eventLogs: [],
    });
  },
});

export default createLogSlice;