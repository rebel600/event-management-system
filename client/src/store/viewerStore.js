export const getBrowserTimezone = () => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
};

const createViewerSlice = (set) => ({
  // Empty until the viewer picks one or a profile supplies it, so the header
  // reads "Select timezone" rather than presenting a guess as a choice.
  // Rendering falls back to the browser zone via getBrowserTimezone().
  viewerTimezone: "",

  setViewerTimezone: (timezone) => {
    set({
      viewerTimezone: timezone,
    });
  },
});

export default createViewerSlice;
