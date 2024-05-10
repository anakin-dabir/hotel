import mongoose from "mongoose";
import AutoIncrement from "./AutoIncrement.js";

const roomSchema = new mongoose.Schema(
  {
    _id: Number,
    name: String,
    description: String,
    packages: [{ type: Number, ref: "Package" }],
    hotel: { type: mongoose.Schema.Types.ObjectId, ref: "Hotel" },
    images: [{ type: String, default: "" }],

    capacity: {
      totalCapacity: { type: Number, default: 0 },
      adultCapacity: { type: Number, default: 0 },
      childCapacity: { type: Number, default: 0 },
      minCapacity: { type: Number, default: 1 },
      minAge: { type: Number, default: 10 },
    },

    features: {
      smoking: { type: Boolean, default: false },
      mobilityAccessible: { type: Boolean, default: true },
      openAirBath: { type: Boolean, default: false },
      airConditioning: { type: Boolean, default: false },
      balcony: { type: Boolean, default: false },
    },

    beds: [String],
    // {
    //   size: { type: String, enum: ["Single", "Semi Double", "Double", "Queen", "King"] },
    //   width: Number,
    //   height: Number,
    //   unit: { type: String, default: "cm" },
    //   quantity: Number,
    // },

    washroom: {
      // bathAndToilet
      relation: { type: String, enum: ["Together", "Separate"] },
      bathTub: Boolean,
      shower: Boolean,
      electronicBidget: Boolean,
      mobilityAccessible: Boolean,
    },
  },
  { collection: "Room" }
);

roomSchema.pre("save", async function (next) {
  if (this.isNew) {
    try {
      const counter = await AutoIncrement.findByIdAndUpdate(
        { _id: "increment" },
        { $inc: { roomId: 1 } },
        { new: true, upsert: true }
      );
      this._id = counter.roomId;
    } catch (error) {
      return next(error);
    }
  }
  next();
});

export default mongoose.model("Room", roomSchema);
