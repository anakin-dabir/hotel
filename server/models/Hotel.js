import mongoose from "mongoose";

const hotelSchema = new mongoose.Schema(
  {
    name: String,
    description: String,
    tagLine: String,
    images: [{ type: String, default: "" }],
    rooms: [{ type: mongoose.Schema.Types.ObjectId, ref: "Room" }],

    address: {
      location: String,
      country: String,
      state: String,
      city: String,
      postalCode: String,
      latitude: String,
      longitude: String,
    },

    social: {
      email: String,
      phone: String,
      owner: String,
      website: String,
    },

    time: {
      chekinTime: String,
      checkoutTime: String,
    },
  },

  {
    timestamps: true,
    collection: "Hotel",
  }
);

export default mongoose.model("Hotel", hotelSchema);
