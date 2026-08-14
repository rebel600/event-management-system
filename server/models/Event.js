import mongoose from "mongoose";

const EventSchema = new mongoose.Schema(
  {
    profiles: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Profile",
      },
    ],
    timezone: {
      type: String,
      required: true,
    },
    startUtc: {
      type: Date,
      required: true,
    },
    endUtc: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Event", EventSchema);
