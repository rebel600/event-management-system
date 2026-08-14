import {
  getEvents,
  createEvent as createEventApi,
  updateEvent as updateEventApi,
} from "../lib/api.js";

const createEventSlice = (set, get) => ({
  events: [],
  eventsLoading: false,
  eventsError: null,

  fetchEvents: async (profileId = null) => {
    set({
      eventsLoading: true,
      eventsError: null,
    });

    try {
      const events = await getEvents(profileId);

      set({
        events,
        eventsLoading: false,
      });

      return events;
    } catch (error) {
      set({
        eventsLoading: false,
        eventsError: error.message,
      });

      throw error;
    }
  },

  addEvent: async (eventData) => {
    set({
      eventsLoading: true,
      eventsError: null,
    });

    try {
      const event = await createEventApi(eventData);

      set((state) => ({
        events: [...state.events, event],
        eventsLoading: false,
      }));

      return event;
    } catch (error) {
      set({
        eventsLoading: false,
        eventsError: error.message,
      });

      throw error;
    }
  },

  updateEvent: async (eventId, eventData) => {
    set({
      eventsLoading: true,
      eventsError: null,
    });

    try {
      const updatedEvent = await updateEventApi(eventId, eventData);

      set((state) => ({
        events: state.events.map((event) =>
          event._id === updatedEvent._id ? updatedEvent : event,
        ),
        eventsLoading: false,
      }));

      return updatedEvent;
    } catch (error) {
      set({
        eventsLoading: false,
        eventsError: error.message,
      });

      throw error;
    }
  },
});

export default createEventSlice;