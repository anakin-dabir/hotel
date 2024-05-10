import dayjs from "dayjs";
import Package from "../models/Package.js";
import config from "../config/config.js";
import { addInventory, toggleAvailability } from "../seed/xmlSeed.js";
import { AVAILABILITY, INVENTORY } from "../seed/googleEndpoints.js";
import axios from "axios";
import _googleError from "../utils/_googleError.js";
import _googleResponseError from "../utils/_googleResponseError.js";
import InventoryData from "../models/InventoryData.js";
import PackageData from "../models/PackageData.js";

async function updateInventory(req, res) {
  const {
    hotelId,
    roomId,
    packageId,
    date,
    data: { inventory },
  } = req.body;

  const _date = dayjs(date).format("YYYY-MM-DD");
  const _googleInventory = addInventory({
    hotelId,
    packageId,
    roomId,
    startDate: _date,
    endDate: _date,
    inventory: inventory,
  });

  try {
    const responses = await axios.post(INVENTORY, _googleInventory, config.FETCH_OPTIONS);
    const { ERROR, STATUS, MESSAGE } = _googleResponseError(responses, true);
    console.log({ ERROR, STATUS, MESSAGE });
    if (ERROR) {
      return res.status(STATUS).json({ message: MESSAGE });
    }
  } catch (error) {
    return res.status(500).json({ message: _googleError(error) });
  }

  try {
    await InventoryData.updateOne(
      { _id: `${roomId}_${_date}` },
      { $set: { inventory } },
      { upsert: true }
    );

    return res.status(200).json({ message: "Updated Successfully", data: null });
  } catch (error) {}
}

async function updateBulkInventory(req, res) {
  const {
    hotelId,
    packageId,
    roomId,
    date: { startDate, endDate },
    data: { inventory },
  } = req.body;

  const _googleStartDate = dayjs(startDate).format("YYYY-MM-DD");
  const _googleEndDate = dayjs(endDate).format("YYYY-MM-DD");
  const _googleInventory = addInventory({
    hotelId,
    packageId,
    roomId,
    startDate: _googleStartDate,
    endDate: _googleEndDate,
    inventory: inventory,
  });

  try {
    const responses = await axios.post(INVENTORY, _googleInventory, config.FETCH_OPTIONS);
    const { ERROR, STATUS, MESSAGE } = _googleResponseError(responses, true);
    console.log({ ERROR, STATUS, MESSAGE });
    if (ERROR) {
      return res.status(STATUS).json({ message: MESSAGE });
    }
  } catch (error) {
    return res.status(500).json({ message: _googleError(error) });
  }

  let inventoryOps = [];
  for (let date = dayjs(startDate); !date.isAfter(dayjs(endDate)); date = date.add(1, "day")) {
    const dateStr = date.format("YYYY-MM-DD");
    const _id = `${roomId}_${dateStr}`;
    inventoryOps.push({
      updateOne: {
        filter: { _id },
        update: { $set: { inventory } },
        upsert: true,
      },
    });
  }
  try {
    await InventoryData.bulkWrite(inventoryOps);
    return res.status(200).json({ message: "Updated successfully", data: null });
  } catch (error) {}
}

export { updateInventory, updateBulkInventory };
