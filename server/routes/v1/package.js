import express from "express";
import { create, get, getDataByRoomIdandPackageId } from "../../controllers/package.js";
import { updateBulkRate, updateRate } from "../../controllers/rate.js";
import { updateBulkInventory, updateInventory } from "../../controllers/inventory.js";
import { updateARI, updateBulkARI } from "../../controllers/ARI.js";

const packageRouter = express.Router();

packageRouter.post("/create", create);
packageRouter.get("/:packageId", get);
packageRouter.get("/name/:packageId/:roomId", getDataByRoomIdandPackageId);

// Rate
packageRouter.post("/update/rate", updateRate);
packageRouter.post("/update/bulkrate", updateBulkRate);

// Inventory
packageRouter.post("/update/inventory", updateInventory);
packageRouter.post("/update/bulkinventory", updateBulkInventory);

// ARI
packageRouter.post("/update/ARI", updateARI);
packageRouter.post("/update/bulkARI", updateBulkARI);

export default packageRouter;
