import mongoose from "mongoose";

const packageDataSchema = new mongoose.Schema(
  {
    _id: { type: String },
    price: { type: Number, default: 0 },
    availability: { type: Boolean, default: false },
  },
  {
    collection: "PackageData",
  }
);

export default mongoose.model("PackageData", packageDataSchema);
22222222