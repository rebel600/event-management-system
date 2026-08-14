import {
  getProfiles,
  createProfile as createProfileApi,
  updateProfile as updateProfileApi,
} from "../lib/api.js";

const createProfileSlice = (set, get) => ({
  profiles: [],
  currentProfileId: null,
  profilesLoading: false,
  profilesError: null,

  setCurrentProfileId: (profileId) => {
    const { profiles, viewerTimezone } = get();

    const profile = profiles.find((item) => item._id === profileId);

    set({
      currentProfileId: profileId,
      viewerTimezone: profile?.timezone || viewerTimezone,
    });
  },

  fetchProfiles: async () => {
    set({
      profilesLoading: true,
      profilesError: null,
    });

    try {
      const profiles = await getProfiles();

      set({
        profiles,
        profilesLoading: false,
      });

      return profiles;
    } catch (error) {
      set({
        profilesLoading: false,
        profilesError: error.message,
      });

      throw error;
    }
  },

  addProfile: async (profileData) => {
    set({
      profilesLoading: true,
      profilesError: null,
    });

    try {
      const profile = await createProfileApi(profileData);

      set((state) => ({
        profiles: [...state.profiles, profile],
        profilesLoading: false,
      }));

      return profile;
    } catch (error) {
      set({
        profilesLoading: false,
        profilesError: error.message,
      });

      throw error;
    }
  },
  updateProfile: async (profileId, profileData) => {
    set({
      profilesLoading: true,
      profilesError: null,
    });

    try {
      const updatedProfile = await updateProfileApi(profileId, profileData);

      set((state) => ({
        profiles: state.profiles.map((profile) =>
          profile._id === updatedProfile._id ? updatedProfile : profile,
        ),
        profilesLoading: false,
        viewerTimezone:
          state.currentProfileId === updatedProfile._id
            ? updatedProfile.timezone
            : state.viewerTimezone,
      }));

      return updatedProfile;
    } catch (error) {
      set({
        profilesLoading: false,
        profilesError: error.message,
      });

      throw error;
    }
  },
});

export default createProfileSlice;
