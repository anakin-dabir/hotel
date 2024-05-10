import mongoose from "mongoose";

const autoIncrementSchema = new mongoose.Schema(
  {
    _id: { type: String, default: "increment" },
    roomId: { type: Number, default: 0 },
    packageId: { type: Number, default: 0 },
  },
  {
    collection: "AutoIncrement",
  }
);

export default mongoose.model("AutoIncrement", autoIncrementSchema);
