import dayjs from "dayjs";
import Package from "../models/Package.js";
import { addInventory, addRate, toggleAvailability } from "../seed/xmlSeed.js";
import axios from "axios";
import { AVAILABILITY, INVENTORY, RATE } from "../seed/googleEndpoints.js";
import config from "../config/config.js";
import _googleResponseError from "../utils/_googleResponseError.js";
import _googleError from "../utils/_googleError.js";
async function updateARI(req, res) {
  const {
    hotelId,
    roomId,
    packageId,
    date,
    data: { rate, inventory, availability },
  } = req.body;

  const _googleDate = dayjs(date).format("YYYY-MM-DD");
  const _googlePrice = addRate({
    hotelId,
    roomId,
    packageId,
    startDate: _googleDate,
    endDate: _googleDate,
    amountBeforeTax: rate,
  });

  const _googleInventory = addInventory({
    hotelId,
    roomId,
    startDate: _googleDate,
    endDate: _googleDate,
    inventory: inventory,
  });

  const _googleAvailability = toggleAvailability({
    hotelId,
    roomId,
    packageId,
    startDate: _googleDate,
    endDate: _googleDate,
    available: availability,
  });

  const _googlePriceRequest = axios.post(RATE, _googlePrice, config.FETCH_OPTIONS);
  const _googleInventoryRequest = axios.post(INVENTORY, _googleInventory, config.FETCH_OPTIONS);
  const _googleAvailabilityRequest = axios.post(AVAILABILITY, _googleAvailability, config.FETCH_OPTIONS);

  try {
    const responses = await Promise.all([_googlePriceRequest, _googleInventoryRequest, _googleAvailabilityRequest]);
    const { ERROR, STATUS, MESSAGE } = _googleResponseError(responses, true);
    if (ERROR) {
      return res.status(STATUS).json({ message: MESSAGE });
    }
  } catch (error) {
    return res.status(500).json({ message: _googleError(error) });
  }

  try {
    const _package = await Package.findById(packageId);
    const data = _package.data;
    if (data.get(dayjs(date).format("YYYY/MM/DD")) == undefined) {
      data.set(dayjs(date).format("YYYY/MM/DD"), [rate, availability, inventory]);
    } else {
      const dataArray = data.get(dayjs(date).format("YYYY/MM/DD"));
      dataArray[0] = rate;
      dataArray[1] = availability;
      dataArray[2] = inventory;
    }
    _package.markModified("data");
    await _package.save();
    return res.status(200).json({ message: "Updated Successfully", data: _package });
  } catch (error) {}
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
  const _googleAvailabilityRequest = axios.post(AVAILABILITY, _googleAvailability, config.FETCH_OPTIONS);

  try {
    const responses = await Promise.all([_googlePriceRequest, _googleInventoryRequest, _googleAvailabilityRequest]);
    const { ERROR, STATUS, MESSAGE } = _googleResponseError(responses, true);
    if (ERROR) {
      return res.status(STATUS).json({ message: MESSAGE });
    }
  } catch (error) {
    return res.status(500).json({ message: _googleError(error) });
  }

  try {
    const _package = await Package.findById(packageId);
    const data = _package.data;
    for (let curDate = new Date(startDate); curDate <= new Date(endDate); curDate.setDate(curDate.getDate() + 1)) {
      if (data.get(dayjs(curDate).format("YYYY/MM/DD")) == undefined) {
        data.set(dayjs(curDate).format("YYYY/MM/DD"), [rate, availability, inventory]);
      } else {
        const dataArray = data.get(dayjs(curDate).format("YYYY/MM/DD"));
        dataArray[0] = rate;
        dataArray[1] = availability;
        dataArray[2] = inventory;
      }
    }
    _package.markModified("data");
    await _package.save();
    return res.status(200).json({ message: "Updated successfully", data: _package });
  } catch (error) {}
}

export { updateARI, updateBulkARI };
