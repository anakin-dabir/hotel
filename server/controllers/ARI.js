import dayjs from "dayjs";
import Package from "../models/Package.js";
import { addInventory, addRate, toggleAvailability } from "../seed/xmlSeed.js";
import axios from "axios";
import { AVAILABILITY, INVENTORY, RATE } from "../seed/googleEndpoints.js";
import config from "../config/config.js";
import _googleResponseError from "../utils/_googleResponseError.js";
import _googleError from "../utils/_googleError.js";
import InventoryData from "../models/InventoryData.js";
import PackageData from "../models/PackageData.js";

async function updateARI(req, res) {
  const {
    hotelId,
    roomId,
    packageId,
    date,
    data: { rate, inventory, availability },
  } = req.body;

  const _date = dayjs(date).format("YYYY-MM-DD");
  const _googlePrice = addRate({
    hotelId,
    roomId,
    packageId,
    startDate: _date,
    endDate: _date,
    amountBeforeTax: rate,
  });

  const _googleInventory = addInventory({
    hotelId,
    roomId,
    startDate: _date,
    endDate: _date,
    inventory: inventory,
  });

  const _googleAvailability = toggleAvailability({
    hotelId,
    roomId,
    packageId,
    startDate: _date,
    endDate: _date,
    available: availability,
  });

  const _googlePriceRequest = axios.post(RATE, _googlePrice, config.FETCH_OPTIONS);
  const _googleInventoryRequest = axios.post(INVENTORY, _googleInventory, config.FETCH_OPTIONS);
  const _googleAvailabilityRequest = axios.post(
    AVAILABILITY,
    _googleAvailability,
    config.FETCH_OPTIONS
  );

  try {
    const responses = await Promise.all([
      _googlePriceRequest,
      _googleInventoryRequest,
      _googleAvailabilityRequest,
    ]);
    const { ERROR, STATUS, MESSAGE } = _googleResponseError(responses, true);
    if (ERROR) {
      return res.status(STATUS).json({ message: MESSAGE });
    }
  } catch (error) {
    return res.status(500).json({ message: _googleError(error) });
  }

  try {
    await Promise.all([
      InventoryData.updateOne(
        { _id: `${roomId}_${_date}` },
        { $set: { inventory } },
        { upsert: true }
      ),
      PackageData.updateOne(
        { _id: `${packageId}_${_date}` },
        { $set: { availability, price: rate } },
        { upsert: true }
      ),
    ]);
    return res.status(200).json({ message: "Updated Successfully", data: null });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update ARI" });
  }
}

async function updateBulkARI(req, res) {
  const {
    hotelId,
    roomId,
    packageId,
    date: { startDate, endDate },
    data: { rate, availability, inventory },
  } = req.body;

  const _googleStartDate = dayjs(startDate).format("YYYY-MM-DD");
  const _googleEndDate = dayjs(endDate).format("YYYY-MM-DD");
  const _googlePrice = addRate({
    roomId,
    startDate: _googleStartDate,
    endDate: _googleEndDate,
    packageId: packageId,
    amountBeforeTax: rate,
    hotelId,
  });

  const _googleInventory = addInventory({
    roomId,
    startDate: _googleStartDate,
    endDate: _googleEndDate,
    inventory: inventory,
    hotelId,
  });

  const _googleAvailability = toggleAvailability({
    roomId,
    startDate: _googleStartDate,
    endDate: _googleEndDate,
    packageId,
    available: availability,
    hotelId,
  });

  const _googlePriceRequest = axios.post(RATE, _googlePrice, config.FETCH_OPTIONS);
  const _googleInventoryRequest = axios.post(INVENTORY, _googleInventory, config.FETCH_OPTIONS);
  const _googleAvailabilityRequest = axios.post(
    AVAILABILITY,
    _googleAvailability,
    config.FETCH_OPTIONS
  );

  try {
    const responses = await Promise.all([
      _googlePriceRequest,
      _googleInventoryRequest,
      _googleAvailabilityRequest,
    ]);
    const { ERROR, STATUS, MESSAGE } = _googleResponseError(responses, true);
    if (ERROR) {
      return res.status(STATUS).json({ message: MESSAGE });
    }
  } catch (error) {
    return res.status(500).json({ message: _googleError(error) });
  }

  let inventoryOps = [];
  let packageOps = [];
  for (let date = dayjs(startDate); !date.isAfter(dayjs(endDate)); date = date.add(1, "day")) {
    const dateStr = date.format("YYYY-MM-DD");
    const _id = `${packageId}_${dateStr}`;
    const inventoryId = `${roomId}_${dateStr}`;
    inventoryOps.push({
      updateOne: {
        filter: { _id: inventoryId },
        update: { $set: { inventory } },
        upsert: true,
      },
    });
    packageOps.push({
      updateOne: {
        filter: { _id },
        update: { $set: { availability, price: rate } },
        upsert: true,
      },
    });
  }
  try {
    await Promise.all([InventoryData.bulkWrite(inventoryOps), PackageData.bulkWrite(packageOps)]);
    return res.status(200).json({ message: "Updated successfully", data: null });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update bulk ARI" });
  }
}

export { updateARI, updateBulkARI };
