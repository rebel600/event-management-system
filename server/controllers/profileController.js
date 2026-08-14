
import Profile from "../models/Profile.js";

// Get all profiles
const getProfiles = async (req, res) => {
  const profiles = await Profile.find().sort({ createdAt: 1 });

  res.json(profiles);
};

// Create a new profile
const createProfile = async (req, res) => {
  const { name, timezone } = req.body;

  const profile = new Profile({ name, timezone });

  await profile.save();

  res.status(201).json(profile);
};

// Update a profile
const updateProfile = async (req, res) => {
  const { id } = req.params;
  const { timezone } = req.body;

  const profile = await Profile.findByIdAndUpdate(
    id,
    { timezone: timezone },
    { new: true, runValidators: true },
  );

  if (!profile) {
    return res.status(404).json({ message: "Profile not found" });
  }

  res.json(profile);
};

export { getProfiles, createProfile, updateProfile };
