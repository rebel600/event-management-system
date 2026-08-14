import { create } from "zustand";

import createProfileSlice from "./profileStore.js";
import createEventSlice from "./eventStore.js";
import createLogSlice from "./logStore.js";
import createViewerSlice from "./viewerStore.js";

const useStore = create((set, get) => ({
  ...createProfileSlice(set, get),
  ...createEventSlice(set, get),
  ...createLogSlice(set, get),
  ...createViewerSlice(set, get),
}));

export default useStore;