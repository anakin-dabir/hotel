import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
  {
    name: String,
    description: String,
    packages: [{ type: mongoose.Schema.Types.ObjectId, ref: "Package" }],
    hotel: { type: mongoose.Schema.Types.ObjectId, ref: "Hotel" },
    images: [{ type: String, default: "" }],

    capacity: {
      totalCapacity: { type: Number, default: 0 },
      adultCapacity: { type: Number, default: 0 },
      childCapacity: { type: Number, default: 0 },
      minCapacity: { type: Number, default: 0 },
      minAge: { type: Number, default: 0 },
    },

    features: {
      smoking: { type: Boolean, default: false },
      roomSharing: { type: String, enum: ["Shared", "Private"] },
      mobilityAccessible: { type: Boolean, default: true },
      openAirBath: { type: Boolean, default: false },
      aitConditioning: { type: Boolean, default: false },
      balcony: { type: Boolean, default: false },
    },

    beds: [
      {
        size: { type: String, enum: ["Single", "Semi Double", "Double", "Queen", "King"] },
        width: Number,
        height: Number,
        unit: { type: String, default: "cm" },
      },
    ],

    washroom: {
      // bathAndToilet
      relation: { type: String, enum: ["Together", "Separate"] },
      bathTub: Boolean,
      shower: Boolean,
      electronicBidet: Boolean,
      mobilityAccessible: Boolean,
    },
  },
  { timestamps: true, collection: "Room" }
);

export default mongoose.model("Room", roomSchema);
