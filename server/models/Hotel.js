import mongoose from "mongoose";

const hotelSchema = new mongoose.Schema(
  {
    name: String,
    description: String,
    tagLine: String,
    id: Number,
    images: [{ type: String, default: "" }],
    rooms: [{ type: Number, ref: "Room" }],
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    social: {
      email: String,
      phone: String,
      owner: String,
      website: String,
    },
    address: {
      location: String,
      country: String,
      state: String,
      city: String,
      postalCode: String,
      latitude: String,
      longitude: String,
    },

    time: {
      checkinTime: String,
      checkoutTime: String,
    },
    amenities: [String],
    payment_key: {
      keyId: String,
    },
    payment_secret: {
      keySecret: String
    }
  },
  {
    collection: "Hotel",
  }
);

export default mongoose.model("Hotel", hotelSchema);
