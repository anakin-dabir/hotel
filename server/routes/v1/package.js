import express from "express";
import {
  create,
  updatePackage,
  get,
  getInventoryDataByRoomId,
  testing,
  search,
  getPackageDataByRoomIdAndPackageId,
} from "../../controllers/package.js";
import { updateBulkRate, updateRate } from "../../controllers/rate.js";
import { updateBulkInventory, updateInventory } from "../../controllers/inventory.js";
import { updateARI, updateBulkARI } from "../../controllers/ARI.js";

const packageRouter = express.Router();

packageRouter.post("/create", create);
packageRouter.post("/edit", updatePackage);
packageRouter.get("/:packageId", get);
packageRouter.get("/getInventoryData/:roomId/:startDate/:endDate", getInventoryDataByRoomId);
packageRouter.get(
  "/getPackageData/:roomId/:packageId/:startDate/:endDate",
  getPackageDataByRoomIdAndPackageId
);

// Rate
packageRouter.post("/update/rate", updateRate);
packageRouter.post("/update/bulkrate", updateBulkRate);

// Inventory
packageRouter.post("/update/inventory", updateInventory);
packageRouter.post("/update/bulkinventory", updateBulkInventory);

// ARI
packageRouter.post("/update/ARI", updateARI);
packageRouter.post("/update/bulkARI", updateBulkARI);

// testing
packageRouter.post("/test", testing);

// search
packageRouter.get("/search/:hotelId/:dateRange/:room/:adult/:children", search);

export default packageRouter;
