import mongoose from "mongoose";

const inventoryDataSchema = new mongoose.Schema(
  {
    _id: String,
    inventory: { type: Number, default: 0 },
  },
  {
    collection: "InventoryData",
  }
);

export default mongoose.model("InventoryData", inventoryDataSchema);
