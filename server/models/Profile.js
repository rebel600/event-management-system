import mongoose from "mongoose";
import { ALLOWED_TIMEZONES } from "../utils/timezones.js";

const ProfileSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    timezone: {
      type: String,
      required: true,
      enum: ALLOWED_TIMEZONES
    },
  },
  { timestamps: true },
);

export default mongoose.model("Profile", ProfileSchema);
