import mongoose from "mongoose";
import AutoIncrement from "./AutoIncrement.js";

const packageSchema = new mongoose.Schema(
  {
    _id: Number,
    name: String,
    description: String,
    room: { type: Number, ref: "Room" },

    time: {
      checkInTime: String,
      checkOutTime: String,
    },

    refundable: {
      available: { type: Boolean, default: false },
      refundableUntilTime: String,
    },

    features: {
      internet: Boolean,
    },

    parking: {
      available: Boolean,
      rule: String,
    },

    meals: [],
    //   {
    //     name: { type: String, enum: ["Breakfast", "Dinner"] },
    //     available: Boolean,
    //     buffet: Boolean,
    //     inRoom: Boolean,
    //     inPrivateSpace: Boolean,
    //   },
  },
  {
    collection: "Package",
  }
);

packageSchema.pre("save", async function (next) {
  if (this.isNew) {
    try {
      const counter = await AutoIncrement.findByIdAndUpdate(
        { _id: "increment" },
        { $inc: { packageId: 1 } },
        { new: true, upsert: true }
      );
      this._id = counter.packageId;
    } catch (error) {
      return next(error);
    }
  }
  next();
});
export default mongoose.model("Package", packageSchema);
