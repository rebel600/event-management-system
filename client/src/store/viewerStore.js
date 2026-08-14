const getDefaultTimezone = () => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
};

const createViewerSlice = (set) => ({
  viewerTimezone: getDefaultTimezone(),

  setViewerTimezone: (timezone) => {
    set({
      viewerTimezone: timezone,
    });
  },
});

export default createViewerSlice;